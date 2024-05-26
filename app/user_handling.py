
from __future__ import annotations
import hashlib
import logging
import bcrypt
from flask.sessions import SessionMixin

from classes import User
from mysql_handler._database_handling import getCrepeDB


def hash_db_password_with_salt(password: bytes, salt: bytes) -> hashlib._Hash:
    return hashlib.sha256(password + salt)


def make_db_password_storable(password: str) -> tuple[bytes, bytes]:
    """Takes password, generates salt and returns db-ready data

    Args:
        password (str): The password that needs to be stored

    Returns:
        tuple[bytes, bytes]: First: Hashed Password, Second: salt
    """

    salt: bytes = bcrypt.gensalt()
    pswd: bytes = hash_db_password_with_salt(password.encode(), salt).hexdigest().encode()
    return (pswd, salt)


users: list[User] = []


def get_user_from_key(key: str) -> User | None:
    """Gets a user with a given key

    Args:
        key (str): The key

    Returns:
        User | bool: If a user could be found, returns the user. If not returns false
    """
    with getCrepeDB() as (_, cur):
        cur.execute("SELECT id, username, priviledge, current_key FROM users WHERE current_key = ?", (key,))
        res = cur.fetchone()
    if res is None:
        return
    usr = User(res[0], res[1], res[2], res[3])
    return usr


def get_user_from_username_and_password(username: str, password: str) -> User | None:
    """Returns the `User` class given username and password

    Args:
        username (str): The user's username
        password (str): The user's plaintext password (yea bad I know)

    Returns:
        User | None: The `User` class, if found. Else None
    """
    SQL1 = "SELECT id, username, password, salt, current_key, priviledge FROM users WHERE username= ? "
    with getCrepeDB() as (_, cur):
        cur.execute(SQL1, [username])

        res = cur.fetchone()

    # logging.warning(f"Result: {res=}")
    id, db_username, db_password, salt, current_key, priviledge = res

    if type(db_password) is not bytes:
        raise Exception("Das Passwort sollte in der Datenbank als bytes vorliegen!")
    if type(salt) is not bytes:
        raise Exception("Das Salt sollte in der Datenbank als bytes vorliegen!")

    hashed_pass = hashlib.sha256(password.encode() + salt).hexdigest().encode()

    if db_password == hashed_pass:
        user = User(id=id, username=db_username, priviledge=priviledge, current_key=current_key)
        logging.error(f"Returning User {user.username}")
        return user
    logging.error(f"Passwords do not match! {db_password=} vs. {hashed_pass=}")
    return None


def get_id_from_name(username: str) -> int:
    """Returns the users ID given it's username

    Args:
        username (str): The users username

    Returns:
        int: The users id
    """
    SQL = "SELECT id FROM users WHERE username = '%s'"
    with getCrepeDB() as (_, cur):
        cur.execute(SQL % username)
        res = cur.fetchone()
    return res[0]


def authenticate_user(session: SessionMixin, required_level: int) -> bool:
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
            logging.exception("The secret key could not be matched to a user!")
            return False

        if user.priviledge >= required_level:
            return True
        else:
            return False
    else:
        logging.warning("Could not find a secret in the session!")
        return False


def create_user(username: str, password: str, priviledge: int):
    """Creates a User

    Args:
        username (str): The users username
        password (str): The users password
        priviledge (int): Either 10 (full-priviledge), or 5 (Modify Schichten)
    """
    db_ready_pswd, db_ready_salt = make_db_password_storable(password)
    SQL_QUERY = "INSERT INTO users (username, password, salt, priviledge) VALUES (?, ?, ?, ?)"

    with getCrepeDB() as (_, cur):
        cur.execute(SQL_QUERY, (username, db_ready_pswd, db_ready_salt, priviledge))
        cur.connection.commit()
    return


if __name__ == "__main__":
    create_user("cheffe", "LassMichRein", 10)
