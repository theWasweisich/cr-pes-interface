import sqlite3
import flask
from werkzeug import exceptions
from flask import (
    Flask,
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

from datetime import datetime
import logging
import secrets
import sys
from ast import literal_eval

import werkzeug
import os

from blueprint_API import api_bp

import json

# logger_nerv = logging.getLogger("werkzeug")
# logger_nerv.setLevel(logging.CRITICAL)

# del logger_nerv


logging.basicConfig(filename="server.log", filemode="w", encoding="UTF-8", format="%(asctime)s %(levelname)s: %(message)s (%(filename)s; %(funcName)s; %(name)s)", level=logging.DEBUG)

app = Flask(__name__)

app.register_blueprint(api_bp, url_prefix="/api")

app.secret_key = secrets.token_hex(100)

crêpes = []

con = sqlite3.connect('datenbank.db')
cur = con.cursor()
del con

cur.execute('SELECT id, name, price, ingredients, colour FROM Crêpes')
crêpes_res = cur.fetchall()
del cur


for crepe in crêpes_res:
    crêpes.append(
        {"id": crepe[0],
         "name": crepe[1],
         "price": crepe[2],
         "ingredients": literal_eval(crepe[3]),
         "colour": crepe[4]
         }
    )



global sales
sales: list = []

valid_keys = []

@app.route("/default")
def serve_default():
    return "<h1>Hallo</h1>"


@app.route("/einstellungen")
def serve_einstellungen():
    # logging.info("Alarm")
    # return render_template("settings.jinja", crepes=crêpes)
    try:
        if not "secret" in session:
            return redirect("/einstellungen/login")
        if session["secret"] in valid_keys:
            return render_template("settings.jinja", crepes=crêpes)
        else:
            raise Exception
    except:
        return url_for("serve_login")


@app.route("/einstellungen/login", methods=("POST", "GET"))
def serve_login():
    if request.method == "GET":
        return render_template("login.jinja")
    elif request.method == "POST":
        _, cur = get_db()
        username = request.form["username"]
        password = request.form["password"]
        sql = "SELECT priviledge FROM users WHERE username = ? AND password = ?"
        cur.execute(sql, (username, password))

        try:
            if cur.fetchone()[0] == 10:
                secret = secrets.token_hex(100)
                valid_keys.append(secret)
                session["secret"] = secret
                return redirect("/einstellungen")
        except TypeError:
            return redirect("/einstellungen/login")


        return ""
    else:
        return "", 405

@app.route("/")
def serve_crepes():
    msg = get_flashed_messages()
    if "NotFound" in msg:
        resp = flask.make_response(render_template("index.jinja", crepes=crêpes, notfound=True))
        resp.headers["Cache-Control"] = "no-cache"
        return resp
    resp = flask.make_response(render_template("index.jinja", crepes=crêpes, notfound=False))
    resp.headers["Cache-Control"] = "no-cache"
    return resp



@app.route("/settings", methods=("POST",))
@cross_origin()
def get_new_crepe():
    print(request.json)
    return json.dumps({"status": "success"})


@app.route("/help_page")
def rick_roll():
    return redirect("https://youtu.be/dQw4w9WgXcQ?si=7sPxh0li5uSBE3rr") # Rickröll 😘

@app.route("/favicon.ico")
def serve_favicon():
    with open("favicon.ico", "rb") as f:
        data = f.read()
    resp = make_response(data)
    resp.headers.set("Content-Type", "image/x-icon")
    resp.status_code = 200
    return resp

@app.errorhandler(404)
def not_found(*args, **kwargs):
    flash("NotFound", category="error")
    logging.critical("Flashed!")
    return redirect("/")

@app.after_request
def after_req(e: flask.Response):
    # logging.info(f"{request.remote_addr} -- {request.method}: {request.path}")
    e.headers.add_header("X-HI", "MOINMOIN")
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
    if "einstellungen" in request.referrer:
        return redirect("/einstellungen")
    return redirect("/")


app.register_error_handler(404, bad_request)

if __name__ == "__main__":
    logging.info("👋 app.py wurde ausgeführt!")
    if '-p' in sys.argv:
        import subprocess
        _ = subprocess.run(['waitress-serve', '--host', '127.0.0.1', '--port', '80', 'app:app'])
    else:
        app.config['TEMPLATES_AUTO_RELOAD'] = True

        app.run(host='127.0.0.1', port=80, debug=True)