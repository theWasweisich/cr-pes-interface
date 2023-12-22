from operator import truediv
import flask
from flask import (
    Blueprint,
    request
)
from flask_cors import cross_origin
import logging
import sqlite3

from datetime import date, datetime
import json
import os

changes = {
    'new': [],
    'edit': [],
    'delete': []
}


api_bp = Blueprint('api_bp', __name__)

@api_bp.route("/")
def index():
    return "<h1>Hier gehts zur API</h1>"

@api_bp.route("/edit", methods=("POST",))
@cross_origin()
def receive_changes():
    logging.info(">> Changes arrived!")

    data = request.json
    logging.info(type(data))
    
    if type(data) != dict:
        return {"status": "failed"}, 501

    if "new" in data:
        logging.info("Received a new Crêpes!")
        new = data["new"]
        changes['new'].append(new)

    if "edit" in data:
        edit = data["edit"]
        changes["edit"] = edit
    if "delete" in data:
        delete = data["delete"]
        changes["delete"] = delete
 
    return {"status": "success"}

@api_bp.route("/save")
def do_tasks() -> str:
    """sumary_line
    
    Keyword arguments:
    argument -- description
    Return: return_description
    """
    new = changes["new"]
    
    for item in new:
        print(item)
    
    return json.dumps({"status": "success"})
    ...
    

@api_bp.route("/new_sale", methods=("POST",))
@cross_origin()
def receive_sales():
    logging.info(">> Got sales!")

    data = request.json
    if type(data) != str:
        return {"status": "failed"}

    logging.info(f'Data: {data}')

    date_today = datetime.now().strftime("%d.%m.%Y")
    file_path = f'sales/{date_today}.json'

    if os.path.isfile(file_path):
        with open(file_path, "+", encoding="UTF-8") as f:
            sales = json.load(f)
            sales.append({datetime.now().isoformat(): json.loads(data)})
            json.dump(sales, f)

    return {"status": "success"}

@api_bp.route("/save", methods=("POST",))
def save_changes():
    print(changes)
    # save the changes
    return {"status": "failed"}