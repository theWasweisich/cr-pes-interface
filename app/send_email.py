import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Annotated
from classes import CrepeSale, bcolors
import get_sales
from jinja2 import Environment, FileSystemLoader

import email_validator

import os
from dotenv import load_dotenv

email_logger = logging.getLogger("EMAIL_LOGGER")
email_logger.setLevel(logging.DEBUG)

SUBJECT = "Crêpes Zusammenfassung vom **DATE**"


def prepare_data(data: list[CrepeSale]) -> tuple[list[dict[Annotated[str, "The name of the crepe"], 
                                                            Annotated[int, "The id, saleID and amount"] | 
                                                            Annotated[str, "The name"] | 
                                                            Annotated[float, "The price"] | 
                                                            Annotated[datetime, "The time"]]], float]:

    parsed_sales: list[dict[Annotated[str, "The name of the crepe"], 
                        Annotated[int, "The id, saleID and amount"] | 
                        Annotated[str, "The name"] | 
                        Annotated[float, "The price"] | 
                        Annotated[datetime, "The time"]]] = []
    total: float = 0.0

    for sale in data:
        parsed_sales.append({
            "id": sale.id,
            "saleId": sale.saleID,
            "name": sale.name,
            "preis": sale.price,
            "anz": sale.amount,
            "time": sale.time
        })
        total += sale.price    

    return (parsed_sales, total)


html = str  # Type alias


def prepare_html() -> html:
    data = get_sales.get_data()

    env = Environment(loader=FileSystemLoader("."), autoescape=True)
    template = env.get_template("./static/html/email_template.html")
    to_jinja = {}

    parsed_sales, total = prepare_data(data)

    to_jinja["data"] = parsed_sales
    to_jinja["total"] = total
    rendered = template.render(to_jinja)

    return rendered


def prepare_email(from_mail: str, to_mail: str, subject: str, body: str) -> MIMEMultipart:
    message = MIMEMultipart()
    message["From"] = to_mail
    message["To"] = from_mail
    message["Subject"] = subject

    message.attach(MIMEText(body, "html"))
    return message


def send_email(recipient: str, sender: str):
    """Sends the summary Email to the adress in specified in `emailConfig.env`

    Args:
        body (str): The (HTML) Body to be sent as the email body
    """    

    sendermail = sender
    senderpasswd = os.getenv("SENDER_PASSWORD")
    receivermail = recipient

    if (sendermail is None) or (senderpasswd is None) or (receivermail is None):
        raise Exception("Not all neccessary data has been given")

    email_logger.info("[+] Preparing HTML Data for email")
    time: datetime = datetime.now()
    subject = SUBJECT.replace("**DATE**", time.strftime("%A, den %d. %B &Y"))

    body = prepare_html()

    message = prepare_email(from_mail=receivermail, to_mail=sendermail, subject=subject, body=body)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sendermail, senderpasswd)
            server.sendmail(sendermail, receivermail, message.as_string())
    except smtplib.SMTPAuthenticationError:
        email_logger.fatal("Die E-Mailadresse oder das Passwort scheinen nicht zu stimmen! Bitte kontrollieren Sie diese Daten in der Konfigurationsdatei.")
        exit()
    email_logger.debug("Zusammenfassung versandt!")


def setup() -> tuple[str, str]:
    load_dotenv("./emailConfig.env")

    reciever_email = os.getenv("RECEIVER_EMAIL")
    sender_email = os.getenv("SENDER_EMAIL")

    if reciever_email is not None:
        email_validator.validate_email(reciever_email)
    else:
        raise Exception("Empfängeradresse nicht definiert!")

    if sender_email is not None:
        email_validator.validate_email(sender_email)
    else:
        raise Exception("Senderadresse nicht definiert!")

    return reciever_email, sender_email


def api():
    re, se = setup()
    send_email(re, se)


if __name__ == "__main__":
    reciev, send = setup()

    try:
        print(bcolors.WARNING + "Soll jetzt eine Email versandt werden? ([J]a/[N]ein)" + bcolors.ENDC)
        answ = input("")
        print()
        match answ:
            case "J" | "j" | "Y" | "y":
                send_email(reciev, send)
                exit()
            case _:
                print(bcolors.OKCYAN + "Keine Email wurde versandt!" + bcolors.ENDC)
    except KeyboardInterrupt:
        print(bcolors.BOLD + bcolors.OKCYAN + "Script abgebrochen" + bcolors.ENDC)
    except Exception as e:
        print(bcolors.FAIL + "Es gab einen Fehler!" + bcolors.ENDC)
