import sqlite3
import datetime
import json

current_time = datetime.datetime.fromisoformat("2023-12-31T22:59:59.000Z")
SHIFT_DURATION = datetime.timedelta(hours=1)

in_1_hour = current_time + SHIFT_DURATION

TIME_START = current_time.isoformat()
TIME_END = in_1_hour.isoformat()

SHIFT_NAME = "test schicht 2"

STAFF = json.dumps(['uno', 'dosso', 'terrasso'])


con = sqlite3.connect("datenbank.db")
cur = con.cursor()

cur.execute("INSERT INTO shifts (time_start, time_end, shift_name, staff) VALUES (?, ?, ?, ?)", (TIME_START, TIME_END, SHIFT_NAME, STAFF))
con.commit()
con.close()