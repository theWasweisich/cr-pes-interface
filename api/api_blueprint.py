import os
from typing import Any
from flask import (
    Blueprint,
    request
)
# import flask
from flask_classful import FlaskView, route
import logging
import sqlite3
import status
# import status

import datetime
import pytz
import json
import get_sales
# import configparser
from config_loader import config

from api.api_helpers import get_db, parse_price, get_crepes

api_logger = logging.getLogger("API Logger")
api_logger.propagate = True

blocked_routes = [
    "/api/banana"
]
"""
All routes, that are blocked.

Must start with '/api/{route}'
"""


time_zone = pytz.timezone("Europe/Berlin")

api_bp = Blueprint('api_bp', __name__)

CHANGE_DB = False


class CrepesView(FlaskView):

    @staticmethod
    @route("/get", methods=("GET",))
    def get():
        crepes = get_crepes(as_dict=True)
        if (crepes):
            return crepes
        else:
            return {"status": "failed"}, status.HTTP_204_NO_CONTENT

    @staticmethod
    @route("/delete", methods=("DELETE",))
    def delete_crepe():
        """
        Function to delete the crêpes specified by the given data
        Data should contain: `id`, `name`
        """

        data_list = request.get_json()

        if not CHANGE_DB:
            return {"status": "success", "deleted": data_list}

        con, cur = get_db()
        error_detail: str | None = None

        for data in data_list:
            id = data["id"]
            name = data["name"]

            cur.execute("SELECT name FROM `Crêpes` WHERE id = ?", [id,])
            db_name: str = cur.fetchone()[0]

            if db_name == name:
                cur.execute("DELETE FROM Crêpes WHERE id=? AND name=?",
                            [id, name])
            else:
                api_logger.exception("Der zu löschende Crepe wurde nicht \
                                  gefunden!")
                error_detail = f"requested crepe not found! ({name})"
                break

        con.commit()
        con.close()
        if error_detail:
            return {"status": "failed", "detail": error_detail}
        else:
            return {"status": "success", "deleted": data_list}

    @staticmethod
    @route("/new", methods=("PUT",))
    def new_crepe():
        data_list = request.get_json()

        if not CHANGE_DB:
            return {"status": "success"}

        if len(data_list) == 0:
            return {"status": "failed", "type": "noting_changed"}

        data_list: list[dict[str, Any]] = data_list

        for data in data_list:
            name: str = data["name"]
            price: float = data["price"]
            ingredients: list[str] = data["ingredients"].split(",")
            for i in range(len(ingredients)):
                ingredients[i] = ingredients[i].strip()

            color: str = data["color"]

            api_logger.info(f"Parsed Crêpes: {name} || {price} || {ingredients} \
                         || {color}")

            con, cur = get_db()

            try:
                cur.execute("INSERT INTO Crêpes (name, price, ingredients,\
                             colour) VALUES (?, ?, ?, ?)", (name, price, str(ingredients), color))
                con.commit()
            except sqlite3.OperationalError as e:
                return {"status": "error", "type": "database", "error": e.sqlite_errorname}

            except sqlite3.IntegrityError as e:
                if e.sqlite_errorcode == 2067:
                    return {"status": "error", "type": "crepe_exists"}

                return {"status": "error", "type": "database", "error": e.sqlite_errorname}
            except Exception:
                return {"status": "error", "type": "unknown"}

            con.close()

        return {"status": "success"}

    @staticmethod
    @route("/edit", methods=("PATCH",))
    def edit_crepe():

        if not CHANGE_DB:
            return {"status": "success"}

        con, cur = get_db()
        data = request.get_json()
        api_logger.debug(f"Edited Crêpes arrived!\nData: {data}")
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
            api_logger.debug(f"DB_Data: {db_name} ({type(db_name)}) :: {db_price} ({type(db_price)})")

            if (db_price != price_str):
                api_logger.info(f"Database & Edited are not the same! {db_price_str} vs {price_str}")
                cur.execute("UPDATE Crêpes SET price=? WHERE id=?", (price, id))
            if name != db_name:
                api_logger.info(f"Database & Edited are not the same! {name} vs {db_name}")
                cur.execute("UPDATE Crêpes SET name=? WHERE id=?", (name, id))

        con.commit()
        con.close()
        return {"status": "success"}

    @staticmethod
    @route("/sold", methods=("POST",))
    def crepe_sold():

        if not CHANGE_DB:
            return {"status": "success"}

        con, cur = get_db()
        try:
            data = request.json
            if (data is None):
                return {"status": "failed"}, status.HTTP_400_BAD_REQUEST

            api_logger.debug(f"New Crêpes: {data}")

            to_db: list[tuple] = []

            try:
                cur.execute("SELECT MAX(saleID) FROM sales")
                saleID_next = int(cur.fetchone()[0]) + 1
            except Exception as e:
                api_logger.error(f"There has been an error: {e}")
                saleID_next = 0

            api_logger.debug(f"Next SaleID: {saleID_next}")

            now_time = datetime.datetime.now().isoformat()
            for crepe in data:
                cID = crepe["crepeId"]
                cNAME = crepe["name"]
                cPREIS = crepe["preis"]
                cAMOUNT = crepe["amount"]

                if 'ownConsumption' in request.headers:
                    consumpt = request.headers["ownConsumption"]
                else:
                    api_logger.fatal("Own Consumption not found in headers!")

                to_db.append((saleID_next, cNAME, cAMOUNT, cPREIS, now_time, consumpt))

                api_logger.debug(f"Sold: ID: {cID}; NAME: {cNAME}; PREIS: {cPREIS}; AMOUNT: {cAMOUNT}; OWNCONSUMPTION: {consumpt}")

            cur.executemany("INSERT INTO sales (saleID, crepe, amount, price, time, Consumption) VALUES (?, ?, ?, ?, ?, ?)", to_db)

            api_logger.debug("Inserted Crêpes!")
            api_logger.debug(cur.fetchone())

            cur.connection.commit()
            con.commit()
            con.close()
        except Exception as e:
            api_logger.exception(e)
            con.close()
            con.close()
            return {"status": "failed"}, status.HTTP_500_INTERNAL_SERVER_ERROR
        con.close()
        return {"status": "success"}, status.HTTP_200_OK


class SalesView(FlaskView):

    @staticmethod
    @route("/failresister")
    def crepe_sold_failResister():
        data = request.json
        with open("failResistance.txt", "w", encoding="UTF-8") as f:
            json.dump(data, f)
        return {"status": "success"}, status.HTTP_200_OK

    @staticmethod
    @route("/sold")
    def get_sold_crepe():
        con, cur = get_db()
        try:
            data = request.json
            if (data is None):
                return {"status": "failed"}, status.HTTP_400_BAD_REQUEST

            api_logger.debug(f"New Crêpes: {data}")

            to_db: list[tuple] = []

            try:
                cur.execute("SELECT MAX(saleID) FROM sales")
                saleID_next = int(cur.fetchone()[0]) + 1
            except Exception as e:
                api_logger.error(f"There has been an error: {e}")
                saleID_next = 0

            api_logger.debug(f"Next SaleID: {saleID_next}")

            now_time = datetime.datetime.now().isoformat()
            for crepe in data:
                cID = crepe["crepeId"]
                cNAME = crepe["name"]
                cPREIS = crepe["preis"]
                cAMOUNT = crepe["amount"]

                to_db.append((saleID_next, cNAME, cAMOUNT, cPREIS, now_time))

                api_logger.debug(f"Sold: ID: {cID}; NAME: {cNAME}; \
                              PREIS: {cPREIS}; AMOUNT: {cAMOUNT}")

            cur.executemany("INSERT INTO sales (saleID, crepe, amount, price, \
                             time) VALUES (?, ?, ?, ?, ?)", to_db)

            con.commit()
        except Exception as e:
            api_logger.exception(e)
            con.close()
            return {"status": "failed"}, status.HTTP_500_INTERNAL_SERVER_ERROR
        con.close()
        return {"status": "success"}, status.HTTP_200_OK

    @staticmethod
    @route("/get")
    def get_sales():
        data = get_sales.get_dict()
        return json.dumps(data), status.HTTP_200_OK

    @staticmethod
    @route("/heatmap")
    def get_heatmap():
        data = get_sales.get_heatmap()
        return json.dumps(data), status.HTTP_200_OK


@api_bp.before_request
def before_request():
    for forbidden_path in blocked_routes:
        if forbidden_path == request.path:
            return {"status": "forbidden",
                    "description": "This HTTP-Route has been forbidden. Please check the corresponding blueprint file."}, status.HTTP_403_FORBIDDEN

    if request.headers.get("X-crepeAuth", "") == config.get("SECRETS", "auth_key"):
        return                                                                      # Go on with routing
    else:
        return {"status": "notAuthorized"}, status.HTTP_401_UNAUTHORIZED            # Stop unauthorized access


@api_bp.get("/checkAuth")
def check_auth():
    if request.headers.get("X-crepeAuth", "PPP") == os.getenv("AUTH_KEY"):
        return {"authStatus": "authorized"}, status.HTTP_200_OK
    else:
        return {"authStatus": "unauthorized"}, status.HTTP_401_UNAUTHORIZED


CrepesView.register(api_bp, route_base="/crepes")
SalesView.register(api_bp, route_base="/sales")


if __name__ == "__main__":
    raise NotImplementedError('File not runnable.\nPlease use app.py')
