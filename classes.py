import datetime
import json
import logging


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

class CrepeSale():
    def __init__(self, id: int, saleID: int, name: str, amount: int, price: float, time: datetime.datetime) -> None:
        self.id = id
        self.saleID = saleID
        self.name = name
        self.amount = amount
        self.price = price
        self.time = time
    
    def __str__(self) -> str:
        return f"ID: {self.id}; SaleID: {self.saleID}; Name: {self.name}; Amount: {self.amount}; Preis: {self.price}; Zeit: {self.time.strftime("%d-%m-%Y, %H:%M:%S")}"


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

