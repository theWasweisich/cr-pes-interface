from datetime import datetime
import random
import mysql.connector
from mysql.connector import MySQLConnection
from mysql.connector.cursor import MySQLCursor
from .util_classes import Sale, Crêpe, Ingredient, Ingredient_Item
from typing import Any, Literal


class SaleHandling:

    @staticmethod
    def save_sale(database: tuple[MySQLConnection, MySQLCursor], sale: Sale):
        con = database[0]
        cur = database[1]

        def insertSale(sale: Sale) -> int:
            """Inserts an entry in the `sales` table

            Args:
                sale (Sale): The sale for which to insert

            Returns:
                int: The ID of the newly inserted sale
            """

            insertSales = "INSERT INTO crepesdb.sales (saletime, total, ownConsumption) VALUES ('%s', %s, %s)"
            date = sale.time.strftime("%Y-%m-%d %H:%M:%S")
            insertSalesSQL = insertSales % (str(sale.time.strftime("%Y-%m-%d %H:%M:%S")), sale.total, 0 if sale.ownConsumption else 1)
            cur.execute(insertSalesSQL)
            salesId = cur.lastrowid
            if type(salesId) is not int:
                raise
            return salesId

        def insertSaleItems(crepes: list[Crêpe], own: bool):
            insertSaleItem = "INSERT INTO `saleitems` (`crêpesID`,`saleID`,`amount`,`price`,`ownConsumption`) VALUES (%s, %s, %s, %s, %s)"

            for crepe in crepes:
                crepe_amount = random.randint(1, 5)

                total = crepe_amount * crepe.price
                consumption = 1 if own else 0
                print(f"{total} || {consumption}")
                insertSaleItemSQL = insertSaleItem % (crepe.id, salesId, crepe_amount, total, consumption)

                cur.execute(insertSaleItemSQL)

        salesId = insertSale(sale=sale)    
        insertSaleItems(crepes=sale.crêpes, own=sale.ownConsumption)

        con.commit()

    @staticmethod
    def get_all_sales(database: tuple[MySQLConnection, MySQLCursor]) -> list[dict[str, Any]]:
        """Returns a dictionary of all sales in the database

        Args:
            database (tuple[MySQLConnection, MySQLCursor]): A tuple containing an open connection

        Raises:
            Exception: Exits if there has been an Error

        Returns:
            list[dict[str, Any]]: A JSON-compatible list of all sales
        """
        SQL1 = "SELECT id, saletime, total, ownconsumption FROM sales"
        con = database[0]
        cur = database[1]

        cur.execute(SQL1)
        res = cur.fetchall()

        to_return: list[dict[str, Any]] = []

        for sale in res:
            saleID = sale[0]
            if type(sale[1]) is datetime:
                saleTime: datetime = sale[1]
            else:
                raise Exception

            dict_: dict[str, Any] = {
                "SaleId": sale[0],
                "SaleTime": saleTime.isoformat(),
                "SaleTotal": sale[2],
                "consumption": "customer" if sale[3] == 0 else "own",
            }

            SQL2 = "SELECT id, crêpesID, saleID, amount, price, ownConsumption FROM saleitems WHERE saleID = %s" % saleID

            cur.execute(SQL2)
            res2 = cur.fetchall()

            crepeList: list[dict[str, Any]] = []

            for crepe in res2:
                SQL3 = "SELECT id, crepename, price, ingredients, crepeType FROM crêpes WHERE id = %s" % crepe[1]
                cur.execute(SQL3)
                if x := cur.fetchone():
                    crepeDict = {
                        "ID": x[0],
                        "CrepeName": x[1],
                        "CrepePrice": x[2],
                        "CrepeIngredients": x[3] if x[3] is None else None,
                        "CrepeType": x[4]
                    }
                    crepeList.append(crepeDict)
            dict_["Crepes"] = crepeList
            to_return.append(dict_)
        con.close()
        return to_return


class IngredientHandler:

    @staticmethod
    def get_all_ingredients(database: tuple[MySQLConnection, MySQLCursor]) -> list[Ingredient]:
        SQL = "SELECT * FROM ingredient"
        con, cur = database

        cur.execute(SQL)
        res = cur.fetchall()

        to_return = []

        for ingr in res:
            if type(ingr[0]) is not int: 
                raise Exception
            if type(ingr[1]) is not str: 
                raise Exception
            if type(ingr[2]) is not str: 
                raise Exception

            to_return.append(Ingredient(ingr[0], ingr[1], ingr[2]))
        return to_return

    @staticmethod
    def create_ingredient(database: tuple[MySQLConnection, MySQLCursor], ingredient: Ingredient) -> int | None:
        """Creates a new Ingredient

        Args:
            database (tuple[MySQLConnection, MySQLCursor]): The Tuple containing the database connection
            ingredient (Ingredient): The Ingredient to insert in the database

        Returns:
            int | bool: Returns the ID of the ingredient if the Execution was successfull and None otherwise
        """

        SQL = "INSERT INTO `ingredient` (`name`, `long_name`) VALUES ('%s', '%s')" % (ingredient.name, ingredient.longname)
        con, cur = database

        try:
            cur.execute(SQL)
            con.commit()
        except mysql.connector.Error(errno=1169):  # type: ignore
            return None
        return cur.lastrowid

    @staticmethod
    def add_Ingredient_to_Crêpe(database: tuple[MySQLConnection, MySQLCursor], ingredientItem: Ingredient_Item) -> int | None:
        """Adds an Ingredient to a Crêpe

        Returns:
            int | None: Returns last_row_id or None on failure
        """

        crepeID = ingredientItem.crêpeID
        iID = ingredientItem.ingredientID
        aUsed = ingredientItem.amountUsed
        aUnit = ingredientItem.amountUnit

        SQL = "INSERT INTO `ingredientitem` (`ingredientID`, `crêpeID`, `amountUsed`, `amountUnit`) VALUES (%s, %s, %s, %s);"

        preparedSQL = SQL % (iID, crepeID, aUsed, aUnit)

        database[1].execute(preparedSQL)
        database[0].commit()
        return database[1].lastrowid


class CrepeHandler:

    @staticmethod
    def get_all_crepes(database: tuple[MySQLConnection, MySQLCursor]) -> list[Crêpe]:
        SQL = "SELECT * FROM crêpes;"

        id = name = price = type_ = None

        database[1].execute(SQL)
        res = database[1].fetchall()

        to_return: list[Crêpe] = []

        for crps in res:
            id, name, price, type_ = crps

            if type(id) is not int: 
                raise Exception
            if type(name) is not str: 
                raise Exception
            if type(price) is not float: 
                raise Exception
            if type(type_) is not str: 
                raise Exception

            real_type: Literal["süß", "deftig", "spezial", "sonstiges"] = "sonstiges"

            match type_:
                case "süß":
                    real_type = "süß"
                case "deftig":
                    real_type = "deftig"
                case "spezial":
                    real_type = "spezial"

            to_return.append(Crêpe(id, name, price, real_type))

        return to_return
