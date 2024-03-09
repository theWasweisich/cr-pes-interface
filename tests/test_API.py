from api import api_helpers


def test_get_crepes():
    crepes = api_helpers.get_crepes(True)
    assert crepes is not None, "Keine Crêpes Erhalten!"
