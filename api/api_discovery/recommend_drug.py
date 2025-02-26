from flask import request, jsonify
import logging
import safrs
from database import models

db = safrs.DB 
session = db.session 

app_logger = logging.getLogger("api_logic_server_app")

def add_service(app, api, project_dir, swagger_host: str, PORT: str, method_decorators ):
    pass

def recommend_drug(row, old_row):
    # This is a placeholder for the recommend_drug rule
    # This rule will recommend a drug based on the patient's reading
    # patient data age, sex, weight, creatine, labs, and medications
    r = models.Recommendation()
    r.patient_id = row.patient_id
    r.reading_id = row.id
    r.time_of_reading = row.time_of_reading
    #r.drug = "Insulin"  
    r.dosage = 10.0
    r.dosage_unit = "mg"
    r.drug_id = 1
    r.recommendation_date = row.reading_date
    session.add(r)
    app_logger.info("recommend_drug")