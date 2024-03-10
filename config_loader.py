import configparser
config = configparser.ConfigParser()
config.read("config.ini")


def get_config() -> configparser.ConfigParser:
    return config
