from ast import literal_eval
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
    data = request.get_json()[0]
    logging.debug(f"New Crêpes arrived!\nData: {data}")

    name = data["name"]
    price = data["price"]
    ingredients = data["ingredients"].split(",")
    color = data["color"]

    logging.info(f"Parsed Crêpes: {name} || {price} || {ingredients} || {color}")

    con, cur = get_db()

    try:
        cur.execute("INSERT INTO Crêpes (name, price, ingredients, colour) VALUES (?, ?, ?, ?)", (name, price, str(ingredients), color))
        con.commit()
    except sqlite3.OperationalError as e:
        return {"status": "error", "type": "database", "error": e.sqlite_errorname}
    
    except sqlite3.IntegrityError as e:
        
        if e.sqlite_errorcode == 2067:
            return {"status": "error", "type": "crepe_exists"}
        
        return {"status": "error", "type": "database", "error": e.sqlite_errorname}
    except Exception as e:
        return {"status": "error", "type": "unknown"}

    con.close()

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
    data = request.get_json()
    logging.debug(f"Removed Crêpes arrived!\nData: {data}") # FIXME

    for crepe in data:
        id = crepe["id"]
        name = crepe["name"]


    return {"status": "success"}

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


def get_db() -> tuple[sqlite3.Connection, sqlite3.Cursor]:
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