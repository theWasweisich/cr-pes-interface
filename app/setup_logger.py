import logging
import logging.config
from pathlib import Path
from os import path

# logging.getLogger("werkzeug").setLevel(logging.ERROR)

ACCESS_PATH = Path(path.join(path.dirname(__file__), "./logs/access.log"))
SERVER_PATH = Path(path.join(path.dirname(__file__), "./logs/server.log"))

LOGGING_FORMAT = "%(asctime)s %(levelname)s: %(message)s || (%(name)s)"

# with open(SERVER_PATH, mode="w", encoding="UTF-8") as f:
#     f.writelines(["This", "is", "a", "log file."])

server_handler = logging.FileHandler(SERVER_PATH, encoding="UTF-8", delay=False, mode="w")
access_handler = logging.FileHandler(filename=ACCESS_PATH, encoding="UTF-8")

default_format = logging.Formatter(fmt=LOGGING_FORMAT)

server_handler.setFormatter(default_format)
server_handler.setLevel(logging.DEBUG)

access_logger = logging.getLogger("Access Logger")
access_logger.propagate = False

access_logger.addHandler(logging.FileHandler(ACCESS_PATH, encoding="UTF-8", mode="a"))


root_logger = logging.getLogger()
root_logger.addHandler(server_handler)

logging.basicConfig(filename=SERVER_PATH, filemode="a", format=LOGGING_FORMAT, encoding="UTF-8", level=logging.DEBUG)

api_logger = logging.getLogger("API Logger")
api_logger.addHandler(server_handler)
api_logger.setLevel(logging.DEBUG)
