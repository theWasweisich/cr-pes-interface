import logging
import logging.config

ACCESS_PATH = "./logs/access.log"
SERVER_PATH = "./logs/server.log"

LOGGING_FORMAT = "%(asctime)s %(levelname)s: %(message)s (%(name)s)"

access_logger = logging.getLogger("Access Logger")
access_logger.propagate = False

access_logger.addHandler(logging.FileHandler(ACCESS_PATH, encoding="UTF-8"))

api_logger = logging.getLogger("API Logger")

logging.basicConfig(filename=SERVER_PATH, filemode="w", format=LOGGING_FORMAT, encoding="UTF-8", level=logging.DEBUG)

handler = logging.FileHandler(filename=ACCESS_PATH, encoding="UTF-8")
