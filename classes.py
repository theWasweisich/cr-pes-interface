import datetime
import json
import logging
from typing import TypedDict


class User:
    def __init__(self, username, password, priviledge, current_key) -> None:
        self.username = username
        self.password = password
        self.priviledge = priviledge
        self.current_key = current_key

    def is_authorized(self, level: int):
        logging.debug(f"Trying to authorize {self} to Level: {level}")
        return self.priviledge >= level

    def get_key(self):
        return self.current_key

    def set_key(self, key: str):
        self.current_key = key

    def __str__(self):
        return f"Username: {self.username} || Password: {self.password} || Priviledge: {self.priviledge}"


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
        return f"ID: {self.id}; SaleID: {self.saleID}; Name: {self.name}; Amount: {self.amount}; Preis: {self.price}; Zeit: {self.time.strftime("%d-%m-%Y, %H:%M:%S")}"  # noqa

    def __object__(self) -> CrepeSaleDict:
        return CrepeSaleDict({"id": self.id, "saleID": self.saleID, "name": self.name, "amount": self.amount, "price": self.price, "time": self.time})


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
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "ingredients": json.dumps(self.ingredients),
            "colour": self.color
         }


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
