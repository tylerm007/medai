from behave import *
import requests, pdb
import test_utils
import json
import datetime

# Implement Behave Tests -- your code goes here

@given('Existing Patients Readings')
def step_impl(context):
    context.patient = test_utils.get('Patient', 521)
    #assert context.patient is not None
    print(f'Patient: {context.patient}')
    context.patient_id = int(context.patient['data']['id'])
    context.patient_name = context.patient['data']['attributes']['name']

@when('Blood Sugar History is given')
def step_impl(context):
    where = f"filter[patient_id]={context.patient_id}"
    history = test_utils.get('ReadingHistory', None, where)
    assert history is not None
    reading_history = history['data'][0] if len(history['data']) > 0 else history['data']
    assert reading_history is not None
    history_id = reading_history['id']  
    
    bedtime = reading_history['attributes']['bedtime']
    breakfast = reading_history['attributes']['breakfast']
    dinner = reading_history['attributes']['dinner']
    lunch = reading_history['attributes']['lunch']

    reading_date = (datetime.datetime.now() + datetime.timedelta(days=30)).strftime("%Y-%m-%d")
    context.reading_date = reading_date
    history = {
                "bedtime": bedtime,
                "breakfast": breakfast,
                "dinner": dinner,
                "lunch": lunch,
                "reading_date": reading_date,
                "patient_id": context.patient_id,
                "notes_for_day": "BeHave Test",
            }
    
    test_utils.post('ReadingHistory', history )
    assert True is not False

@then('Recommendations should match prior entry')
def step_impl(context):
    scenario = "Validate Recommendations"
    test_utils.prt(f'Rules Report', scenario)
    date = context.reading_date
    where = f"filter[reading_date]={date}&filter[patient_id]={context.patient_id}"
    recommendations = test_utils.get('Recommendation',None, where)
    where = f"filter[patient_id]={context.patient_id}"
    medications = test_utils.get('PatientMedication',None, where)
    assert medications is not None
    assert recommendations is not None 
    assert len(medications['data']) == len(recommendations['data'])
    print(f'Medications: {medications}')
    print(f'Recommendations: {recommendations}')