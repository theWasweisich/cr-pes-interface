from asyncio import constants
import sqlite3
import flask
import flask_login
from jinja2 import Undefined
from werkzeug import exceptions
from flask import (
    Flask,
    Response,
    flash,
    get_flashed_messages,
    make_response,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from flask_cors import cross_origin
import status
import waitress
from user_handler import (
    User
)

from datetime import datetime, timedelta
import logging
import secrets
import sys
from typing import Any
from ast import literal_eval

import werkzeug
import os

from blueprint_API import api_bp

import json

import user_handler

logging.basicConfig(filename="server.log", filemode="w", encoding="UTF-8", format="%(asctime)s %(levelname)s: %(message)s (%(filename)s; %(funcName)s; %(name)s)", level=logging.DEBUG)


app = Flask(__name__)

app.register_blueprint(api_bp, url_prefix="/api")

app.secret_key = secrets.token_hex(100)
app.permanent_session_lifetime = timedelta(minutes=5)


con = sqlite3.connect('datenbank.db')
cur = con.cursor()
del con

cur.execute('SELECT id, name, price, ingredients, colour FROM Crêpes')
crêpes_res = cur.fetchall()

cur.execute('SELECT * FROM shifts')
shifts_res = cur.fetchall()
del cur


crêpes: list[dict[str, Any]] = []




for crepe in crêpes_res:
    crêpes.append(
        {"id": crepe[0],
         "name": crepe[1],
         "price": crepe[2],
         "ingredients": literal_eval(crepe[3]),
         "colour": crepe[4]
         }
    )

shifts: list[dict[str, Any]] = []
for shift in shifts_res:
    shifts.append(
        {"id": shift[0],
         "time_start": shift[1],
         "time_end": shift[2],
         "shift_name": shift[3],
         "staff": shift[4]
         }
    )

global sales
sales: list = []

def valid_keys() -> list[str]:
    return user_handler.valid_keys()

@app.route("/")
def serve_homepage():
    return render_template("index.jinja", crepes=crêpes, shifts=shifts)


@app.route("/einstellungen")
def serve_einstellungen():
    try:
        if not "secret" in session:
            return redirect("/login", 302)
        if session["secret"] in valid_keys():
            return render_template("settings.jinja", crepes=crêpes)
        else:
            raise Exception
    except:
        return url_for("serve_login")


@app.route("/login", methods=("POST", "GET"))
def serve_login():
    if request.method == "GET":
        return render_template("login.jinja")
    elif request.method == "POST":
        con, cur = get_db()
        username = request.form["username"]
        password = request.form["password"]

        sql = "SELECT id, priviledge, current_key FROM users WHERE username = ? AND password = ?"
        cur.execute(sql, (username, password))

        try:
            entry = cur.fetchone()
            if entry[2] == None: # entry[2] ist current_key
                secret_key = secrets.token_hex(100)

                user_handler.update_key(entry[0], secret_key)

                resp = redirect("/einstellungen")
                resp.set_cookie('secret', secret_key, 3600)
                session["secret"] = secret_key
                return redirect("/einstellungen")
            else:
                if user_handler.is_authorized("Admin", entry[2]):

                    session["secret"] = entry[2]
                    return redirect("/einstellungen")

        except TypeError:
            return redirect("/login")
        finally:
            con.close()


        return "", status.HTTP_403_FORBIDDEN
    else:
        return "", status.HTTP_405_METHOD_NOT_ALLOWED


@app.route("/schichten")
def serve_shifts():
    logging.warning(f"{request.remote_addr} versucht, schichten zu öffnen")
    if not "secret" in session:
        logging.info(session)
        return redirect("/login", 307)
    if session["secret"] in valid_keys():
        return render_template("shifts.jinja", shifts=shifts)
    else:

        con, cur = get_db()
        cur.execute("DELETE FROM secret_keys WHERE s_key = ?", session["secret"])
        con.commit(); con.close()

        session.pop("secret")

        con.close()

        return "", status.HTTP_403_FORBIDDEN




@app.route("/help_page")
def rick_roll():
    resp = redirect("https://youtu.be/dQw4w9WgXcQ?si=7sPxh0li5uSBE3rr")
    resp.headers.add("Du bist ein", "l'opfl")
    return resp # Rickroll 😘

@app.route("/favicon.ico")
def serve_favicon():
    with open("favicon.ico", "rb") as f:
        data = f.read()
    resp = make_response(data)
    resp.headers.set("Content-Type", "image/x-icon")
    resp.status_code = status.HTTP_200_OK
    return resp

@app.errorhandler(status.HTTP_404_NOT_FOUND)
def not_found(*args, **kwargs):
    flash("NotFound", category="error")
    logging.critical("Flashed!")
    return redirect("/")

@app.before_request
def make_session_permanent():
    session.permanent = True

@app.after_request
def after_req(e: flask.Response):
    # if "static" in request.path:
    #     logging.debug(f"{request.remote_addr} -- {request.method} {request.path}")
    #     return e
    # logging.info(f"{request.remote_addr} -- {request.method} {request.path}")
    return e

def get_db() -> tuple[sqlite3.Connection, sqlite3.Cursor]:
    """Gets variables for the correct database connection.
    
    Return: A tuple of the connection and the cursor
    """
    try:
        conn = sqlite3.connect('datenbank.db')
        cur = conn.cursor()
        return (conn, cur)
    except:
        logging.critical("There has been an error when loading the database!")
        raise Exception("Hobbala")


def bad_request(e):
    if request.referrer:
        if "einstellungen" in request.referrer:
            return redirect("/einstellungen")
    return redirect("/")


app.register_error_handler(404, bad_request)

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

if __name__ == "__main__":
    logging.info("👋 app.py wurde ausgeführt!")

    logger = logging.getLogger("waitress")
    logger.setLevel(logging.DEBUG)

    del logger

    if ('-p' in sys.argv) or ('--production' in sys.argv):
        print(bcolors.OKGREEN + "Production-Ready Server" + bcolors.ENDC)
        waitress.serve(app, host="127.0.0.1", port=80)
    else:
        app.config['TEMPLATES_AUTO_RELOAD'] = True

        print(bcolors.WARNING + bcolors.BOLD + "Development server" + bcolors.ENDC)
        app.run(host='127.0.0.1', port=80, debug=True)