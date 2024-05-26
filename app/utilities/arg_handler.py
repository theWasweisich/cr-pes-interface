"""Handles the argument parsing for app.py"""
import argparse

parser = argparse.ArgumentParser(
    usage="The Crêpes Application",
)

group = parser.add_mutually_exclusive_group(required=False)

parser.add_argument(
    "-v",
    "--verbose",
    action="store_true", 
    dest="verbose", 
    default=False,
    help="Run in verbose Mode"
)

group.add_argument(
    "-p", 
    "--production", 
    action="store_true", 
    dest="runProd", 
    default=False,
    help="Configure Server to simulate production environment"
)

group.add_argument(
    "-w", 
    "--waitress", 
    action="store_true", 
    dest="runWaitress", 
    default=False,
    help="Configure Server to use waitress to serve app"
)

group.add_argument(
    "-d", 
    "--debug", 
    action="store_true", 
    dest="runDebug", 
    default=False,
    help="Configure Server to run in development configuration"
)
