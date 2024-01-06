from locale import currency
import sqlite3

def get_db():
    con = sqlite3.connect("datenbank.db")
    cur = con.cursor()
    return con, cur

class User:
    def __init__(self, username, password, priviledge, current_key) -> None:
        self.username = username
        self.password = password
        self.priviledge = priviledge
        self.current_key = current_key
    
    def is_authorized(self, key: str, level: int):
        con, cur = get_db()

        sql = "SELECT priviledge FROM users WHERE current_key = ?"
        cur.execute(sql, (self.current_key,))
        
        con.close()
        return level == int(cur.fetchone()[0])
    
    def get_key(self):
        return self.current_key
    
    def set_key(self, key: str):
        self.current_key = key

users: list[User] = []

def load_users():
    con, cur = get_db()

    cur.execute("SELECT * FROM users")

    res = cur.fetchall()
    con.close()

    for result in res:
        users.append(User(result[1], result[2], result[3], result[4]))

def get_user_from_key(key: str) -> User | bool:
    """Gets a user with a given key

    Args:
        key (str): The key

    Returns:
        User | bool: If a user could be found, returns the user. If not returns false
    """
    for user in users:
        if user.current_key == key:
            return user
    return False

