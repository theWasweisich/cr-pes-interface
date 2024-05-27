from dataclasses import dataclass
import datetime
import json
import logging
from typing import TypedDict, Literal
from mysql_handler._database_handling import getCrepeDB


@dataclass
class User:
    def __init__(self, id: int, username: str, priviledge: int, current_key: bytes) -> None:
        self.id: int = id
        self.username: str = username
        self.priviledge: int = priviledge
        self.current_key: bytes | None = current_key

    def is_authorized(self, level: int):
        logging.debug(f"Trying to authorize {self} to Level: {level}")
        return self.priviledge >= level

    def get_key(self) -> bytes | None:
        """Returns the users current key

        Returns:
            str: The users key
        """
        return self.current_key

    def set_key(self, key: bytes):
        self.current_key = key
        with getCrepeDB() as (_, cur):
            cur.execute("UPDATE users SET current_key = ? WHERE id = ?", (self.current_key, self.id))
            cur.connection.commit()

    def __repr__(self) -> str:
        return json.dumps({
            "username": self.username,
            "priviledge": self.priviledge,
            "current_key": str(self.current_key)
        })


class CrepeSaleDict(TypedDict):
    id: int
    saleID: int
    name: str
    amount: int
    price: float
    time: datetime.datetime


class CrepeSale():
    def __init__(self, id: int, saleID: int, name: str, amount: int, price: float, time: datetime.datetime) -> None:
        self.id = id
        self.saleID = saleID
        self.name = name
        self.amount = amount
        self.price = price
        self.time = time

    def __str__(self) -> str:
        return f"ID: {self.id}; SaleID: {self.saleID}; Name: {self.name}; Amount: {self.amount}; Preis: {self.price}; Zeit: {self.time.strftime('%d-%m-%Y, %H:%M:%S')}"  # noqa

    def __object__(self) -> CrepeSaleDict:
        return CrepeSaleDict({"id": self.id, "saleID": self.saleID, "name": self.name, "amount": self.amount, "price": self.price, "time": self.time})


@dataclass
class Crepes_Class():
    def __init__(self, id: int, name: str, price: float, ingredients: list[str], type_: str) -> None:
        self.id = id
        self.name = name
        self.price = price
        self.ingredients = ingredients
        self.type = type_

    def get_in_str(self):
        data = json.dumps((self.id, self.name, self.price, self.ingredients, self.color))
        return data

    def return_as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "ingredients": json.dumps(self.ingredients),
            "type": self.type
         }


@dataclass
class SaleItem():
    id: int
    crepesId: int
    saleId: int
    amount: int
    price: float
    crepe: dict


@dataclass
class SingularSale():
    id: int
    saleTime: str
    total: float
    ownConsumption: bool | Literal["unknown"]
    saleItems: list[dict]


@dataclass
class Crepes_Ingredient():
    id: int


class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class consolecontrolSequences:
    CLEAR_SCREEN = '\033[2J'
    MOVE_CURSOR_TO_TOP_RIGHT = '\033[H'

    BLACK = "\033[30m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"
