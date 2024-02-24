import os
import getpass
import secrets
import sqlite3
import re

class consolecontrolSequences:
    CLEAR_SCREEN = '\033[2J'
    MOVE_CURSOR_TO_TOP_RIGHT = '\033[H'

    BLACK = "\033[30m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

need_to_set_up = {
    "env_file": True,
    "datenbank": True,
}




def validate_email(email: str) -> bool:
    if not re.match("[^@].*@\\w{2,}\\.\\w{2,}", email):
        return False
    else:
        return True

def setup_config_email():
    print(bcolors.OKBLUE + "[+] Soll eine debug-Email eingerichtet werden? ([J]a/[N]ein) " + bcolors.ENDC)
    if input(" ") == "J":
        finished = False
        while not finished:
            print(bcolors.OKCYAN + "[*] Bitte geben Sie die gewünschte E-Mail ein: ", end="")
            email = input()
            if validate_email(email):
                finished = True
                with open(".env", "a", encoding="UTF-8") as f:
                    f.write("# If critical emails occur, a warning will be sent to this email")
                    f.write(f"CRITICAL_ERROR_EMAIL={email}")
            if email == "exit" or email == "quit" or email == "e" or email == "q":
                finished = True
    return

def create_config():
    print(bcolors.HEADER + "Konfigurationsdatei wird erstellt." + bcolors.ENDC)

    if not os.path.isfile("./.env"):
        print(bcolors.WARNING + "[!] Eine Konfigurationsdatei besteht bereits [!]" + bcolors.ENDC)
        if input(consolecontrolSequences.RED + "Trotzdem Fortfahren? ([J]a/[N]ein) ") != "J":
            exit()

    

    print("[*] Bitte wählen Sie einen Geheimschlüssel, welcher zur Anmeldung verwendet wird.\n\
        " + bcolors.UNDERLINE + bcolors.WARNING + "Bitte notieren Sie diesen Schlüssel, bevor sie fortfahren!" + bcolors.ENDC)

    
    geheimschlüssel = input("Geheimschlüssel: ")
    secret = secrets.token_hex(400)

    with open(".env", "w", encoding="utf-8") as f:
        f.write("# Dieser geheime Schlüssel wird für die Verschlüsselung der Sitzungen verwendet\n")
        f.write(f"SECRET_KEY={secret}\n")
        f.write("\n")
        f.write("# Dies ist der Authentisierungsschlüssel. Hiermit kann das Program authorisiert werden\n")
        f.write(f"AUTH_KEY={geheimschlüssel}\n")
    
    print(bcolors.OKGREEN + "[+] Konfiguration erfolgreich abgeschlossen! \n" + bcolors.ENDC)

def prepare_database():
    print(bcolors.HEADER + "[*] --- Datenbank wird vorbereitet --- [*]\n" + bcolors.ENDC)
    con = sqlite3.connect("datenbank.db")
    
    cur = con.cursor()
    with open ('datenbank-schema.sql', "r") as f:
        script = f.read()
    
    cur.executescript(script)
    con.commit()
    con.close()
    print(bcolors.OKGREEN + "[+] Datenbank erfolgreich erstellt!\n" + bcolors.ENDC)

if __name__ == "__main__":
    
    print(bcolors.OKBLUE + bcolors.BOLD + "[*] --- Configuration --- [*]" + bcolors.ENDC)
    print("\n"*2)


    create_config()
    print()
    setup_config_email()
    print()
    prepare_database()
