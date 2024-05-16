import sqlite3
import os


class getDB():

    def __init__(self) -> None:
        pass

    def __enter__(self) -> tuple[sqlite3.Connection, sqlite3.Cursor]:
        if not os.path.exists("../db/datenbank.db"):
            raise OSError("Die Datenbank wurde nicht gefunden!")

        self.to_return: tuple[sqlite3.Connection, sqlite3.Cursor]

        con = sqlite3.connect("../db/datenbank.db")
        cur = con.cursor()

        self.to_return = (con, cur)

        return self.to_return

    def __exit__(self, exc_type, exc_value, exc_traceback):

        try:
            self.to_return[0].commit()
            self.to_return[0].close()
        except sqlite3.Error:
            pass

        return False  # Propagate any exceptions
