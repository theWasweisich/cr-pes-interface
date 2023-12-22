import sqlite3
import json

con = sqlite3.connect('datenbank.db')
cur = con.cursor()

with open("crepes_data.json", "r", encoding="UTF-8") as f:
    data = json.load(f)


for crepe in data:
    cur.execute("INSERT INTO Crêpes (name, price, ingredients, colour) VALUES (:name, :price, :ingredients, :colour)", crepe)
    con.commit()