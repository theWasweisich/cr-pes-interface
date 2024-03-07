-- database: c:\Users\langb\OneDrive\PythonProjekte\Python\flask\crepes_interface\datenbank.db

-- Use the ▷ button in the top right corner to run the entire file.

DELETE FROM sales; -- delte everything from the sales table

DELETE FROM sqlite_sequence WHERE name="sales"; -- Resets autoincrement