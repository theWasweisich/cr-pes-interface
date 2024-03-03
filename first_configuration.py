import os
import secrets
import sqlite3
import email_validator
from classes import bcolors, consolecontrolSequences




def setup_config_email():
    print(bcolors.OKBLUE + "[+] Soll eine Backup-Email eingerichtet werden? ([J]a/[N]ein) " + bcolors.ENDC)
    if input(" ") == "J":
        finished = False
        while not finished:
            print(bcolors.OKCYAN + "[*] Bitte geben Sie die gewünschte E-Mail ein: ", end="")
            email = input()
            if email_validator.validate_email(email):
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
    try:
        setup_config_email()
    except email_validator.EmailNotValidError as e:
        print(bcolors.ENDC)
        print(e)
        exit()
    except:
        print(bcolors.ENDC)
    print()
    prepare_database()
