from dataclasses import dataclass
import mysql.connector
import mysql.connector.cursor
from dotenv import load_dotenv
import os
from os import path
import sqlite3

DOTENV_PATH2 = path.join(path.dirname(__file__), "../")
DOTENV_PATH2 = path.join(DOTENV_PATH2, ".env")
DOTENV_PATH = path.join(path.dirname(__file__), ".env")

DB_PATH = path.join(path.dirname(__file__), "../db/datenbank.db")

# pylint: skip-file


class DatabaseException(Exception):
    pass


@dataclass
class sqlite3ConTuple:
    con: sqlite3.Connection
    cur: sqlite3.Cursor


class getCrepeDB:
    """The Database connection

    Returns: tuple[Connection, Cursor]
    """

    def __enter__(self) -> tuple[sqlite3.Connection, sqlite3.Cursor]:

        if not path.exists(DB_PATH):
            raise DatabaseException("Es wurde keine gültige Datenbank gefunden!")

        self.sql3 = sqlite3ConTuple
        self.sql3.con = sqlite3.connect(DB_PATH)
        self.sql3.cur = self.sql3.con.cursor()

        return (self.sql3.con, self.sql3.cur)

    def __enter2__(self) -> tuple[mysql.connector.MySQLConnection, mysql.connector.cursor.MySQLCursor]:

        if not load_dotenv(DOTENV_PATH):
            if not load_dotenv(DOTENV_PATH2):
                raise Exception("Es konnte keine Konfigurationsdatei gefunden werden!")

        HOST = os.getenv("HOST")
        USER = os.getenv("USER")
        PASSWORD = os.getenv("PASSWORD")
        DATABASE = os.getenv("DATABASE")

        if not (type(HOST) is str and type(USER) is str and type(PASSWORD) is str and type(DATABASE) is str): 
            raise Exception("Es gab einen Fehler beim Verbinden mit der Datenbank! Zugangsdaten sind ungültig!")

        self.mydb = mysql.connector.MySQLConnection(
            host=HOST,
            user=USER,
            password=PASSWORD,
            database=DATABASE,
        )

        return self.mydb, self.mydb.cursor()

    def __exit__(self, exc_type, exc_value, exc_tb):

        try:
            self.mydb.close()
        except AttributeError:
            pass

        try:
            self.sql3.con.close()
        except AttributeError:
            pass

        return False  # Propagates Exception
