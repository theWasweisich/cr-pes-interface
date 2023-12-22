import subprocess
import webbrowser
import threading
import logging
from time import sleep

print("""
-------------------------------------------------------------------
Herzlich Wilkommen zum Crêpes verkauf!
-------------------------------------------------------------------
""")



def open_browser():
    sleep(2)
    webbrowser.open_new(url="http://localhost")
    return

threading.Thread(target=open_browser).start()
subprocess.Popen(['flask', 'run', '--host=0.0.0.0', '--port=80'])