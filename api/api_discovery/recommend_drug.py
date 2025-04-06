from flask import request, jsonify
import logging
import safrs
from database import models
from logic_bank.exec_row_logic.logic_row import LogicRow

db = safrs.DB
session = db.session

app_logger = logging.getLogger("api_logic_server_app")

def add_service(app, api, project_dir, swagger_host: str, PORT: str, method_decorators ):
    pass

def recommend_drug(row:models.ReadingHistory, old_row:models.ReadingHistory, logic_row:LogicRow):
    # This is a placeholder for the recommend_drug rule
    # This rule will recommend a drug based on the patient's reading
    # patient data age, sex, weight, creatine, labs, and medications
    app_logger.info(f"Recommendation for patient {row.patient.name} at {row.reading_date}")
    
    dosage = metformin(row)
    drug_id = 1
    create_recommendation(row, dosage, drug_id ,"breakfast",logic_row, "metformin")
    create_recommendation(row, dosage, drug_id ,"dinner", logic_row, "metformin")
    
    dosage = glimepiride(row)
    drug_id = 2
    create_recommendation(row, dosage, drug_id ,"breakfast", logic_row, "glimepiride")
    
    dosage = tradjenta(row)
    drug_id = 3
    create_recommendation(row, dosage, drug_id ,"breakfast", logic_row ,"tradjenta")
    
    dosage = ozempic(row)
    drug_id = 7
    create_recommendation(row, dosage, drug_id ,"breakfast", logic_row,"ozempic")
    
    dosage = farxiga(row)
    drug_id = 6
    create_recommendation(row, dosage, drug_id ,"breakfast", logic_row,"farxiga")
    
    dosage = _glargine(round(row.bedtime),  "bedtime")
    if dosage:
        drug_id = 4
        create_recommendation(row, dosage, drug_id ,"bedtime", logic_row,"glargine")
            
    drug_id = 5
    dosage = _lispro(row.breakfast,"breakfast", "Before_Breakfast")
    if dosage:
        create_recommendation(row, dosage, drug_id ,"breakfast", logic_row,"lispro")
    else:
        dosage = _lispro(row.lunch,"lunch", "Before_Lunch")
        if dosage:
            create_recommendation(row, dosage, drug_id ,"lunch", logic_row,"lispro")
        else:
            dosage = _lispro(row.dinner, "dinner", "Before_Dinner")
            if dosage:
                create_recommendation(row, dosage, drug_id ,"dinner", logic_row,"lispro")
    return 

def create_recommendation(row, dosage, drug_id, time_of_reading, logic_row, drug_name: str):
    r = models.Recommendation()
    r.patient_id = row.patient_id
    #r.reading_id = row.id
    r.time_of_reading =time_of_reading
    r.dosage = dosage
    r.dosage_unit = "mg"
    r.drug_id = drug_id
    r.recommendation_date = row.reading_date
    logic_row.log(f"{drug_name}")
    if r.dosage:
        logic_row.log(f"row: {row}")
        logic_row.log(f"Creating recommendation {r.drug_id} - {r.dosage} for {r.patient_id} at {r.time_of_reading}")
        try:
            from sqlalchemy import text
            db.session.execute(text(f"INSERT INTO recommendation (patient_id, time_of_reading, dosage, dosage_unit, drug_id, recommendation_date) VALUES ({r.patient_id}, '{r.time_of_reading}', {r.dosage}, '{r.dosage_unit}', {r.drug_id}, '{r.recommendation_date}')"))
        except Exception as e:
            app_logger.error(f"Error creating recommendation {e}")
    
def metformin(row: models.ReadingHistory) -> str:
    '''
    Metformin (Only given @ Morning & Evening):
    IF Blood Sugar Before Breakfast is 80-400 AND Creatinine <= 1.0 AND Weight = 100-400 AND HbA1c <= 6.5-14: 
    Prescribe Metformin 1000mg (Morning), 1000mg (Evening).
    '''
    #patient = row.Patient
    if (80 <= int(row.breakfast) <= 400) and (row.patient.creatine_mg_dl <= 1.0) and (100 <= row.patient.weight <= 400) and (6.5 <= row.patient.hba1c <= 14):
        return 1000 #"Metformin 1000mg (Morning), 1000mg (Evening)"
    return None

def glimepiride(row: models.ReadingHistory) -> str:
    '''
    IF Blood Sugar Before Breakfast is 80-400 AND Creatinine <= 1.0 AND Weight = 100-400 AND HbA1c <= 6.5-14: Prescribe Glimepiride 2mg
    '''
    if (80 <= int(row.breakfast) <= 400) and (row.patient.creatine_mg_dl <= 1.0) and (100 <= row.patient.weight <= 400) and (6.5 <= row.patient.hba1c <= 14):
        return 2 #"Glimepiride 2mg"
    return None

def tradjenta(row: models.ReadingHistory) -> str:
    '''
    IF Blood Sugar Before Breakfast is 80-400 AND Creatinine >1.0 AND Weight = 100-400 AND HbA1c <= 6.5-14: Prescribe Tradjenta 5mg.
    TODO >> If patient is already on Ozempic, then Tradjenta is  Contraindicated and vice versa
    '''
    if (80 <= int(row.breakfast) <= 400) and (row.patient.creatine_mg_dl > 1.0) and (100 <= row.patient.weight <= 400) and (6.5 <= row.patient.hba1c <= 14):
        for meds in row.patient.PatientMedicationList:
            if meds.drug_id == 7:
                # Ozempic is contraindicated with Tradjenta
                return None
        return 5 #"Tradjenta 5mg"
    return None

def ozempic(row: models.ReadingHistory) -> str:
    '''
    IF Blood Sugar Before Breakfast is 100-600 AND Creatinine 1-6
    AND Weight >180 AND HbA1c 6.5-14 : Prescribe Ozempic 1mg
    '''
    if (100 <= int(row.breakfast) <= 600) and (1 <= row.patient.creatine_mg_dl <= 6) and (row.patient.weight > 180) and (6.5 <= row.patient.hba1c <= 14):
        return 1 #"Ozempic 1mg"
    return None

def farxiga(row: models.ReadingHistory) -> str:
    '''
        Farxiga (Only given @ Evening):
        IF Creatinine >1.1- 2: Give Farxiga 10mg.
    '''
    if (1.1 <= row.patient.creatine_mg_dl <= 2):
        return 10 #"Farxiga 10mg"
    return None

def recommend_insulin_drug (row:models.Reading, old_row:models.Reading, logic_row:LogicRow):

    dosage = glargine(row)
    drug_id = 4
    if row.time_of_reading == "bedtime":
        create_recommendation(row, dosage, drug_id ,"bedtime", logic_row,"glargine")

    
    drug_id = 5
    if row.time_of_reading == "breakfast":
        dosage = lispro(row, "Before_Breakfast")
        create_recommendation(row, dosage, drug_id ,"breakfast", logic_row,"lispro")
    if row.time_of_reading == "lunch":
        dosage = lispro(row, "Before_Lunch")
        create_recommendation(row, dosage, drug_id ,"lunch", logic_row,"lispro")
    if row.time_of_reading == "dinner":
        dosage = lispro(row, "Before_Dinner")
        create_recommendation(row, dosage, drug_id ,"dinner", logic_row,"lispro")
    return  

def glargine(row: models.Reading):
    return _glargine(row.reading_value, row.time_of_reading)

def _glargine (reading_value: any ,time_of_reading: str ) -> str:
    """
    Glargine (Only given Before Bedtime):                                                                 
    Refer to Insulin dosage rule spreadsheet
    """
    reading = reading_value
    insulin = session.query(models.InsulinRule).filter(models.InsulinRule.blood_sugar_reading == "Before_Bedtime"
                and models.InsulinRule.blood_sugar_level <= reading
                and models.InsulinRule.blood_sugar_level >= reading
                ).first()
    value = insulin.glargine_before_dinner
    if value and time_of_reading == "bedtime":
        return value
    return None

def lispro(row: models.Reading, blood_sugar_reading: str) -> str:
    return _lispro(row.reading_value,row.time_of_reading, blood_sugar_reading)
    
def _lispro(reading_value, time_of_reading, blood_sugar_reading: str) -> str:
    '''
    Lispro (Only given @Before Breakfast, Before Lunch, Before Dinner):             
    Refer to Insulin dosage rule spreadsheet
    
    '''
    reading = reading_value
    insulin = session.query(models.InsulinRule).filter(models.InsulinRule.blood_sugar_reading == blood_sugar_reading
                and models.InsulinRule.blood_sugar_level <= reading
                and models.InsulinRule.blood_sugar_level >= reading
                ).first()
    if time_of_reading == "breakfast":
        value = insulin.lispro_before_breakfast
        return value
    elif time_of_reading == "lunch":
        value = insulin.lispro_before_lunch
        return value
    elif time_of_reading == "dinner":
        value = insulin.lispro_before_dinner
        return value
    return None
    