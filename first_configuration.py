import os
import getpass
import secrets
import sqlite3

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



print(bcolors.OKBLUE + bcolors.BOLD + "[*] --- Configuration --- [*]" + bcolors.ENDC)
print("\n"*2)


def create_config():
    print(bcolors.HEADER + "Konfigurationsdatei wird erstellt." + bcolors.ENDC)

    if not os.path.isfile("./.env"):
        print(bcolors.WARNING + "[!] Eine Konfigurationsdatei besteht bereits [!]" + bcolors.ENDC)

    

    print("[*] Bitte wählen Sie einen Geheimschlüssel, welcher zur Anmeldung verwendet wird.\n\
        " + bcolors.UNDERLINE + bcolors.WARNING + "Bitte notieren Sie diesen Schlüssel, bevor sie fortfahren!" + bcolors.ENDC)

    
    geheimschlüssel = input("Geheimschlüssel: ")
    secret = secrets.token_hex(400)

    with open(".env", "w", encoding="UTF-8") as f:
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
    print(consolecontrolSequences.CLEAR_SCREEN + "HALLO")
    exit()
    create_config()
    print()
    prepare_database()
