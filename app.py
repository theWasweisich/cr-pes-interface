from asyncio import constants
import sqlite3
import flask
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

from datetime import datetime, timedelta
import logging
import secrets
import sys
from typing import Any
from ast import literal_eval

from user_handling import get_db
import user_handling

import werkzeug
import os

from blueprint_API import api_bp

import json

user_handling.load_users()

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
    con, cur = get_db()
    cur.execute("SELECT s_key FROM secret_keys")
    keys = cur.fetchall()
    con.close()
    for i in range(len(keys)):
        keys[i] = keys[i][0]
    return keys

@app.route("/")
def serve_homepage():
    return render_template("index.jinja", crepes=crêpes)


@app.route("/einstellungen")
def serve_einstellungen():
    try:
        if user_handling.authenticate_user(session, 10):
            return render_template("settings.jinja", crepes=crêpes)
        else:
            flash("settings")
            return redirect("/login")

    except:
        flash("settings")
        return url_for("serve_login")


@app.route("/login", methods=("POST", "GET"))
def serve_login():

    if request.method == "GET":
        return render_template("login.jinja")

    elif request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        comming_from = request.form["from"]

        logging.info(f"Username: {username} Password: {password}")
        user = user_handling.get_user_from_username_and_password(username, password)

        logging.info(str(user))

        if user == None:
            logging.warning(f"Could not log user {user} in!")
            return render_template("login.jinja")

        try:
            if user.current_key == None:
                secret_key = secrets.token_hex(100)
                session["secret"] = secret_key

                user.set_key(secret_key)
            else:
                secret_key = user.get_key()
                if not secret_key:
                    return redirect("/login")


            if user.priviledge == 10:

                logging.debug("User priviledge is 10")
                resp = redirect("/einstellungen")
                resp.set_cookie('secret', secret_key, 3600)
                session["secret"] = secret_key
                if comming_from == "shifts":
                    return redirect("/schichten")
                return redirect("/einstellungen")

            elif user.priviledge == 5:

                logging.debug("User priviledge is 5")
                resp = redirect("/schichten")
                resp.set_cookie('secret', secret_key, 3600)
                session["secret"] = secret_key
                return redirect("/schichten")


        except TypeError:
            return redirect("/login")

        return "", status.HTTP_403_FORBIDDEN
    else:
        return "", status.HTTP_405_METHOD_NOT_ALLOWED


@app.route("/schichten")
def serve_shifts():
    logging.warning(f"{request.remote_addr} versucht, schichten zu öffnen")

    if user_handling.authenticate_user(session, 5):
        return render_template("shifts.jinja", shifts=shifts)
    else:
        flash("shifts")
        return redirect("/login")




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