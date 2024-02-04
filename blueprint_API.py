from ast import literal_eval
from typing import Any
import uuid
import flask
from flask import (
    Blueprint,
    render_template,
    request
)
from flask_cors import cross_origin
import logging
import sqlite3
import status

import datetime
import pytz
import json
import os
import get_sales

time_zone = pytz.timezone("Europe/Berlin")

api_bp = Blueprint('api_bp', __name__)



class Crepes_Class():
    def __init__(self, id: int, name: str, price: float, ingredients: list[str], color: str) -> None:
        self.id = id
        self.name = name
        self.price = price
        self.ingredients = ingredients
        self.color = color
    
    def get_in_str(self):
        data = json.dumps((self.id, self.name, self.price, self.ingredients, self.color))
        return data
    
    def return_as_dict(self):
        return {"id": self.id,
         "name": self.name,
         "price": self.price,
         "ingredients": json.dumps(self.ingredients),
         "colour": self.color
         }


def get_crepes(as_dict: bool = False) -> list[Crepes_Class] | list[dict[str, str]] | None:
    con, cur = get_db()

    cur.execute('SELECT id, name, price, ingredients, colour FROM Crêpes')
    crêpes_res = cur.fetchall()
    con.close()

    res_crêpes: list[Crepes_Class] | None = []
    as_dict_list: list[dict[str, str]] | None = []

    if as_dict:
        for crepe in crêpes_res:
            as_dict_list.append(Crepes_Class(int(crepe[0]), crepe[1], float(crepe[2]), literal_eval(crepe[3]), crepe[4]).return_as_dict())
    else:
        for crepe in crêpes_res:
            res_crêpes.append(Crepes_Class(int(crepe[0]), crepe[1], float(crepe[2]), literal_eval(crepe[3]), crepe[4]))

    if (len(as_dict_list) == 0):
        as_dict_list = None

    if (len(res_crêpes) == 0):
        res_crêpes = None

    if (as_dict):
        return as_dict_list
    else:
        return res_crêpes

def create_shift(shift_date: str, shift_start: str, shift_end: str, shift_name: str, shift_staff: str):
    """Creates a new shift

    Args:
        shift_date (str): ISO Date String of shift
        shift_start (str): ISO Time String of start time
        shift_end (str): ISO Time String of end time
        shift_name (str): The Name of the shift (optional)
        shift_staff (str): A JSON encoded string of a list of all the staff's name
    """
    shift_uuid = uuid.uuid4()
    con, cur = get_db()

    # date format: 'jjjj-mm-dd' || time format: 'HH:MM:SS'

    date = datetime.date.fromisoformat(shift_date)
    s_time = datetime.time.fromisoformat(shift_start)
    e_time = datetime.time.fromisoformat(shift_end)

    cur.execute("SELECT id FROM shifts WHERE date = ? AND time_start = ? AND time_end = ?", (
        date.isoformat(),
        s_time.isoformat(timespec='seconds'),
        e_time.isoformat(timespec='seconds')
    ))
    if cur.fetchone != ():
        raise ShiftAlreadyExists
    
    
    cur.execute("INSERT INTO shifts (date, time_start, time_end, shift_name, staff, uuid) VALUES (?, ?, ?, ?, ?);", (
        date.strftime("%Y-%m-%d"),
        s_time.isoformat(timespec='seconds'),
        e_time.isoformat(timespec='seconds'),
        shift_name.strip("\\").strip("'").strip('"'),
        json.dumps(shift_staff),
        shift_uuid
    ))

    con.commit(); con.close()


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

@cross_origin
@api_bp.route("/sold/failresistor", methods=("POST",))
def crepe_sold_failresistor():
    data = request.json
    with open("failResistance.txt", "w", encoding="UTF-8") as f:
        json.dump(data, f)
    return {"status": "success"}

@cross_origin
@api_bp.route("/sold", methods=("POST",))
def crepe_sold():
    con, cur = get_db()
    try:
        data = request.json
        if (data == None):
            return {"status": "failed"}, status.HTTP_400_BAD_REQUEST
        
        logging.debug(f"New Crêpes: {data}")


        to_db: list[tuple] = []

        try:
            cur.execute("SELECT MAX(saleID) FROM sales")
            saleID_next = int(cur.fetchone()[0]) + 1
        except Exception as e:
            logging.error(f"There has been an error: {e}")
            saleID_next = 0

        logging.debug(f"Next SaleID: {saleID_next}")

        now_time = datetime.datetime.now().isoformat()
        for crepe in data:
            cID = crepe["crepeId"]
            cNAME = crepe["name"]
            cPREIS = crepe["preis"]
            cAMOUNT = crepe["amount"]


            to_db.append((saleID_next, cNAME, cAMOUNT, cPREIS, now_time))

            logging.debug(f"Sold: ID: {cID}; NAME: {cNAME}; PREIS: {cPREIS}; AMOUNT: {cAMOUNT}")

        cur.executemany("INSERT INTO sales (saleID, crepe, amount, price, time) VALUES (?, ?, ?, ?, ?)", to_db)


        con.commit()
    except Exception as e:
        logging.exception(e)
        con.close()
        return {"status": "failed"}, status.HTTP_500_INTERNAL_SERVER_ERROR
    con.close()
    return {"status": "success"}, status.HTTP_200_OK


@api_bp.route("/sales/get", methods=("GET",))
def serve_sales():
    data = get_sales.get_dict()
    return json.dumps(data)

@api_bp.route("/sales/heatmap", methods=("GET",))
def serve_heatmap():
    data = get_sales.get_heatmap()
    return json.dumps(data)

def get_db() -> tuple[sqlite3.Connection, sqlite3.Cursor]:
    conn = sqlite3.connect("datenbank.db")
    cur = conn.cursor()
    return (conn, cur)


class ShiftAlreadyExists(Exception):
    pass



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