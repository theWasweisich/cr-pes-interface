import json
import sqlite3
import datetime
import os


def func1():
    con = sqlite3.connect("datenbank.db")

    time = datetime.datetime.now().strftime("%Y-%m-%d")

    filename = f"./db/{time}_dump.sql"

    if os.path.isfile(filename):
        answ = input("Do you want to overwrite the current dump? (Y/N) ")
        if ((answ == "Y") or (answ == "y")):
            os.remove(filename)
        else:
            exit()

    with open(filename, "w", encoding="UTF-8") as f:
        for line in con.iterdump():
            f.write(line)

    con.close()
    print("finished!")


def func2():
    con = sqlite3.connect("datenbank.db")
    cur = con.cursor()

    cur.execute("SELECT * FROM Crêpes")
    res = cur.fetchall()

    print(res)
    print(type(res))
    print(json.dumps(res))
    con.close()


if __name__ == "__main__":
    func2()
