import os
import getpass
import secrets
import sqlite3

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
    print("[*] Bitte wählen Sie einen Geheimschlüssel, welcher zur Anmeldung verwendet wird.\n\
          " + bcolors.UNDERLINE + bcolors.WARNING + "Bitte notieren Sie diesen Schlüssel, bevor sie fortfahren!" + bcolors.ENDC)

    
    geheimschlüssel = getpass.getpass("Geheimschlüssel: ")
    secret = secrets.token_hex(400)

    with open(".env", "w") as f:
        f.write("# Dieser geheime Schlüssel wird für die Verschlüsselung der Sitzungen verwendet")
        f.write(f"SECRET_KEY={secret}")
        f.write("")
        f.write("# Dies ist der Authentisierungsschlüssel. Hiermit kann das Program authorisiert werden")
        f.write(f"AUTH_KEY={geheimschlüssel}")
    
    print(bcolors.OKGREEN + "[+] Konfiguration erfolgreich abgeschlossen!" + bcolors.ENDC)

def prepare_database():
    print(bcolors.HEADER + "[*] --- Datenbank wird vorbereitet --- [*]" + bcolors.ENDC)
    con = sqlite3.connect("datenbank.db")
    
    cur = con.cursor()
    with open ('datenbank-schema.sql', "r") as f:
        script = f.read()
    
    cur.executescript(script)
    con.commit()
    con.close()
    print(bcolors.OKGREEN + "[+] Datenbank erfolgreich erstellt!" + bcolors.ENDC)


if __name__ == "__main__":
    if os.path.isfile("./.env"):
        need_to_set_up["env_file"] = False

    if os.path.isfile("./datenbank.db"):
        need_to_set_up["datenbank"] = True

    if need_to_set_up["env_file"]:
        create_config()

    if need_to_set_up["datenbank"]:
        prepare_database()
