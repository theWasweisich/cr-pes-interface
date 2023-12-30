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

changes = {}


api_bp = Blueprint('api_bp', __name__)

@api_bp.route("/")
def index():
    return "<h1>Hier gehts zur API</h1>"

@cross_origin
@api_bp.route("/crepes/new", methods=("PUT",))
def new_crepe():
    data = request.json
    logging.debug(f"New Crêpes arrived!\nData: {data}")
    return {"status": "success"}

@cross_origin
@api_bp.route("/crepes/edit", methods=("PATCH",))
def edit_crepe():
    data = request.json
    logging.debug(f"Edited Crêpes arrived!\nData: {data}")
    return {"status": "success"}


@cross_origin
@api_bp.route("/crepes/delete", methods=("DELETE",))
def delete_crepe():
    """
    Data should contain: `id`, `name`
    """
    data = request.json
    logging.debug(f"Removed Crêpes arrived!\nData: {data}") # FIXME
    return {"status": "success"}

def apply_changes(changes: dict[str, list[dict]]):

    con, cur = get_connection()

    # Changes für new
    new = changes["new"]
    for change in new:
        name = change["name"]
        preis = change["price"]
        ingredients = change["ingredients"].split(",")
        for ing in ingredients:
            ing = str(ing).strip()
        color = change["color"]
        cur.execute("INSERT INTO Crêpes (name, price, ingredients, colour) VALUES (?, ?, ?, ?);", (name, preis, str(ingredients), color))
        con.commit()
        con.close()
    
    edit = changes["edit"]
    return

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

def get_connection() -> tuple[sqlite3.Connection, sqlite3.Cursor]:
    conn = sqlite3.connect("datenbank.db")
    cur = conn.cursor()
    return (conn, cur)

hello_str = r"""

                                    __ _ _        _   _   _ 
                                   / _(_) |      | | | | | |
 __      ___ __ ___  _ __   __ _  | |_ _| | ___  | | | | | |
 \ \ /\ / / '__/ _ \| '_ \ / _` | |  _| | |/ _ \ | | | | | |
  \ V  V /| | | (_) | | | | (_| | | | | | |  __/ |_| |_| |_|
   \_/\_/ |_|  \___/|_| |_|\__, | |_| |_|_|\___| (_) (_) (_)
                            __/ |                           
                           |___/                            

"""


if __name__ == "__main__":
    print(hello_str)