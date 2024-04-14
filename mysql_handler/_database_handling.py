import mysql.connector
import mysql.connector.cursor
from dotenv import load_dotenv
import os


class getCrepeDB:
    """The Database connection

    Returns: tuple[Connection, Cursor]
    """
    def __enter__(self) -> tuple[mysql.connector.MySQLConnection, mysql.connector.cursor.MySQLCursor]:

        dotenv_path = os.path.join(os.path.dirname(__file__), ".env")

        if not load_dotenv(dotenv_path):
            raise Exception("Konfigurationsdatei nicht gefunden!")

        HOST = os.getenv("HOST")
        USER = os.getenv("USER")
        PASSWORD = os.getenv("PASSWORD")
        DATABASE = os.getenv("DATABASE")

        if not (type(HOST) == str and type(USER) == str and type(PASSWORD) == str and type(DATABASE) == str): raise Exception("Es gab einen Fehler beim Verbinden mit der Datenbank! Zugangsdaten sind ungültig!")

        self.mydb = mysql.connector.MySQLConnection(
            host=HOST,
            user=USER,
            password=PASSWORD,
            database=DATABASE,
        )

        return self.mydb, self.mydb.cursor()
    
    def __exit__(self, exc_type, exc_value, exc_tb):
        self.mydb.close()
        return False  # Propagates Exception

