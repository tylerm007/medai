from functools import wraps
import logging
import api.system.api_utils as api_utils
import contextlib
import yaml
from pathlib import Path
from flask_cors import cross_origin
import safrs
from flask import request, jsonify
from flask_jwt_extended import get_jwt, jwt_required, verify_jwt_in_request
from safrs import jsonapi_rpc
from database import models
import json
import sys
from sqlalchemy import text, select, update, insert, delete
from sqlalchemy.orm import load_only
import sqlalchemy
import requests
from datetime import date
from config.config import Args
from config.config import Config
import os
from pathlib import Path
from api.system.expression_parser import parsePayload
from api.system.gen_pdf_report import gen_report
from api.system.gen_csv_report import gen_report as csv_gen_report
from api.system.gen_pdf_report import export_pdf
#from api.gen_xlsx_report import xlsx_gen_report

# This is the Ontimize Bridge API - all endpoints will be prefixed with /ontimizeweb/services/rest
# called by api_logic_server_run.py, to customize api (new end points, services).
# separate from expose_api_models.py, to simplify merge if project recreated
# version 11.x - api_logic_server_cli/prototypes/ont_app/prototype/api/api_discovery/ontimize_api.py

app_logger = logging.getLogger(__name__)

db = safrs.DB 
session = db.session 
_project_dir = None
class DotDict(dict):
    """ dot.notation access to dictionary attributes """
    # thanks: https://stackoverflow.com/questions/2352181/how-to-use-a-dot-to-access-members-of-dictionary/28463329
    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__


def add_service(app, api, project_dir, swagger_host: str, PORT: str, method_decorators = []):
    pass
    
#def expose_services(app, api, project_dir, swagger_host: str, PORT: str):
    # sourcery skip: avoid-builtin-shadow
    """ Ontimize API - new end points for services 
    
        Brief background: see readme_customize_api.md
    
    """
    _project_dir = project_dir
    app_logger.debug("api/api_discovery/ontimize_api.py - services for ontimize") 

    
    def admin_required():
        """
        Support option to bypass security (see cats, below).
        """
        def wrapper(fn):
            @wraps(fn)
            def decorator(*args, **kwargs):
                if Args.instance.security_enabled == False:
                    return fn(*args, **kwargs)
                verify_jwt_in_request(True)  # must be issued if security enabled
                return fn(*args, **kwargs)
            return decorator
        return wrapper

    
    def gen_export(request) -> any:
        payload = json.loads(request.data) if request.data != b'' else {}
        type = payload.get("type") or "csv"
        entity = payload.get("dao") 
        queryParm = payload.get("queryParm") or {}
        columns = payload.get("columns") or []
        columnTitles = payload.get("columnTitles") or []
        if not entity:
            return jsonify({})
        resource = find_model(entity)
        api_clz = resource["model"]
        resources = getMetaData(api_clz.__name__)
        attributes = resources["resources"][api_clz.__name__]["attributes"]
        if type in ["csv",'CSV']:
            return csv_gen_report(api_clz, request, entity, queryParm, columns, columnTitles, attributes) 
        elif type == "pdf": 
            payload["entity"] = entity
            return export_pdf(api_clz, request, entity, queryParm, columns, columnTitles, attributes) 
        #elif type == "xlsx":
        #    return xlsx_gen_report(api_clz, request, entity, queryParm, columns, columnTitles, attributes)
        
        return jsonify({"code":1,"message":f"Unknown export type {type}","data":None,"sqlTypes":None})   
    
    
    def _gen_report(request) -> any:
        payload = json.loads(request.data)

        if len(payload) == 3:
            return jsonify({})
        
        entity = payload["entity"]
        resource = find_model(entity)
        api_clz = resource["model"]
        resources = getMetaData(api_clz.__name__)
        attributes = resources["resources"][api_clz.__name__]["attributes"]
    
        return gen_report(api_clz, request, _project_dir, payload, attributes)
    @app.route("/api/export/csv", methods=['POST','OPTIONS'])
    @app.route("/api/export/pdf", methods=['POST','OPTIONS'])
    @app.route("/ontimizeweb/services/rest/export/pdf", methods=['POST','OPTIONS'])
    @app.route("/ontimizeweb/services/rest/export/csv", methods=['POST','OPTIONS'])
    @cross_origin()
    @admin_required()
    def export():
        print(f"export {request.path}")
        #if request.method == "OPTIONS":
        #    return jsonify(success=True)
        return gen_export(request)
    
    @app.route("/api/dynamicjasper", methods=['POST','OPTIONS'])
    @app.route("/ontimizeweb/services/rest/dynamicjasper", methods=['POST','OPTIONS'])
    @cross_origin()
    @admin_required()
    def dynamicjasper():
        if request.method == "OPTIONS":
            return jsonify(success=True)
        return _gen_report(request)
    
    @app.route("/api/bundle", methods=['POST','OPTIONS'])
    @app.route("/ontimizeweb/services/rest/bundle", methods=['POST','OPTIONS'])
    @cross_origin()
    @admin_required()
    def bundle():
        if request.method == "OPTIONS":
            return jsonify(success=True)
        return jsonify({"code":0,"data":{},"message": None})
    
    # Ontimize apiEndpoint path for all services
    @app.route("/ontimizeweb/services/rest/<path:path>", methods=['GET','POST','PUT','PATCH','DELETE','OPTIONS'])
    @cross_origin(supports_credentials=True)
    @admin_required()
    def api_search(path):
        s = path.split("/")
        clz_name = s[0]
        clz_type = None if len(s) == 1 else s[1] #[2] TODO customerType search advancedSearch defer(photo)customerTypeAggregate
        isSearch = s[len(s) -1] == "search"
        method = request.method
        rows = []
        #CORS 
        if method == "OPTIONS":
            return jsonify(success=True)
        
        if clz_name == "endsession":
            from flask import g
            sessionid = request.args.get("sessionid")
            if "access_token" in g and g.access_token == sessionid:
                g.pop("access_token")
            return jsonify({"code":0,"data":{},"message": None})
        
        if clz_name == "dynamicjasper":
            return _gen_report(request)
        
        if clz_name in ["listReports", "bundle", "reportstore"]:
            return jsonify({"code":0,"data":{},"message": None})
        
        if clz_name == "export":
            return gen_export(request)
        
        if request.path == '/ontimizeweb/services/rest/users/login':
            return login(request)
        
        #api_clz = api_map.get(clz_name)
        resource = find_model(clz_name)
        if resource == None:
            return jsonify(
                {"code": 1, "message": f"Resource {clz_name} not found", "data": None}
            )
        api_attributes = resource["attributes"]
        api_clz = resource["model"]
        
        payload = '{}' if request.data == b'' else json.loads(request.data)
        expressions, filter, columns, sqltypes, offset, pagesize, orderBy, data = parsePayload(api_clz, payload)
        result = {}
        if method == 'GET':
            pagesize = 999 #if isSearch else pagesize
            return get_rows(request, api_clz, filter, orderBy, columns, pagesize, offset)
        
        if method in ['PUT','PATCH']:
            sql_alchemy_row = session.query(api_clz).filter(text(filter)).one()
            for key in DotDict(data):
                setattr(sql_alchemy_row, key , DotDict(data)[key])
            session.add(sql_alchemy_row)
            result = sql_alchemy_row
            #stmt = update(api_clz).where(text(filter)).values(data)
            
        if method == 'DELETE':
            #stmt = delete(api_clz).where(text(filter))
            sql_alchemy_row = session.query(api_clz).filter(text(filter)).one()
            session.delete(sql_alchemy_row)
            result = sql_alchemy_row
            
        if method == 'POST':
            if data != None:
                #this is an insert
                sql_alchemy_row = api_clz()
                row = DotDict(data)
                for attr in api_attributes:
                    name = attr["name"]
                    if getattr(row, name) != None:
                        setattr(sql_alchemy_row, name , row[name])
                session.add(sql_alchemy_row)
                result = sql_alchemy_row
                #stmt = insert(api_clz).values(data)
                
            else:
                #GET (sent as POST)
                #rows = get_rows_by_query(api_clz, filter, orderBy, columns, pagesize, offset)
                if "TypeAggregate" in clz_type:
                    return get_rows_agg(request, api_clz, clz_type, filter, columns)
                else:
                    pagesize = 999 # if isSearch else pagesize
                    return get_rows(request, api_clz, None, orderBy, columns, pagesize, offset)
        try:        
            session.commit()
            session.flush()
            if clz_name == "Patient" and method in ["POST","PATCH"]:
                # special case for Patient with Readings
                patient_id = getattr(sql_alchemy_row,"id", None)
                
                if patient_id is not None and "readings" in data and len(data["readings"]) > 0:
                    insertReading(data["readings"], patient_id=patient_id)
                    
                if patient_id is not None and "latestReadings" in data and len(data["latestReadings"]) > 0:
                    updateReading(data["LatestReadings"], patient_id=patient_id)
                    
                if patient_id is not None and "medications" in data and len(data["medications"]) > 0:
                    insertMedication(data, patient_id=patient_id)
                    
                if patient_id is not None and "insulinData" in data and len(data["insulinData"]) > 0:
                    insertInsulin(data, patient_id=patient_id)
                
        except Exception as ex:
            session.rollback()
            msg = f"{ex.message if hasattr(ex, 'message') else ex}"
            app_logger.error(f"Error in {method} for {clz_name}: {msg}")
            return jsonify(
                {"code": 1, "message": f"{msg}", "data": [], "sqlTypes": None}
            ) 
            
        return jsonify({"code":0,"message":f"{method}:True","data":result,"sqlTypes":None}) 

    def insertInsulin(data, patient_id):
        insulin_date = insulin["date"] if "date" in insulin and insulin["date"] is not None else date.today().strftime('%Y-%m-%d')
        updateRow = session.query(models.Insulin).filter(models.Insulin.patient_id == patient_id and models.Insulin.reading_date == insulin_date).one_or_none()
        for insulin in data["insulinData"] : 
            row = models.Insulin() if updateRow is None else updateRow
            row.patient_id = patient_id
            row.drug_type = insulin["drug_type"] if "drug_type" in insulin and insulin["drug_type"] is not None else ''
            row.reading_date = insulin_date
            row.breakfast = insulin["breakfast"] if "breakfast" in insulin and insulin["breakfast"] is not None else 0
            row.lunch = insulin["lunch"] if "lunch" in insulin and insulin["lunch"] is not None else 0
            row.dinner = insulin["dinner"] if "dinner" in insulin and insulin["dinner"] is not None else 0
            row.bedtime = insulin["bedtime"] if "bedtime" in insulin and insulin["bedtime"] is not None else 0
            session.add(row)
            try:
                session.commit()
                session.flush()  
            except Exception as ex:
                app_logger.error(f"Error inserting insulin for patient {patient_id}: {ex}")
        
    def insertMedication(data, patient_id):
        for medication in data["medications"] : 
            recommendation_date = medication["date"].split(" ")[0] if "date" in medication and medication["date"] is not None else date.today().strftime('%Y-%m-%d')
            drug = medication["drug"] if "drug" in medication and medication["drug"] is not None else 0  
            drug_id = getDrugId(drug)         
            
            for time_of_reading in ['breakfast', 'lunch', 'dinner']:
                value = medication.get(time_of_reading, "-")
                if value == "-":
                    continue
                updateRow = session.query(models.Recommendation).filter(
                    models.Recommendation.patient_id == patient_id,
                    models.Recommendation.recommendation_date == recommendation_date,
                    models.Recommendation.drug_id == drug_id,
                    models.Recommendation.time_of_reading == time_of_reading
                ).one_or_none()
    
                row = models.Recommendation() if updateRow is None else updateRow
                row.patient_id = patient_id
                row.recommendation_date = recommendation_date
                setattr(row, "time_of_reading", time_of_reading)
                row.dosage = int(value.split(" ")[0])
                row.drug_id = drug_id
                #row.drug = drug
                row.dosage_unit = value.split(" ")[1] if len(value) > 1 else 'unit'
                session.add(row)
                try:
                    session.commit()
                    session.flush()  
                except Exception as ex:
                    app_logger.error(f"Error inserting recommendation for patient {patient_id}: {ex}")
            
    def getDrugId(drug) -> int:   
        if drug == "Lispro":
            return 5 #TODO - get drug id from database, hardcoded for now
        elif drug == "Farxiga":
            return 6
        elif drug == "Metformin":
            return 1
        elif drug == "Glimepiride":
            return 2
        elif  drug == "Ozempic":
            return 7
        elif drug == "Tradjenta":
            return 3
        elif drug == "Glargine":
            return 4
        return 0 #TODO - get drug id from database, hardcoded for now
    
    def updateReading(readings, patient_id):
        for reading in readings : 
            reading_row = models.Reading()
            reading_row.patient_id = patient_id
            reading_row.reading_value = int(reading["reading_value"]) if "reading_value" in reading and reading["reading_value"] is not None else 0
            reading_row.time_of_reading = reading["time_of_reading"]
            reading_row.reading_date = reading["reading_date"] if "reading_date" in reading and reading["reading_date"] is not None else date.today().strftime('%Y-%m-%d')
            session.add(reading_row)
            try:
                session.commit()
                session.flush()  #{f"{method}":True})
            except Exception as ex:
                app_logger.error(f"Error inserting reading for patient {patient_id}: {ex}")
    def insertReading(readings, patient_id):
        for reading in readings : 
            reading_row = models.Reading()
            reading_row.patient_id = patient_id
            reading_row.reading_value = int(reading["value"]) if "value" in reading and reading["value"] is not None else 0
            reading_row.time_of_reading = reading["time"]
            reading_row.reading_date = reading["date"] if "date" in reading and reading["date"] is not None else date.today().strftime('%Y-%m-%d')
            session.add(reading_row)
            try:
                session.commit()
                session.flush()  #{f"{method}":True})
            except Exception as ex:
                app_logger.error(f"Error inserting reading for patient {patient_id}: {ex}")
    
    def find_model(clz_name:str) -> any:
        clz_members = getMetaData()
        resources = clz_members.get("resources")
        for resource in resources:
            if resource == clz_name:
                return resources[resource]
        return None
    
    def login(request):
        url = f"{request.scheme}://{request.host}/api/auth/login"
        # no data is passed - uses basic auth in header
        #requests.post(url=url, headers=request.headers, json = {})
        username = ''
        password = ''
        auth = request.headers.get("Authorization", None)
        if auth and auth.startswith("Basic"):  # support basic auth
            import base64
            base64_message = auth[6:]
            print(f"auth found: {auth}")
            #base64_message = 'UHl0aG9uIGlzIGZ1bg=='
            base64_bytes = base64_message.encode('ascii')
            message_bytes = base64.b64decode(base64_bytes)
            message = message_bytes.decode('ascii')
            s = message.split(":")
            username = s[0]
            password = s[1]
        from security.authentication_provider.abstract_authentication_provider import Abstract_Authentication_Provider
        from security.system.authentication import create_access_token
        
        authentication_provider : Abstract_Authentication_Provider = Config.SECURITY_PROVIDER 
        if not authentication_provider:
            return jsonify({"code":1,"message":"No authentication provider configured"}), 401
        user = authentication_provider.get_user(username, password)
        if not user or not authentication_provider.check_password(user = user, password = password):
            return jsonify({"code":1,"message":"Wrong username or password"}), 401
        
        access_token = create_access_token(identity=user)  # serialize and encode
        from flask import g
        g.access_token = access_token
        #return jsonify(access_token=access_token)
        return jsonify({"code":0,"message":"Login Successful","data":{"access_token":access_token}})
    
    def get_rows_agg(request: any, api_clz, agg_type, filter, columns):
        key = api_clz.__name__
        resources = getMetaData(key)
        attributes = resources["resources"][key]["attributes"]
        list_of_columns = ""
        sep = ""
        attr_list = list(api_clz._s_columns)
        table_name = api_clz._s_type
        #api_clz.__mapper__.attrs #TODO map the columns to the attributes to build the select list
        for a in attributes:
            name = a["name"]
            t = a["type"] #INTEGER or VARCHAR(N)
            #list_of_columns.append(api_clz._sa_class_manager.get(n))
            attr = a["attr"]
            #MAY need to do upper case compares
            if name in columns:
                list_of_columns = f'{list_of_columns}{sep}{name}'
                sep = ","
        sql = f' count(*), {list_of_columns} from {table_name} group by {list_of_columns}'
        print(sql)
        # TODO HARDCODED for now....
        data = {}
        if "customerTypeAggregate" == agg_type:
            data = {"data": [
                {
                    "AMOUNT": 24,
                    "DESCRIPTION": "Normal"
                },
                {
                    "AMOUNT": 15,
                    "DESCRIPTION": "VIP"
                },
                {
                    "AMOUNT": 36,
                    "DESCRIPTION": "Other"
                }
            ]
            }
        elif "accountTypeAggregate" == agg_type:
            data = {"data": [
                {
                    "AMOUNT": 32,
                    "ACCOUNTTYPENAME": "Savings",
                    "ACCOUNTTYPEID": 1
                },
                {
                    "AMOUNT": 36,
                    "ACCOUNTTYPENAME": "Checking",
                    "ACCOUNTTYPEID": 0
                },
                {
                    "AMOUNT": 30,
                    "ACCOUNTTYPENAME": "Payroll",
                    "ACCOUNTTYPEID": 3
                },
                {
                    "AMOUNT": 23,
                    "ACCOUNTTYPENAME": "Market",
                    "ACCOUNTTYPEID": 2
                }
            ]
            }
        elif "employeeTypeAggregate" == agg_type:
            data = {"data": [
                {
                    "AMOUNT": 27,
                    "EMPLOYEETYPENAME": "Manager"
                },
                {
                    "AMOUNT": 485,
                    "EMPLOYEETYPENAME": "Employee"
                }
            ]
            }
        data["code"] = 0
        data["message"] = ""
        data["sqlType"] = {}
        #rows = session.query(text(sql)).all()
        #rows = session.query(models.Account.ACCOUNTTYPEID,func.count(models.Account.AccountID)).group_by(models.Account.ACCOUNTTYPEID).all()
        return data
    
    def get_rows(request: any, api_clz, filter: str, order_by: str, columns: list, pagesize: int, offset: int):
        # New Style
        key = api_clz.__name__.lower()
        resources = getMetaData(api_clz.__name__)
        attributes = resources["resources"][api_clz.__name__]["attributes"]
        list_of_columns = []
        for a in attributes:
            name = a["name"]
            col = a["attr"].columns[0] 
            desc = col.description
            t = a["type"] #INTEGER or VARCHAR(N)
            #MAY need to do upper case compares
            if desc in columns:
                list_of_columns.append((col,name))
            else:
                if name in columns:
                    list_of_columns.append(name)
                
        from api.system.custom_endpoint import CustomEndpoint
        request.method = 'GET'
        r = CustomEndpoint(model_class=api_clz, fields=list_of_columns, filter_by=filter, pagesize=pagesize, offset=offset)
        result = r.execute(request=request)
        service_type: str = Config.ONTIMIZE_SERVICE_TYPE
        return r.transform(service_type, key, result) # JSONAPI or LAC or OntimizeEE ARGS.service_type
    
    def get_rows_by_query(api_clz, filter, orderBy, columns, pagesize, offset):
        #Old Style
        rows = []
        results = session.query(api_clz) # or list of columns?
                    
        if columns:
            #stmt = select(api_clz).options(load_only(Book.title, Book.summary))
            pass #TODO
        
        if orderBy:
            results = results.order_by(text(parseOrderBy(orderBy)))

        if filter:
            results = results.filter(text(filter)) 
            
        results = results.limit(pagesize) \
            .offset(offset) 
        
        for row in results.all():
            rows.append(row.to_dict())
        
        return rows
                    
    def parseData(data:dict = None) -> str:
        # convert dict to str
        result = ""
        join = ""
        if data:
            for d in data:
                result += f'{join}{d}="{data[d]}"'
                join = ","
        return result
    
    def parseOrderBy(orderBy) -> str:
        #[{'columnName': 'SURNAME', 'ascendent': True}]
        result = ""
        if orderBy and len(orderBy) > 0:
            result = f"{orderBy[0]['columnName']}" #TODO for desc
        return result
    
    def fix_payload(data, sqltypes):
        import datetime 
        if sqltypes:
            for t in sqltypes:
                if sqltypes[t] == 91: #Date
                    with contextlib.suppress(Exception):
                        my_date = float(data[t])/1000
                        data[t] = datetime.datetime.fromtimestamp(my_date) #.strftime('%Y-%m-%d %H:%M:%S')
        """
        Converts SQLAlchemy result (mapped or raw) to dict array of un-nested rows

        Args:
            result (object): list of serializable objects (e.g., dict)

        Returns:
            list of rows as dicts
        """
        rows = []
        for each_row in result:
            row_as_dict = {}
            print(f'type(each_row): {type(each_row)}')
            if isinstance (each_row, sqlalchemy.engine.row.Row):  # raw sql, eg, sample catsql
                key_to_index = each_row._key_to_index             # note: SQLAlchemy 2 specific
                for name, value in key_to_index.items():
                    row_as_dict[name] = each_row[value]
            else:
                row_as_dict = each_row.to_dict()                  # safrs helper
            rows.append(row_as_dict)
        return rows

def getMetaData(resource_name:str = None, include_attributes: bool = True) -> dict:
        import inspect
        import sys
        resource_list = []  # array of attributes[], name (so, the name is last...)
        resource_objs = {}  # objects, named = resource_name

        models_name = "database.models"
        cls_members = inspect.getmembers(sys.modules["database.models"], inspect.isclass)
        for each_cls_member in cls_members:
            each_class_def_str = str(each_cls_member)
            if (f"'{models_name}." in each_class_def_str and
                            "Ab" not in each_class_def_str):
                each_resource_name = each_cls_member[0]
                each_resource_class = each_cls_member[1]
                each_resource_mapper = each_resource_class.__mapper__
                if resource_name is None or resource_name == each_resource_name:
                    resource_object = {"name": each_resource_name}
                    resource_list.append(resource_object)
                    resource_objs[each_resource_name] = {}
                    if include_attributes:
                        attr_list = []
                        for each_attr in each_resource_mapper.attrs:
                            if not each_attr._is_relationship:
                                try:
                                    attribute_object = {"name": each_attr.key,
                                                        "attr": each_attr,
                                                        "type": str(each_attr.expression.type)}
                                except Exception as ex:
                                    attribute_object = {"name": each_attr.key,
                                                        "exception": f"{ex}"}
                                attr_list.append(attribute_object)
                        resource_object["attributes"] = attr_list
                        resource_objs[each_resource_name] = {"attributes": attr_list, "model": each_resource_class}
        # pick the format you like
        #return_result = {"resources": resource_list}
        return_result = {"resources": resource_objs}
        return return_result