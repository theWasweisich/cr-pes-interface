import sqlite3
from typing import Literal

class User:
    def __init__(self, username: str | None = None, password: str | None = None, priviledge: int | None = None, current_key: str | None = None) -> None:
        if username and password and priviledge:
            self.username = username
            self.password = password
            self.priviledge = priviledge
            self.current_key = None
        if current_key:
            self.current_key = current_key
    
    def get_level(self) -> int:
        return self.priviledge
    
    def get_username(self) -> str:
        return self.username
    
    def get_key(self):
        return self.current_key


def fetch_all_users() -> list[User]:
    users: list[User] = []
    
    con, cur = get_db()
    cur.execute("SELECT * FROM users")
    res = cur.fetchall()
    con.close()
    for user in res:
        users.append(User(user[1], user[2], user[3], user[4]))
    con.close()
    return users

def get_db() -> tuple[sqlite3.Connection, sqlite3.Cursor]:
    con = sqlite3.connect("datenbank.db")
    cur = con.cursor()
    return con, cur

def valid_keys() -> list[str]:
    keys: list[str] = []
    for user in fetch_all_users():
        key = user.get_key()
        if key != None:
            keys.append(key)
    return keys

def is_authorized(level: Literal["Admin"] | Literal["Standbeauftragter"], key) -> bool:
    """Checks if the user is who he claims to be

    Args:
        `level` (Literal[&quot;Admin&quot;] | Literal[&quot;Standbeauftragter&quot;]): The User Level to check against
        `key` (_type_): The user's key

    Returns:
        bool: If is authorized
    """

    for user in fetch_all_users():
        if user.get_key() == key:
            usr_level = user.priviledge
            if level == "Admin":
                return usr_level == 10
            elif level == "Standbeauftragter":
                return usr_level == 5
            else:
                return False
    
    return False

def check_key(key: str):
    con, cur = get_db()

    sql = "SELECT username, password, priviledge FROM users WHERE current_key = ?"
    cur.execute(sql, [key,])

    res = cur.fetchone()
    con.close()
    if len(res) == 0:
        return False

def update_key(id: int, new_key: str):
    con, cur = get_db()

    cur.execute("UPDATE users SET current_key = ? WHERE id = ?", [new_key, str(id)])

    con.commit()
    con.close()
    return