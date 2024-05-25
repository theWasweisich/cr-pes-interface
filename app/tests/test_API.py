
def test_nothing():
    assert 1 == 1, "Die Mathematik ist kaputt!"
    return


# def test_auth():
#     try:
#         from api.api_blueprint import verify_auth
#     except ModuleNotFoundError:
#         from ..api.api_blueprint import verify_auth
#     res = verify_auth("geheim")
#     assert res is True, "Autentifizierung geht ned!"
