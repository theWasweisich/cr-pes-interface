from pprint import pprint
from typing import Annotated, Literal, NamedTuple
from _database_handling import getCrepeDB
from util_classes import Crêpe, Sale, Ingredient
from datetime import datetime
import json
import sys
import random
from methods import SaleHandling, IngredientHandler, CrepeHandler

import inquirer



def getSales():
    with getCrepeDB() as conTuple:
        all_sales = SaleHandling.get_all_sales(conTuple)
        pprint(all_sales)
        with open("output/first2.json", "w", encoding="UTF-8") as f:
            json.dump(all_sales, f, ensure_ascii=False)

def newSale():
    with getCrepeDB() as conTuple:
        con = conTuple[0]
        cur = conTuple[1]

        cur.execute("SELECT id FROM crêpes")
        res = cur.fetchall()
        crepeIDs = []
        for id in res:
            crepeIDs.append(id[0])

        print(crepeIDs)
        finishedcrêpes: list[Crêpe] = []
        for _ in range(random.randint(1, 5)):
            crepeID = random.choice(crepeIDs)

            cur.execute("SELECT * FROM crêpes WHERE id = %s" % crepeID)
            res = cur.fetchone()
            if not res:
                raise Exception
            (id, name, price, ingredients, type_) = res
            if type(id) != int:
                raise Exception("CrepeID has wrong type")
            if type(name) != str:
                raise Exception("CrepeName has wrong type")
            if type(price) != float:
                raise Exception("CrepePrice has wrong type")
            if type(ingredients) != list and ingredients != None:
                raise Exception("CrepeIngredients has wrong type")
            if type(type_) != str:
                raise Exception("CrepeType has wrong type")

            typeLiteral: Literal["süß", "deftig", "spezial", "sonstiges"]

            if type_ == "süß":
                typeLiteral = "süß"
            elif type_ == "deftig":
                typeLiteral = "deftig"
            elif type_ == "spezial":
                typeLiteral = "spezial"
            else:
                typeLiteral = "sonstiges"
            
            finishedcrêpes.append(Crêpe(id, name, price, typeLiteral))
        finished_sale = Sale(id=None, time=datetime.now(),crêpes=finishedcrêpes, total=10)

        SaleHandling.save_sale(conTuple, finished_sale)
        con.commit()
        con.close()

class Ingredient_(NamedTuple):
    """
    - Name should be 45 characters or less.
    - LongName should be 100 characters or less.
    """
    name: str | None
    longname: str | None

def createIngredient(ingredients: list[Ingredient_] | Ingredient_ | None = None):

    if not ingredients:
        return

    insertionReady: list[Ingredient] = []

    if type(ingredients) == list:
        for ingr in ingredients:
            insertionReady.append(Ingredient(id=None, name=ingr.name, longname=ingr.longname))

        with getCrepeDB() as conTuple:
            for insert in insertionReady:
                IngredientHandler.create_ingredient(conTuple, insert)

    elif type(ingredients) == Ingredient_:
        with getCrepeDB() as conTuple:
            IngredientHandler.create_ingredient(database=conTuple, ingredient=Ingredient(None, ingredients.name, ingredients.longname))
    else:
        raise NotImplementedError("Input nicht erlaubt!")

def genereteIngredientClasses(ingr: list[Annotated[tuple[str, str], 2]]) -> list[Ingredient_]:
    to_return: list[Ingredient_] = []
    for i in ingr:
        name, longname = i
        if (longname == ""):
            longname = None
        to_return.append(Ingredient_(name, longname))
    return to_return

def selectStuff(crepes: list[Crêpe], ingrs: list[Ingredient]):
    q = inquirer.List(name="crepe", message="Bei welchem Crêpe sollen Zutaten hinzugefügt werden?",
                      choices=crepes)

    q2 = inquirer.List(name="ingrs", message="Und welche Zutat?",
                       choices=ingrs)
    
    answ = inquirer.prompt([q,q2])
    if type(answ) == dict:
        return (answ["crepe"], answ["ingrs"])


if __name__ == "__main__":
    if '-getI' in sys.argv:
        getSales()
    elif '-newI' in sys.argv:
        newSale()
    elif '-createI' in sys.argv:
        ingrs: list[tuple[str, str]] = [
            ("Apfelmuß", ""),
            ("Kinderschokolade", ""),
            ("Teig", "ja was in so Teig halt drin ist, ne?"),
            ("Schinken", "Tier"),
            ("Käse", "Milch")
        ]
        createIngredient(genereteIngredientClasses(ingrs))
    elif '-getC' in sys.argv:
        with getCrepeDB() as db:
            crepes = (CrepeHandler.get_all_crepes(db))
            ingredients = IngredientHandler.get_all_ingredients(db)

            if crepes:
                answ = selectStuff(crepes=crepes, ingrs=ingredients)
                print(answ)
                print(type(answ))



    else:
        print()
        print("[*] -------- HELP --------- [*]")
        print("main.py [-get] [-new]")
        print()