import os
import re
import secrets
import sqlite3
import email_validator
import configparser
from classes import bcolors, consolecontrolSequences

def translate_exception(engl_text: str) -> str:
    regex = r"The domain name (?<address>.+) does not ((?<accept>accept email)|(?<send>send email)|(?<exist>exist))."
    subst = "Der Domain name ${address} ${accept:+akzeptiert keine E-Mails}${send:+versendet keine E-Mails!}${exist:+existiert nicht!}"

    translated: str = ""
    does_not_accept = "The domain name {domain_i18n} does not accept email."
    does_not_send = "The domain name {domain_i18n} does not send email."
    does_not_exist = "The domain name {domain_i18n} does not exist."
    missing_at = "The email address is not valid. It must have exactly one @-sign."
    missing_prefix = "There must be something before the @-sign."
    missing_suffix = "There must be something after the @-sign."
    invalid_chars = "The email address contains an invalid character."
    two_periods_in_row = "An email address cannot have two periods in a row."
    too_long_after_at = "The email address is too long after the @-sign."
    too_long_reason = "The email address is too long {reason}."

    if engl_text.startswith("The domain"):
        translated = re.sub(regex, subst, engl_text)
    elif engl_text.startswith("The email address is too long") and not engl_text.endswith("after the @-sign."):
        translated = "Die E-Mail Adresse ist zu lang!"
    else:
        match engl_text:
            case "The email address is not valid. It must have exactly one @-sign.":
                translated = "Die E-Mail Adresse ist ungültig. Es muss genau ein @ Zeichen vorhanden sein!"
            case "There must be something before the @-sign.":
                translated = "Es muss etwas vor dem @ Zeichen stehen!"
            case "There must be something after the @-sign.":
                translated = "Es muss etwas nach dem @ Zeichen stehen!"
            case "The email address contains an invalid character.":
                translated = "In der E-Mail adresse befindet sich ein ungültiges Zeichen!"
            case "An email address cannot have two periods in a row.":
                translated = "Die E-Mail Adresse darf keine zwei aufeinanderfolgende Punkte haben!"
            case "The email address is too long after the @-sign.":
                translated = "Die E-Mail Adresse ist nach dem @ Zeichen zu lang!"
            case _:
                translated = "Es gab einen Fehler! Haben Sie vielleicht die E-Mail Adresse falsch geschrieben?"

    return translated

config = configparser.ConfigParser(allow_no_value=True)

config.add_section("SECRETS")
config.add_section("EMAIL")

config.set("DEFAULT", "; DEBUG_MODE sollte NIE in Produktion verwendet werden!")
config.set("DEFAULT", "DEBUG_MODE", "no")
config.set("DEFAULT", "IS_EMAIL_ACTIVE", "no")


def setup_config_email():
    print(bcolors.OKBLUE + "[+] Soll eine Backup-Email eingerichtet werden? ([J]a/[N]ein) " + bcolors.ENDC)
    if input(" ") == "J":
        finished = False
        while not finished:
            print(bcolors.OKCYAN + "[*] Bitte geben Sie die gewünschte E-Mail ein: ", end="")
            email = input()
            try:
                email_validator.validate_email(email)
            except (email_validator.EmailNotValidError) as e:
                print(bcolors.FAIL + translate_exception(str(e)) + bcolors.ENDC + bcolors.OKCYAN)
                print()
                continue

            if email_validator.validate_email(email):
                finished = True
                config.set("EMAIL", "config_email", email)
                config.set("DEFAULT", "IS_EMAIL_ACTIVE", "yes")
                with open(".env", "a", encoding="UTF-8") as f:
                    f.write("# If critical emails occur, a warning will be sent to this email")
                    f.write(f"CRITICAL_ERROR_EMAIL={email}")
            elif email == "exit" or email == "quit" or email == "e" or email == "q":
                finished = True
            else:
                finished = False
    return

def create_config():

    def get_geheimschluessel() -> str:
        print("[*] Bitte wählen Sie einen Geheimschlüssel, welcher zur Anmeldung verwendet wird.\n\
            " + bcolors.UNDERLINE + bcolors.WARNING + "Bitte notieren Sie diesen Schlüssel, bevor sie fortfahren!" + bcolors.ENDC)
        
        geheimschlüssel_valid = False
        failed_tries = 0
        geheimschlüssel: str = ""
        while not geheimschlüssel_valid:
            geheimschlüssel = input("Geheimschlüssel: ")
            if len(geheimschlüssel) >= 5:
                geheimschlüssel_valid = True
                break
            else:
                failed_tries += 1
                if failed_tries >= 6:
                    raise SystemExit(bcolors.FAIL + "Die Konfiguration wurde abgebrochen. Der Geheimschlüssel konnte nicht erfolgreich gesetzt werden" + bcolors.ENDC)
                print(bcolors.FAIL + f"[!] Achtung! Der geheimschlüssel muss mindestens 5 Buchstaben lang sein! [{failed_tries}/5]" + bcolors.ENDC)
        return geheimschlüssel


    print(bcolors.HEADER + "Konfigurationsdatei wird erstellt." + bcolors.ENDC)

    if os.path.isfile("./.env"):
        print(bcolors.WARNING + "[!] Eine Konfigurationsdatei besteht bereits [!]" + bcolors.ENDC)
        if input(consolecontrolSequences.RED + "Trotzdem Fortfahren? ([J]a/[N]ein) ") != "J":
            exit()



    geheimschlüssel = get_geheimschluessel()

    secret = secrets.token_hex(400)

    with open(".env", "w", encoding="utf-8") as f:
        f.write("# Dieser geheime Schlüssel wird für die Verschlüsselung der Sitzungen verwendet\n")
        f.write("# !! ⛔ Dieser Schlüssel sollte nicht geändert werden ⛔ !!\n")
        f.write(f"SECRET_KEY={secret}\n")
        f.write("\n")
        f.write("# Dies ist der Authentisierungsschlüssel. Hiermit kann das Program authorisiert werden\n")
        f.write(f"AUTH_KEY={geheimschlüssel}\n")
    config.set("SECRETS", "auth_key", geheimschlüssel)
    config.set("SECRETS", "secret_key", secret)
    print(bcolors.OKGREEN + "[+] Konfiguration erfolgreich abgeschlossen! \n" + bcolors.ENDC)

def prepare_database():
    print(bcolors.HEADER + "[*] --- Datenbank wird vorbereitet --- [*]\n" + bcolors.ENDC)
    con = sqlite3.connect("datenbank.db")
    
    cur = con.cursor()
    with open ('datenbank-schema.sql', "r") as f:
        script = f.read()
    
    cur.executescript(script)
    con.commit(); con.close()
    print(bcolors.OKGREEN + "[+] Datenbank erfolgreich erstellt!\n" + bcolors.ENDC)



if __name__ == "__main__":
    
    print(bcolors.OKBLUE + bcolors.BOLD + "[*] --- Configuration --- [*]" + bcolors.ENDC)

    create_config()
    print()
    try:
        setup_config_email()
    except email_validator.EmailNotValidError as e:
        print(bcolors.ENDC)
        print(translate_exception(str(e)))
        exit()
    except:
        print(bcolors.ENDC)
    print()
    prepare_database()
    print(bcolors.OKGREEN + "Konfiguration erfolgreich abgeschlossen!" + bcolors.ENDC)

    with open("config.ini", "w") as conf:
        config.write(conf)
