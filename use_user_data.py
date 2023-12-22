from cryptography.fernet import Fernet
import sys


def gen_new_key():
    key = Fernet.generate_key()
    with open('encryption.key', "wb") as keyfile:
        keyfile.write(key)


def read_key():
    with open('encryption.key', "rb") as keyfile:
        return keyfile.read()


if "-firstlaunch" in sys.argv:
    gen_new_key()

def get_users(username: str, password)