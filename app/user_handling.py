
import hashlib
import bcrypt
from flask.sessions import SessionMixin

from classes import User
from mysql_handler._database_handling import getCrepeDB


def hash_password_with_salt(password: bytes, salt: bytes): 
    return hashlib.sha256(password + salt)


def make_password_storable(password: str) -> tuple[bytes, bytes]:
    """Takes password, generates salt and returns db-ready data

    Args:
        password (str): The password that needs to be stored

    Returns:
        tuple[bytes, bytes]: First: Hashed Password, Second: salt
    """

    salt = bcrypt.gensalt()
    pswd = hash_password_with_salt(password.encode(), salt)
    return (pswd.hexdigest().encode(), salt)


users: list[User] = []


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

    id, username_, password_, salt, current_key, priviledge = res
    assert type(password_) is str

    assert type(password)

    hashed_pass = hashlib.sha256((password + salt).encode()).hexdigest()

    if str(password_) == hashed_pass:

        return User(username=username, priviledge=priviledge, current_key=current_key)
    return None


def get_id_from_name(username: str) -> int:
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
            return False

        if user.priviledge >= required_level:
            return True
        else:
            return False
    else:
        # logging.info("Secret NOT in session")
        return False
