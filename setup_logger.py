import logging
import logging.config

LOGGING_FORMAT = "%(asctime)s %(levelname)s: %(message)s (%(name)s)"

access_logger = logging.getLogger("Access Logger")
access_logger.propagate = False

access_logger.addHandler(logging.FileHandler("access.log", encoding="UTF-8"))

api_logger = logging.getLogger("API Logger")

logging.basicConfig(filename="server.log", filemode="w", format=LOGGING_FORMAT, encoding="UTF-8", level=logging.DEBUG)

handler = logging.FileHandler(filename="access.log", encoding="UTF-8")
