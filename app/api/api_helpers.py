import datetime
import json
import uuid
from app.classes import Crepes_Class
from api.sqlite3_handler import getDB
# from mysql_handler._database_handling import getCrepeDB

# from mysql_handler.methods import CrepeHandler


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

    # date format: 'jjjj-mm-dd' || time format: 'HH:MM:SS'

    date = datetime.date.fromisoformat(shift_date)
    s_time = datetime.time.fromisoformat(shift_start)
    e_time = datetime.time.fromisoformat(shift_end)

    with getDB() as (con, cur):
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


def get_crepes(as_dict: bool = False) -> list[Crepes_Class] | list[dict[str, str]] | None:
    """_summary_

    Args:
        as_dict (bool, optional): _description_. Defaults to False.

    Returns:
        list[Crepes_Class] | list[dict[str, str]] | None: _description_
    """

    with getDB() as (con, cur):
        cur.execute('SELECT id, name, price, ingredients, colour FROM Crêpes')
        crêpes_res = cur.fetchall()

    res_crêpes: list[Crepes_Class] = []
    as_dict_list: list[dict[str, str]] = []

    crepes_class_list: list[Crepes_Class] = []

    for crepe in crêpes_res:
        res_crêpes.append(Crepes_Class(id=int(crepe[0]), name=crepe[1], price=float(crepe[2]), ingredients=crepe[3], color=crepe[4]))

    if as_dict:
        for crepe in res_crêpes:
            as_dict_list.append(crepe.return_as_dict())

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
            return float(start)  # type: ignore

    ALLOWED_CHARS_FOR_PRICE = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ",", "."]
    for letter in str(start):
        if (letter in ALLOWED_CHARS_FOR_PRICE):
            price_str = price_str + letter
    price_str = price_str.replace(".", "")
    price_str = price_str.replace(",", ".", 1)
    return float(price_str)  # type: ignore
