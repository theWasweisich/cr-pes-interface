from ast import literal_eval
import uuid
from flask import (
    Blueprint,
    request
)
from flask_cors import cross_origin
from flask_classful import FlaskView, route
import logging
import sqlite3
import status

import datetime
import pytz
import json
import get_sales

from classes import Crepes_Class
from api.api_helpers import get_db, parse_price

time_zone = pytz.timezone("Europe/Berlin")

api_bp = Blueprint('api_bp', __name__)

class CrepesView(FlaskView):

    @route("/get")
    def get(self):
        return {}
    
    @route("/delete", methods=("DELETE",))
    def delete_crepe(self):
        """
        Function to delete the crêpes specified by the given data
        Data should contain: `id`, `name`
        """
        data_list = request.get_json()

        con, cur = get_db()

        for data in data_list:
            id = data["id"]
            name = data["name"]

            cur.execute("SELECT name FROM `Crêpes` WHERE id = ?", [id,])
            db_name: str = cur.fetchone()[0]

            if db_name == name:
                cur.execute("DELETE FROM Crêpes WHERE id=? AND name=?", [id, name])
                con.close()
            else:
                con.close()
                return {"status": "failed", "error": "crepe_not_found"}

        con.close()
        return {"status": "success"}

    @route("/create", methods=("PUT",))
    def new_crepe(self):
        data_list = request.get_json()
        # logging.debug(f"New Crêpes arrived!\nData: {data_list}")

        if data_list.length == 0:
            return {"status": "failed", "type": "noting_changed"}

        for data in data_list:
            name = data["name"]
            price = data["price"]
            ingredients = data["ingredients"].split(",")
            color = data["color"]

            logging.info(f"Parsed Crêpes: {name} || {price} || {ingredients} || {color}")

            con, cur = get_db()

            try:
                cur.execute("INSERT INTO Crêpes (name, price, ingredients, colour) VALUES (?, ?, ?, ?)", (name, price, str(ingredients), color))
                con.commit()
            except sqlite3.OperationalError as e:
                return {"status": "error", "type": "database", "error": e.sqlite_errorname}
            
            except sqlite3.IntegrityError as e:
                
                if e.sqlite_errorcode == 2067:
                    return {"status": "error", "type": "crepe_exists"}
                
                return {"status": "error", "type": "database", "error": e.sqlite_errorname}
            except Exception as e:
                return {"status": "error", "type": "unknown"}

            con.close()

        return {"status": "success"}
    
    @route("/edit", methods=("PATCH",))
    def edit_crepe(self):
        con, cur = get_db()
        data = request.get_json()
        logging.debug(f"Edited Crêpes arrived!\nData: {data}")
        for crepe in data:
            id = crepe["id"]
            name = crepe["name"]
            price = crepe["price"]
            price_str = parse_price(price)

            cur.execute("SELECT name, price FROM Crêpes WHERE id=?", id)
            res = cur.fetchone()
            db_name = res[0]
            db_price = res[1]
            db_price_str = str(db_price).replace("\xa0", " ")
            logging.debug(f"DB_Data: {db_name} ({type(db_name)}) :: {db_price} ({type(db_price)})")

            if (db_price != price_str):
                logging.info(f"Database & Edited are not the same! {db_price_str} vs {price_str}")
                cur.execute("UPDATE Crêpes SET price=? WHERE id=?", (price, id))
            if name != db_name:
                logging.info(f"Database & Edited are not the same! {name} vs {db_name}")
                cur.execute("UPDATE Crêpes SET name=? WHERE id=?", (name, id))

        con.commit()
        con.close()
        return {"status": "success"}






@api_bp.route("/")
def index():
    return "", status.HTTP_403_FORBIDDEN

# @cross_origin
# @api_bp.route("/crepes/new", methods=("PUT",))
# def new_crepe():
#     data_list = request.get_json()
#     # logging.debug(f"New Crêpes arrived!\nData: {data_list}")

#     if data_list.length == 0:
#         return {"status": "failed", "type": "noting_changed"}

#     for data in data_list:
#         name = data["name"]
#         price = data["price"]
#         ingredients = data["ingredients"].split(",")
#         color = data["color"]

#         logging.info(f"Parsed Crêpes: {name} || {price} || {ingredients} || {color}")

#         con, cur = get_db()

#         try:
#             cur.execute("INSERT INTO Crêpes (name, price, ingredients, colour) VALUES (?, ?, ?, ?)", (name, price, str(ingredients), color))
#             con.commit()
#         except sqlite3.OperationalError as e:
#             return {"status": "error", "type": "database", "error": e.sqlite_errorname}
        
#         except sqlite3.IntegrityError as e:
            
#             if e.sqlite_errorcode == 2067:
#                 return {"status": "error", "type": "crepe_exists"}
            
#             return {"status": "error", "type": "database", "error": e.sqlite_errorname}
#         except Exception as e:
#             return {"status": "error", "type": "unknown"}

#         con.close()

#     return {"status": "success"}

# @cross_origin
# @api_bp.route("/crepes/edit", methods=("PATCH",))
# def edit_crepe():
#     con, cur = get_db()
#     data = request.get_json()
#     logging.debug(f"Edited Crêpes arrived!\nData: {data}")
#     for crepe in data:
#         id = crepe["id"]
#         name = crepe["name"]
#         price = crepe["price"]
#         price_str = parse_price(price)

#         cur.execute("SELECT name, price FROM Crêpes WHERE id=?", id)
#         res = cur.fetchone()
#         db_name = res[0]
#         db_price = res[1]
#         db_price_str = str(db_price).replace("\xa0", " ")
#         logging.debug(f"DB_Data: {db_name} ({type(db_name)}) :: {db_price} ({type(db_price)})")

#         if (db_price != price_str):
#             logging.info(f"Database & Edited are not the same! {db_price_str} vs {price_str}")
#             cur.execute("UPDATE Crêpes SET price=? WHERE id=?", (price, id))
#         if name != db_name:
#             logging.info(f"Database & Edited are not the same! {name} vs {db_name}")
#             cur.execute("UPDATE Crêpes SET name=? WHERE id=?", (name, id))

#     con.commit()
#     con.close()
#     return {"status": "success"}

# @cross_origin
# @api_bp.route("/crepes/delete", methods=("DELETE",))
# def delete_crepe():
#     """
#     Function to delete the crêpes specified by the given data
#     Data should contain: `id`, `name`
#     """
#     data_list = request.get_json()

#     con, cur = get_db()

#     for data in data_list:
#         id = data["id"]
#         name = data["name"]

#         cur.execute("SELECT name FROM `Crêpes` WHERE id = ?", [id,])
#         db_name: str = cur.fetchone()[0]

#         if db_name == name:
#             cur.execute("DELETE FROM Crêpes WHERE id=? AND name=?", [id, name])
#             con.close()
#         else:
#             con.close()
#             return {"status": "failed", "error": "crepe_not_found"}

#     con.close()
#     return {"status": "success"}

@cross_origin
@api_bp.route("/sold/failresistor", methods=("POST",))
def crepe_sold_failresistor():
    data = request.json
    with open("failResistance.txt", "w", encoding="UTF-8") as f:
        json.dump(data, f)
    return {"status": "success"}

@cross_origin
@api_bp.route("/sold", methods=("POST",))
def crepe_sold():
    con, cur = get_db()
    try:
        data = request.json
        if (data == None):
            return {"status": "failed"}, status.HTTP_400_BAD_REQUEST
        
        logging.debug(f"New Crêpes: {data}")


        to_db: list[tuple] = []

        try:
            cur.execute("SELECT MAX(saleID) FROM sales")
            saleID_next = int(cur.fetchone()[0]) + 1
        except Exception as e:
            logging.error(f"There has been an error: {e}")
            saleID_next = 0

        logging.debug(f"Next SaleID: {saleID_next}")

        now_time = datetime.datetime.now().isoformat()
        for crepe in data:
            cID = crepe["crepeId"]
            cNAME = crepe["name"]
            cPREIS = crepe["preis"]
            cAMOUNT = crepe["amount"]


            to_db.append((saleID_next, cNAME, cAMOUNT, cPREIS, now_time))

            logging.debug(f"Sold: ID: {cID}; NAME: {cNAME}; PREIS: {cPREIS}; AMOUNT: {cAMOUNT}")

        cur.executemany("INSERT INTO sales (saleID, crepe, amount, price, time) VALUES (?, ?, ?, ?, ?)", to_db)


        con.commit()
    except Exception as e:
        logging.exception(e)
        con.close()
        return {"status": "failed"}, status.HTTP_500_INTERNAL_SERVER_ERROR
    con.close()
    return {"status": "success"}, status.HTTP_200_OK


@api_bp.route("/sales/get", methods=("GET",))
def serve_sales():
    data = get_sales.get_dict()
    return json.dumps(data)

@api_bp.route("/sales/heatmap", methods=("GET",))
def serve_heatmap():
    data = get_sales.get_heatmap()
    return json.dumps(data)



CrepesView.register(api_bp, route_base="/crepes")


hello_str = r"""

                                    __ _ _        _   _   _ 
                                   / _(_) |      | | | | | |
 __      ___ __ ___  _ __   __ _  | |_ _| | ___  | | | | | |
 \ \ /\ / / '__/ _ \| '_ \ / _` | |  _| | |/ _ \ | | | | | |
  \ V  V /| | | (_) | | | | (_| | | | | | |  __/ |_| |_| |_|
   \_/\_/ |_|  \___/|_| |_|\__, | |_| |_|_|\___| (_) (_) (_)
                            __/ |                           
                           |___/                            

"""


if __name__ == "__main__":
    print(hello_str)