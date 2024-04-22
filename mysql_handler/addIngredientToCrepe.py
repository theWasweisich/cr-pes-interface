from typing import Literal
import inquirer
from inquirer import themes, errors

from _database_handling import getCrepeDB
from methods import CrepeHandler, IngredientHandler
from util_classes import Crêpe, Ingredient


def askForAddingIngredientToCrepe(crepes: list[Crêpe], ingrs: list[Ingredient]):
    q = inquirer.List(name="crepe", message="Bei welchem Crêpe sollen Zutaten hinzugefügt werden?",
                      choices=crepes)

    q2 = inquirer.List(name="ingrs", message="Und welche Zutat?",
                       choices=ingrs)

    answ = inquirer.prompt([q, q2], theme=themes.BlueComposure())
    if type(answ) is dict:
        return (answ["crepe"], answ["ingrs"])


def askForAction() -> Literal["Zutat erstellen", "Zutat einem Crêpe hinzufügen", "Verlassen", "EXIT"] | None:
    questions = [
        inquirer.List(name="action", message="Was möchtest du tun?", choices=[
            "Zutat erstellen",
            "Zutat einem Crêpe hinzufügen",
            "Verlassen"
        ])
    ]

    try:
        res = inquirer.prompt(questions=questions, theme=themes.BlueComposure(), raise_keyboard_interrupt=True)
    except KeyboardInterrupt:
        return "EXIT"
    if res is None:
        return
    else:
        return res["action"]


def createIngredient():

    def validation45(answers: dict, current: str) -> bool:
        if 0 == len(current) or len(current) > 45:
            raise errors.ValidationError('', f"Der Name darf nicht länger als 45 Zeichen sein! (Er ist {len(current)} Zeichen lang)")
        else:
            return True

    def validation100(answers: dict, current: str) -> bool:
        if len(current) > 100:
            raise errors.ValidationError('', f"Die Beschreibung darf nicht länger als 100 Zeichen sein! (Sie ist {len(current)} Zeichen lang)")
        else:
            return True

    questions = [
        inquirer.Text("name", "Wie heißt die Zutat? (max. 45 Zeichen)", validate=validation45),
        inquirer.Text("longname", "Wie soll eine Beschreibung der Zutat lauten? (max. 100 Zeichen)", validate=validation100),
        inquirer.Confirm("confirm", message="Soll die Zutat \"{name}\" mit der Beschreibung \"{longname}\" wirklich erstellt werden?", default=False)
    ]

    answ = inquirer.prompt(questions=questions)
    if answ:
        if answ["confirm"]:
            return answ["name"], answ["longname"]
        else:
            return None
    else:
        return None


def main():
    with getCrepeDB() as db:
        crepes = (CrepeHandler.get_all_crepes(db))
        ingredients = IngredientHandler.get_all_ingredients(db)

    exitFlag = False

    while not exitFlag:
        answ = askForAction()
        if answ == "EXIT":
            exitFlag = True

        elif answ == "Zutat einem Crêpe hinzufügen":
            answ = askForAddingIngredientToCrepe(crepes=crepes, ingrs=ingredients)
            print(answ)
            print(type(answ))

        elif answ == "Verlassen":
            exitFlag = True

        elif answ == "Zutat erstellen":
            if res := createIngredient():
                print(res)


if __name__ == "__main__":
    main()
