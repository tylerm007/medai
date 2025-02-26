from flask import request, jsonify
import logging
import safrs
from database import models

db = safrs.DB 
session = db.session 

app_logger = logging.getLogger("api_logic_server_app")

def add_service(app, api, project_dir, swagger_host: str, PORT: str, method_decorators = []):
    pass

def insert_reading_history(row: models.Reading, old_row: models.Reading):
    # Insert a new ReadingHistory record
    # do a get first to see if it exists (insert/update)
    try:
        reading_history = session.query(models.ReadingHistory).filter(models.ReadingHistory.reading_id == row.id).one()
    except Exception as e:
        reading_history = None
        app_logger.error(f"Error querying reading history: {e}")

    if reading_history is None:
        reading_history = models.ReadingHistory()
        reading_history.reading_id = row.id
        reading_history.reading_date = row.reading_date
    if 'breakfast' == row.time_of_reading:
        reading_history.breakfast = row.reading_value
    elif 'lunch' == row.time_of_reading:
        reading_history.lunch = row.reading_value
    elif 'dinner' == row.time_of_reading:
        reading_history.dinner = row.reading_value
    elif 'bedtime' == row.time_of_reading:
        reading_history.bedtime = row.reading_value      

    session.add(reading_history)
    app_logger.info("insert_reading_history")
    