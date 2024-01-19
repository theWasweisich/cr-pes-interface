from ast import literal_eval
from typing import Any
import uuid
import flask
from flask import (
    Blueprint,
    request
)
from flask_cors import cross_origin
import logging
import sqlite3
import status

from datetime import datetime
import json
import os

api_bp = Blueprint('api_bp', __name__)

class Shift_Class():
    """The Shift Class represents one shift
    """
    def __init__(self, id: int, name: str, start: datetime, end: datetime, staff: list[str], shift_uuid: str) -> None:
        """Create a shift class

        Args:
            id (int): The ID
            start (datetime): the start time
            end (datetime): the end time
            staff (list[str]): the staff names
        """
        self.id = id
        self.name = name
        self.start = start
        self.end = end
        self.staff = staff
        self.uuid = shift_uuid
    
    def get_staff(self):
        return self.staff
    
    def __repr__(self) -> str:
        return f"Schicht ID: {self.id}; Schicht Start: {self.start.strftime("%d-%m-%Y %H:%M:%S")}; Schicht Ende: {self.end.strftime("%d-%m-%Y %H:%M:%S")}; Schicht Helfer: {self.staff}"

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



def get_current_shift() -> Shift_Class | None:
    now = datetime.now()

    current: Shift_Class | None = None

    shifts = get_shifts()

    if shifts == None:
        return None

    for shift in shifts:
        start = datetime.fromisoformat(shift.start.isoformat())
        end = datetime.fromisoformat(shift.end.isoformat())

        if start <= now <= end:
            current = shift
            break
    return current

def get_shifts() -> list[Shift_Class] | None:
    con, cur = get_db()
    cur.execute('SELECT * FROM shifts')
    shifts_res = cur.fetchall()
    con.close()

    every_shift: list[Shift_Class] = []

    for shift in shifts_res:
        shift_id = shift[0]
        shift_start = datetime.fromisoformat(shift[1])
        shift_end = datetime.fromisoformat(shift[2])
        shift_name = str(shift[3])
        shift_staff = shift[4].split(",")

        every_shift.append(Shift_Class(shift_id, shift_name, shift_start, shift_end, shift_staff, ""))

    if len(every_shift) < 1:
        return None
    return every_shift

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

def create_shift(shift_start: str, shift_end: str, shift_name: str, shift_staff: str):
    """Creates a new shift

    Args:
        shift_start (str): ISO Time String of start time
        shift_end (str): ISO Time String of end time
        shift_name (str): The Name of the shift (optional)
        shift_staff (str): A JSON encoded string of a list of all the staff's name
    """
    shift_uuid = uuid.UUID().hex
    con, cur = get_db()

    cur.execute("SELECT (time_start, time_end) FROM shifts")
    for shift in cur.fetchall():
        if shift[0] == shift_start or shift[1] == shift_end:
            raise ShiftAlreadyExists
    
    cur.execute("INSERT INTO shifts (time_start, time_end, shift_name, staff, uuid) VALUES (?, ?, ?, ?, ?);", (
        shift_start,
        shift_end,
        shift_name,
        shift_staff,
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