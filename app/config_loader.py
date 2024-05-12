import configparser
import os
from pathlib import Path

config = configparser.ConfigParser()
PATH = os.path.join(os.path.dirname(__file__), "config.ini")
config.read(PATH)


def get_config() -> configparser.ConfigParser:
    return config


def get_path() -> Path:
    return Path(PATH)
