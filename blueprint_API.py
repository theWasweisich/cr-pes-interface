from ast import literal_eval
from email.policy import strict
from operator import truediv
import flask
from flask import (
    Blueprint,
    request
)
from flask_cors import cross_origin
import logging
import sqlite3

from numpy import number
import status

from datetime import date, datetime
import json
import os

changes = {}


api_bp = Blueprint('api_bp', __name__)

@api_bp.route("/")
def index():
    return "", status.HTTP_403_FORBIDDEN

@cross_origin
@api_bp.route("/crepes/new", methods=("PUT",))
def new_crepe():
    data_list = request.get_json()
    # logging.debug(f"New Crêpes arrived!\nData: {data_list}")

    if data_list.length == 0:
        return {"status": "failed", "type": "noting_changed"}

    for data in data_list:
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
    con, cur = get_db()
    data = request.get_json()
    logging.debug(f"Edited Crêpes arrived!\nData: {data}")
    for crepe in data:
        id = crepe["id"]
        name = crepe["name"]
        price = crepe["price"]
        price_str = parse_price(price)

        cur.execute("SELECT name, price FROM Crêpes WHERE id=?", id)
        res = cur.fetchone()
        db_name = res[0]
        db_price = res[1]
        db_price_str = str(db_price).replace("\xa0", " ")
        logging.debug(f"DB_Data: {db_name} ({type(db_name)}) :: {db_price} ({type(db_price)})")

        if (db_price != price_str):
            logging.info(f"Database & Edited are not the same! {db_price_str} vs {price_str}")
            cur.execute("UPDATE Crêpes SET price=? WHERE id=?", (price, id))
        if name != db_name:
            logging.info(f"Database & Edited are not the same! {name} vs {db_name}")
            cur.execute("UPDATE Crêpes SET name=? WHERE id=?", (name, id))

    con.commit()
    con.close()
    return {"status": "success"}

def parse_price(start: str) -> float:
    price_str = ""
    if start.find(",") == 0:
        if start.find(".") == 0:
            start = start.removesuffix("€")
            start = start.removesuffix(" €")
            return float(start) # type: ignore

    ALLOWED_CHARS_FOR_PRICE = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ",", "."]
    for letter in str(start):
        if (letter in ALLOWED_CHARS_FOR_PRICE):
            price_str = price_str + letter
    price_str = price_str.replace(".", "")
    price_str = price_str.replace(",", ".", 1)
    return float(price_str) # type: ignore



@cross_origin
@api_bp.route("/crepes/delete", methods=("DELETE",))
def delete_crepe():
    """
    Function to delete the crêpes specified by the given data
    Data should contain: `id`, `name`
    """
    data_list = request.get_json()
    # logging.debug(f"Removed Crêpes arrived!\nData: {data_list}") # FIXME

    con, cur = get_db()

    for data in data_list:
        id = data["id"]
        name = data["name"]

        cur.execute("SELECT name FROM `Crêpes` WHERE id = ?", [id,])
        db_name: str = cur.fetchone()[0]

        if db_name == name:
            cur.execute("DELETE FROM Crêpes WHERE id=? AND name=?", [id, name])
            con.close()
        else:
            con.close()
            return {"status": "failed", "error": "crepe_not_found"}

    con.close()
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