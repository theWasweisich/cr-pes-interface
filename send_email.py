import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Annotated, Union, Any
from classes import CrepeSale
import get_sales
from jinja2 import Environment, FileSystemLoader

import os
from dotenv import load_dotenv

email_logger = logging.getLogger("EMAIL_LOGGER")
email_logger.setLevel(logging.DEBUG)

def prepare_data(data: list[CrepeSale]) -> tuple[list[dict[Annotated[str, "The name of the price"], 
                                                            Annotated[int, "The id, saleID and amount"] | 
                                                            Annotated[str, "The name"] | 
                                                            Annotated[float, "The price"] | 
                                                            Annotated[datetime, "The time"]]], float]:

    parsed_sales: list[dict[Annotated[str, "The name of the price"], 
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


html = str # Type alias

def prepare_html() -> html:
    data = get_sales.get_data()

    env = Environment(loader=FileSystemLoader("."))
    template = env.get_template("email_template.html")
    to_jinja = {}
    print(data)
    print(type(data))

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

def send_email():
    """Sends the summary Email to the adress in specified in `emailConfig.env`

    Args:
        body (str): The (HTML) Body to be sent as the email body
    """    
    load_dotenv("./emailConfig.env")

    sendermail = os.getenv("SENDER_EMAIL")
    senderpasswd = os.getenv("SENDER_PASSWORD")
    receivermail = os.getenv("RECEIVER_EMAIL")

    if (sendermail == None) or (senderpasswd == None) or (receivermail == None):
        email_logger.exception("Not all neccessary data has been given")
        return

    email_logger.info("[+] Preparing HTML Data for email")
    time: datetime = datetime.now()
    subject = f"Crêpes Zusammenfassung vom {time.strftime("%A, den %d. %B &Y")}"

    body = prepare_html()


    message = prepare_email(from_mail=receivermail, to_mail=sendermail, subject=subject, body=body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sendermail, senderpasswd)
        server.sendmail(sendermail, receivermail, message.as_string())
    email_logger.debug("Zusammenfassung versandt!")


if __name__ == "__main__":

    print("\033[93m Should the mail be sent now? (J/N) \033[0m".ljust(40), end="")
    answ = input("")
    match answ:
        case "J" | "j" | "Y" | "y":
            send_email()
            exit()
        case _:
            print("Keine Email wurde versandt!")