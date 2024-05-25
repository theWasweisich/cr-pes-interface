import json
import logging
from pprint import pprint
from typing import Annotated, Literal, Optional, Union, overload
import typing
from classes import CrepeSale, SingularSale, Crepes_Class, SaleItem
import datetime
from sqlite3 import Connection, Cursor
from mysql_handler._database_handling import getCrepeDB


def import_db() -> tuple[Connection, Cursor]:
    raise DeprecationWarning("Nope")
    from api.api_helpers import get_db
    return get_db


sales_complete: list[CrepeSale] = []


@overload
def get_data(as_string=None) -> list[CrepeSale]:
    """Fetches the sales data from the database

    Returns:
        list[CrepeSale]: A list containing the `CrepeSale` classes
    """
    ...


@overload
def get_data(as_string: Literal[True]) -> list[str]:
    """Fetches the sales data from the database

    Returns:
        list[str]: A list containing `CrepeSale` classes in string representation.
    """
    ...


def get_data(as_string: Optional[Literal[True]] = None) -> Union[list[CrepeSale], list[str]]:
    """Fetches the sales data from the database

    Args:
        as_string (bool, optional): If the data should be returned as String. False is returned as CrepesSale. Defaults to False.

    Returns:
        list[CrepeSale | str]: A list containing either the CrepeSales or strings (see parameter as_string)
    """
    con, cur = import_db()

    return_list = []

    cur.execute("SELECT * FROM sales")
    all_data = cur.fetchall()
    con.close()
    del con, cur

    for data in all_data:
        time_ = datetime.datetime.fromisoformat(data[5])
        if as_string:
            return_list.append(str(CrepeSale(id=int(data[0]), saleID=int(data[1]), name=data[2], amount=int(data[3]), price=float(data[4]), time=time_)))
        else:
            return_list.append(CrepeSale(id=int(data[0]), saleID=int(data[1]), name=data[2], amount=int(data[3]), price=float(data[4]), time=time_))
        sales_complete.extend(return_list)
    return return_list


def get_all_sales() -> list[SingularSale]:
    to_return: list[SingularSale] = []

    with getCrepeDB() as (_, cur):
        SQL_QUERY = "SELECT id, saletime, total, ownConsumption FROM sales"
        cur.execute(SQL_QUERY)
        res = cur.fetchall()

    for sale in res:
        id: int = int(sale[0])
        saletime: str = datetime.datetime.fromisoformat(sale[1]).isoformat()
        total: float = float(sale[2])
        ownConsumption: bool | Literal["unknown"] = sale[3]

        to_return.append(SingularSale(id=id, saleTime=saletime, total=total, ownConsumption=ownConsumption, saleItems=[]))

    return to_return


def get_all_saleItems(saleId: int):
    """Get a list of `saleItem` referring of a given saleId

    Args:
        saleId (int): The saleId
    """
    SQL1 = "SELECT id, crepesID, saleId, amount, price FROM salesItem WHERE saleId = ?"
    SQL2 = "SELECT id, name, price, ingredients, colour, type FROM crepes WHERE id = ?"

    saleItems: list[SaleItem] = []

    with getCrepeDB() as (_, cur):
        cur.execute(SQL1, (saleId,))
        res = cur.fetchall()
        for saleItem in res:
            id: int = int(saleItem[0])
            crepesId: int = int(saleItem[1])
            amount: int = int(saleItem[3])
            price: float = float(saleItem[4])

            # Crêpe-Name raussuchen:
            cur.execute(SQL2, (crepesId,))
            crepe = cur.fetchone()
            crepes = Crepes_Class(id=id, name=crepe[1], price=crepe[2], ingredients=crepe[3], color=crepe[4])
            saleItems.append(SaleItem(id, crepesId=crepesId, saleId=saleId, amount=amount, price=price, crepe=crepes.return_as_dict()))

    if len(saleItems) == 0:
        return None
    return saleItems


def create_sale_map():
    salemap = []
    sales: list[SingularSale] = get_all_sales()
    for singular in sales:
        items = get_all_saleItems(singular.id)
        if items is None:
            continue
        for item in items:
            singular.saleItems.append(item.__dict__)
        salemap.append(singular.__dict__)
    return json.dumps(salemap)


def get_highest_sale_id(data: list[CrepeSale]) -> int:
    """Returns highest SaleID

    Args:
        data (list[CrepeSale]): The result of get_data()

    Returns:
        int: The highest SaleID
    """
    high: int = -1
    for sale in data:
        if high < sale.saleID:
            high = sale.saleID
    return high


def sales_to_dict(data: list[CrepeSale]) -> tuple[list[dict[str, int | str | float]], float]:
    return_list: list[dict[str, int | str | float]] = []
    total: float = 0

    for sale in data:
        return_list.append({
                "ID": sale.id,
                "Name": sale.name,
                "amount": sale.amount,
                "price": sale.price
            })
        total += sale.price * sale.amount
    return return_list, total


def get_sales_with_id(data: list[CrepeSale], id: int) -> list[CrepeSale]:
    return_list = []
    for sale in data:
        if sale.saleID == id:
            return_list.append(sale)
    return return_list


class SaleData(typing.TypedDict):
    items: tuple
    time: str
    total: float


def get_dict():
    """Result to be sent to jinja

    Returns:
        dict[int, dict[int, dict[str, Any]]]: The data

    data:
        {
        ID: {
            "items": list[dict],
            "time": str,
            "total": float
        }
        }
    """
    data_start = get_data()

    logging.info("Getting as dict!")

    tmp_data: dict[int, list[dict[str, int | str | float]] | str | float] = {}

    ids: dict[int, CrepeSale] = {}

    for crepe in data_start:
        ids[crepe.saleID] = crepe

    for id in ids:
        sales_with_id = get_sales_with_id(data_start, id)
        tmp_data[id] = {  # type: ignore
            "items": sales_to_dict(sales_with_id)[0],
            "time": ids[id].time.isoformat(),
            "total": ids[id].price * ids[id].amount}
    return tmp_data


def get_heatmap() -> list[int]:
    """Returns the amount of sales that has been made for each hour of the day

    Returns:
        list[int]: The hours and how many sales have been made
    """

    if (sales_complete == []):
        get_data()

    to_return = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  # 0 Verkäufe für jede Stunde eines Tages (24)
    saleIDs_done = []
    for sale in sales_complete:
        if sale.saleID in saleIDs_done:
            continue
        to_return[sale.time.time().hour] += 1
        saleIDs_done.append(sale.saleID)
    return to_return


def get_summary() -> list[
    dict[
        Annotated[str, "Either '"],
        int | str | float | datetime.datetime]]:
    dataFirst = get_data()
    sold: list = []

    for sale in dataFirst:

        sold.append({
            "id": sale.id,
            "saleId": sale.saleID,
            "name": sale.name,
            "amount": sale.amount,
            "preis": sale.price,
            "time": sale.time
        })
    return sold


if __name__ == "__main__":
    map = create_sale_map()
    pprint(map)
    print(json.dumps(map))
