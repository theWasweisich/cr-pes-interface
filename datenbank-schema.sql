CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE IF NOT EXISTS "shifts" (
	"id"	INTEGER,
	"time_start"	TEXT,
	"time_end"	TEXT,
	"shift_name"	TEXT DEFAULT 'standard',
	"staff"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "secret_keys" (
	"ID"	INTEGER,
	"s_key"	text,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER NOT NULL UNIQUE,
	"username"	TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"priviledge"	INTEGER NOT NULL DEFAULT 0,
	"current_key"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Crêpes" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL UNIQUE,
	"price"	REAL NOT NULL,
	"ingredients" TEXT,
	"colour"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "sales" (
	"id"	INTEGER NOT NULL,
	"saleID" INTEGER NOT NULL,
	"crepe"	TEXT NOT NULL,
	"amount"	INTEGER NOT NULL,
	"price"	REAL NOT NULL,
	"time"	TEXT NOT NULL, 
	"own_consumption" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);
