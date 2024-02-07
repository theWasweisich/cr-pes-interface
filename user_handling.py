import sqlite3
import logging
from flask.sessions import SessionMixin

from classes import User

def get_db():
    con = sqlite3.connect("datenbank.db")
    cur = con.cursor()
    return con, cur

users: list[User] = []

def load_users():
    con, cur = get_db()

    cur.execute("SELECT * FROM users")

    res = cur.fetchall()
    con.close()

    for result in res:
        users.append(User(result[1], result[2], result[3], result[4]))

def get_user_from_key(key: str) -> User | None:
    """Gets a user with a given key

    Args:
        key (str): The key

    Returns:
        User | bool: If a user could be found, returns the user. If not returns false
    """
    for user in users:
        if user.current_key == key:
            return user
    return

def get_user_from_username_and_password(username: str, password: str) -> User | None:
    logging.debug(f"All Users: {str(users)}")
    for user in users:
        if user.username == username and user.password == password:
            return user
    return None

def authenticate_user(session: SessionMixin, required_level: int)  -> bool:
    """Authenticates the user, if authentication fails, returns False

    Args:
        session (SessionMixin): The user's session
        required_level (int): The level required for authentication

    Returns:
        bool: If the user has been authenticated
    """
    if 'secret' in session:
        # logging.info("Secret in session")
        user = get_user_from_key(session["secret"])
        if not user:
            return False
        
        if user.priviledge >= required_level:
            return True
        else:
            return False
    else:
        # logging.info("Secret NOT in session")
        return False

