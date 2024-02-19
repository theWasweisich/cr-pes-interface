import datetime
import json
import logging
import sqlite3
import uuid
from classes import Crepes_Class

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
        raise Exception
    
    
    cur.execute("INSERT INTO shifts (date, time_start, time_end, shift_name, staff, uuid) VALUES (?, ?, ?, ?, ?);", (
        date.strftime("%Y-%m-%d"),
        s_time.isoformat(timespec='seconds'),
        e_time.isoformat(timespec='seconds'),
        shift_name.strip("\\").strip("'").strip('"'),
        json.dumps(shift_staff),
        shift_uuid
    ))

    con.commit(); con.close()


def get_crepes(as_dict: bool = False) -> list[Crepes_Class] | list[dict[str, str]] | None:
    con, cur = get_db()

    cur.execute('SELECT id, name, price, ingredients, colour FROM Crêpes')
    crêpes_res = cur.fetchall()
    con.close()

    res_crêpes: list[Crepes_Class] | None = []
    as_dict_list: list[dict[str, str]] | None = []

    crepes_class_list: list[Crepes_Class] = []

    for crepe in crêpes_res:
        crepes_class_list.append(Crepes_Class(int(crepe[0]), crepe[1], float(crepe[2]), crepe[3], crepe[4]))


    if as_dict:
        for crepe in crepes_class_list:
            as_dict_list.append(crepe.return_as_dict())

    if (len(as_dict_list) == 0):
        as_dict_list = None

    if (len(res_crêpes) == 0):
        res_crêpes = None

    if (as_dict):
        return as_dict_list
    else:
        return res_crêpes

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


def get_db() -> tuple[sqlite3.Connection, sqlite3.Cursor]:
    conn = sqlite3.connect("datenbank.db")
    cur = conn.cursor()
    return (conn, cur)

