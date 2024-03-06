import requests
import logging

logger = logging.getLogger("testLogger")
logger.setLevel(logging.DEBUG)

def test_get_crepes():
    try:
        response = requests.get("http://localhost:80/api/crepes/get")
    except requests.ConnectionError as e:
        assert True
    assert response.status_code == 200
    json = response.json()
    logger.debug(json)