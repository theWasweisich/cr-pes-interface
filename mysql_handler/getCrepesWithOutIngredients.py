import pprint
from _database_handling import getCrepeDB

SQL1 = "SELECT id, crepename FROM crêpes;"
SQL2 = "SELECT crêpeID FROM ingredientitem;"

def initCrêpes() -> list[tuple]:
    crêpes: list[tuple] = []
    with getCrepeDB() as (con, cur):
        cur.execute(SQL1)
        res = cur.fetchall()
    for id, name in res:
        crêpes.append((id, name))
    return crêpes

def initItems() -> list:
    items: list = []
    with getCrepeDB() as (con, cur):
        cur.execute(SQL2)
        res = cur.fetchall()
    for id in res:
        items.append(id)
    return items

def getStufflessCrepe(crepes: list[tuple], ingredients: list):
    stuffless: list[tuple] = []
    for (id, name) in crepes:
        if id in ingredients:
            stuffless.append((id, name))
    return stuffless

if __name__ == "__main__":
    pprint.pprint(getStufflessCrepe(initCrêpes(), initItems()))