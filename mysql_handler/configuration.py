from pprint import pprint
import dotenv
import os
import os.path
import inquirer
from inquirer.themes import BlueComposure
from termcolor import colored
import webbrowser

from colorama import just_fix_windows_console

just_fix_windows_console()

PATH = os.path.join(os.path.dirname(__file__), ".env")

def set_everything(host: str, user: str, password: str, database: str):
    dotenv.set_key(PATH, key_to_set="HOST", value_to_set=host)
    dotenv.set_key(PATH, key_to_set="USER", value_to_set=user)
    dotenv.set_key(PATH, key_to_set="PASSWORD", value_to_set=password)
    dotenv.set_key(PATH, key_to_set="DATABASE", value_to_set=database)

def startup_questions():
    print()
    print(colored(" ".center(70), on_color="on_white", attrs=["concealed"]))
    print(colored(" ".ljust(30), on_color="on_white"), end="")
    print(colored("Achtung!".center(10), color="black", on_color="on_red", attrs=["bold"]), end="")
    print(colored(" ".ljust(30), on_color="on_white"))
    print(colored(" ".center(70), on_color="on_white", attrs=["concealed"]))
    print(colored(text="Bitte zunächst die Dokumentation lesen!".center(70), on_color="on_white"))
    print()

    entry_questions = [
        inquirer.Confirm("read", message="Haben Sie die Dokumentation bereits gelesen? ")
    ]
    answ = inquirer.prompt(entry_questions, theme=BlueComposure())
    if not answ: exit()
    if not answ["read"]:
        webbrowser.open(f"file:///{os.path.realpath("readme.html")}", 2)
        exit()


def main():

    startup_questions()


    questions = [
        inquirer.Text(name="host", message="Auf welchem Host läuft die Datenbank?", default="localhost"),
        inquirer.Text(name="user", message="Welcher Benutzer soll verwendet werden?"),
        inquirer.Password("password", message="Wie lautet das Passwort für \"{user}\"?"),
        inquirer.Text(name="db", message="Welche Datenbank soll verwendet werden?")
    ]

    try:
        answs = inquirer.prompt(questions=questions, theme=BlueComposure(), raise_keyboard_interrupt=True)
    except KeyboardInterrupt:
        exit(0)
    else:
        pprint(answs)

if __name__ == "__main__":
    main()
