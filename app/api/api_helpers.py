import datetime
import json
import uuid

from api.api_blueprint import getCrepeDB, Crepes_Class

from mysql_handler.methods import CrepeHandler


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

    with getCrepeDB() as (_, cur):

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


def get_crepes_alt(as_dict: bool = False) -> list[Crepes_Class] | list[dict[str, str]]:
    """Like `get_crepes(as_dict: bool = False)`, but gets data from the mysql database

    Args:
        as_dict (bool, optional): If it should be returned as a dict. Defaults to False.

    Returns:
        list[Crepes_Class] | list[dict[str, str]]: The data
    """
    res_crepes: list[Crepes_Class] = []
    as_dict_list: list[dict[str, str]] = []

    with getCrepeDB() as database:
        res = CrepeHandler.get_all_crepes(database=database)

    for crepe in res:
        crepe = Crepes_Class(crepe.id, crepe.name, price=crepe.price, ingredients=[], color=crepe.type_)
        res_crepes.append(crepe)
        as_dict_list.append(crepe.return_as_dict())

    if as_dict:
        return as_dict_list
    else:
        return res_crepes


def get_crepes(as_dict: bool = True) -> list[Crepes_Class] | list[dict[str, str]] | None:
    """Returns all currently available crêpes in the database.

    Args:
        as_dict (bool, optional): Wether to output the Crêpes as a dict [True] or as class [False]. Defaults to True.

    Returns:
        list[Crepes_Class] | list[dict[str, str]] | None: Specified output format, or None if there have been no crêpes found
    """

    with getCrepeDB() as (_, cur):
        cur.execute('SELECT id, name, price, ingredients, colour FROM Crêpes')
        crêpes_res = cur.fetchall()

    res_crêpes: list[Crepes_Class] | None = []
    as_dict_list: list[dict[str, str]] | None = []

    for crepe in crêpes_res:
        res_crêpes.append(Crepes_Class(id=int(crepe[0]), name=crepe[1], price=float(crepe[2]), ingredients=crepe[3], color=crepe[4]))

    if as_dict:
        for crepe in res_crêpes:
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
            return float(start)  # type: ignore

    ALLOWED_CHARS_FOR_PRICE = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ",", "."]
    for letter in str(start):
        if (letter in ALLOWED_CHARS_FOR_PRICE):
            price_str = price_str + letter
    price_str = price_str.replace(".", "")
    price_str = price_str.replace(",", ".", 1)
    return float(price_str)  # type: ignore
