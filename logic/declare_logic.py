import datetime, os
from decimal import Decimal
from logic_bank.exec_row_logic.logic_row import LogicRow
from logic_bank.extensions.rule_extensions import RuleExtension
from logic_bank.logic_bank import Rule
from logic_bank.logic_bank import DeclareRule
import database.models as models
import api.system.opt_locking.opt_locking as opt_locking
from security.system.authorization import Grant, Security
from logic.load_verify_rules import load_verify_rules
import integration.kafka.kafka_producer as kafka_producer
import logging

app_logger = logging.getLogger(__name__)

declare_logic_message = "ALERT:  *** No Rules Yet ***"  # printed in api_logic_server.py

def declare_logic():
    ''' Declarative multi-table derivations and constraints, extensible with Python.
 
    Brief background: see readme_declare_logic.md
    
    Your Code Goes Here - Use code completion (Rule.) to declare rules
    '''

    if os.environ.get("WG_PROJECT"):
        # Inside WG: Load rules from docs/expprt/export.json
        load_verify_rules()
    else:
        # Outside WG: load declare_logic function
        from logic.logic_discovery.auto_discovery import discover_logic
        discover_logic()

    def handle_all(logic_row: LogicRow):  # #als: TIME / DATE STAMPING, OPTIMISTIC LOCKING
        """
        This is generic - executed for all classes.

        Invokes optimistic locking, and checks Grant permissions.

        Also provides user/date stamping.

        Args:
            logic_row (LogicRow): from LogicBank - old/new row, state
        """

        if os.getenv("APILOGICPROJECT_NO_FLASK") is not None:
            print("\ndeclare_logic.py Using TestBase\n")
            return  # enables rules to be used outside of Flask, e.g., test data loading

        if logic_row.is_updated() and logic_row.old_row is not None and logic_row.nest_level == 0:
            opt_locking.opt_lock_patch(logic_row=logic_row)

        Grant.process_updates(logic_row=logic_row)

        did_stamping = False
        if enable_stamping := False:  # #als:  DATE / USER STAMPING
            row = logic_row.row
            if logic_row.ins_upd_dlt == "ins" and hasattr(row, "CreatedOn"):
                row.CreatedOn = datetime.datetime.now()
                did_stamping = True
            if logic_row.ins_upd_dlt == "ins" and hasattr(row, "CreatedBy"):
                row.CreatedBy = Security.current_user().id
                #    if Config.SECURITY_ENABLED == True else 'public'
                did_stamping = True
            if logic_row.ins_upd_dlt == "upd" and hasattr(row, "UpdatedOn"):
                row.UpdatedOn = datetime.datetime.now()
                did_stamping = True
            if logic_row.ins_upd_dlt == "upd" and hasattr(row, "UpdatedBy"):
                row.UpdatedBy = Security.current_user().id  \
                    if Config.SECURITY_ENABLED == True else 'public'
                did_stamping = True
            if did_stamping:
                logic_row.log("early_row_event_all_classes - handle_all did stamping")     
    Rule.early_row_event_all_classes(early_row_event_all_classes=handle_all)

    Rule.constraint(validate=models.Contraindication, as_condition=lambda row: row.drug_id_1 != row.drug_id_2, error_msg="Drug_1 and Drug_2 must be different")
    #als rules report
    from api.system import api_utils
    # api_utils.rules_report()
    def insert_reading_history(row: models.Reading, old_row: models.Reading, logic_row: LogicRow):
        from api.api_discovery.insert_history import insert_reading_history
        insert_reading_history(row, old_row)
    
    def fn_recommend_insulin(row: models.Reading, old_row: models.Reading, logic_row: LogicRow):
        from api.api_discovery.recommend_drug import recommend_insulin_drug
        recommend_insulin_drug(row, old_row, logic_row)
        
    def fn_recommend_drug(row: models.Reading, old_row: models.Reading, logic_row: LogicRow):
        from api.api_discovery.recommend_drug import recommend_drug
        recommend_drug(row, old_row,logic_row)
        
    def calculate_age(row: models.Patient, old_row: models.Patient, logic_row: LogicRow):
        birth_date = row.birth_date
        today = datetime.datetime.now()  # Get today's date
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return age
    
    Rule.formula(derive=models.Patient.age, calling=calculate_age)
    Rule.constraint(validate=models.Patient, as_condition=lambda row: row.age >= 18, error_msg="Patient must be 18 or older")
    
    Rule.copy(derive=models.Dosage.drug_name, from_parent=models.Drug.drug_name)
    Rule.copy(derive=models.Dosage.drug_type, from_parent=models.Drug.drug_type)
    #Rule.commit_row_event(on_class=models.Reading, calling=fn_recommend_drug)
    Rule.after_flush_row_event(on_class=models.ReadingHistory, calling=fn_recommend_drug)
    Rule.after_flush_row_event(on_class=models.Reading, calling=fn_recommend_insulin)
    app_logger.debug("..logic/declare_logic.py (logic == rules + code)")

