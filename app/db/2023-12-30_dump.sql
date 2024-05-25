BEGIN TRANSACTION;CREATE TABLE "crepes" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL UNIQUE,
	"price"	REAL NOT NULL,
	"ingredients"	BLOB,
	"colour"	TEXT,
	PRIMARY KEY("id")
);INSERT INTO "crepes" VALUES(2,'Zimt & Zucker',2.5,'[''Zucker'',''Zimt'']','236,239,64');INSERT INTO "crepes" VALUES(3,'Schoko',3.0,'[''Schokolade'',''Schokolade'']','236,239,64');INSERT INTO "crepes" VALUES(4,'Apfelmuß & Zimt',3.0,'[''Apfelmuß'',''Zimt'']','236,239,64');INSERT INTO "crepes" VALUES(5,'Schoko & Banane',3.5,'[''abc'',''abc'']','236,239,64');INSERT INTO "crepes" VALUES(6,'Kinderschokolade',3.5,'[''Kinder'',''Schokolade'']','236,239,64');INSERT INTO "crepes" VALUES(7,'Käse',3.0,'[''Käse'', ''Käse'']','86,110,64');INSERT INTO "crepes" VALUES(8,'Schinken',3.0,'[''Schinken'', ''Schinken'']','86,110,64');INSERT INTO "crepes" VALUES(9,'Käse & Schinken',3.5,'[''abc'', ''abc'']','86,110,64');INSERT INTO "crepes" VALUES(10,'Spezial',4.0,'[''Spezi'', ''Aal'']','86,110,64');INSERT INTO "crepes" VALUES(11,'Pizza',4.5,'[''Pizza'', ''Pizza'']','86,110,64');INSERT INTO "crepes" VALUES(12,'Italiano',4.5,'[''🍕'', ''🍕'']','86,110,64');INSERT INTO "crepes" VALUES(13,'Crêpe Natur',2.0,'[''🌲'', ''🌲'']','255,255,255');INSERT INTO "crepes" VALUES(14,'Jahrescrepes ''Raphael''',3.5,'[''🌲'', ''🌲'']','91,55,87');INSERT INTO "crepes" VALUES(15,'test',123.0,'[''bbb'', ''aaa'']','255,255,255');INSERT INTO "crepes" VALUES(16,'KRASScrepes',1000.0,'[''nutella'', ''teig'', ''kotze'']','#FF1B1C');CREATE TABLE "secret_keys" (
	"ID"	INTEGER,
	"s_key"	text,
	PRIMARY KEY("ID" AUTOINCREMENT)
);INSERT INTO "secret_keys" VALUES(0,'apfelkuchen');INSERT INTO "secret_keys" VALUES(1,'809e335a32c0239f221e64d636da5fa2aa98ef94cbd0d861c302c05f1951fdca75dbc4a43a0c75839f61f3aac3952cfbbc300727bb8de5cf9a2321ff85d2de5d53ff7ae810f53043c01d6c914a75487766265b01e9213257af6df34798191824a12575d8');INSERT INTO "secret_keys" VALUES(2,'65f3a9287d500eb74761b8ae6a26be89137fd679abb67a9b559819cd04ceaf1266cb0924063b15fe1d568cf0c3395358294ae3ccfc59e3bb2bdf4e28f95a3e390ab4c845babbb648a8a3f0a0a3128d99fe412417cdb8d16acbcc70bbd4b7ff20b5dbe3f9');INSERT INTO "secret_keys" VALUES(3,'a6acf228b6634c3288280708efe9ea1025ed46d1bbc64d1cc23028c88cba084de5f15aaacea3ef5417d0d3bc8927c49f2d81cb7e44947cc8cac5da6c4c7250bf1962963d1f2d412c18a6060b9e550a4203e6712e8239f84e330b3e0eb404487e5b4f79a4');INSERT INTO "secret_keys" VALUES(4,'0ac936a9dfaad0c703ba9d4cd62553c300e22f29f3d74f9982e4b1b725c945cd5da7af8c57d2844bbe6a30a3926be1916205b808ed428b7bc309535dfeec62044ac12083b0435cf5266a7b1cd30971d4d3b6c3283d8971ccb2c370e23cad81164a309fc2');INSERT INTO "secret_keys" VALUES(5,'2adebb0c6fb2bc78a76289b49de5c7e7bfb6de40a0fb8f5387d13cf137894b201ef847ee9bf2bf2cbdb764820b57e93e8633c0730ca0a60296c10259347ec50eec464092d5797dd53ee309a393252dd23ad91a8d10c17ee819fac139f32e0b2aae8230d0');INSERT INTO "secret_keys" VALUES(6,'041999228ffd2ad3eba94a0817b6a103d44de72a0f9570ff6d169f97b35ffd0254fcbee346c7800fb1ba61eefa4d6e3b1e8e345bb769a18e4637902ae8a14ccc7e51490d53fad00cdc0dbeca6bf77432ae5e24efeb85e3480b14c3a6bded93e2e91f6954');INSERT INTO "secret_keys" VALUES(7,'4d49a8dc7ac111702f38c90fa4f794df9990c99e5fcbe966241aa8d5afbdb1126f310899d493d10355f79a3de4587956ea3902bfbd18cce329e7215d3a9a8e60412a2e29bb640d04b779b1a6164ab43ee55a52192774bcedc50879d1b8e029e6b74f66fd');INSERT INTO "secret_keys" VALUES(8,'5e7afcb33c7a5956d7c3eb1d2a2858a5ee4101281d654eefb527ce4b42ce52b8ac6107447e2c66dde5255187f1110a75a3dc23bc60057beea16ac37e9660203308e35beb48b7009ce3a9e223b8cbc1c2bd8f6c820fa580935822130d6f649bf17a2d89bf');CREATE TABLE "shifts" (
	"id"	INTEGER,
	"time_start"	TEXT,
	"time_end"	TEXT,
	"shift_name"	TEXT DEFAULT 'standard',
	"staff"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);INSERT INTO "shifts" VALUES(1,'2023-12-23 19:06:46.209260','2023-12-23 20:06:46.209260','test schicht','["uno", "dosso", "terrasso"]');INSERT INTO "shifts" VALUES(2,'2023-12-23T19:17:43.180619','2023-12-23T20:17:43.180619','test schicht 2','["uno", "dosso", "terrasso"]');INSERT INTO "shifts" VALUES(3,'2023-12-31T22:59:59+00:00','2023-12-31T23:59:59+00:00','test schicht 2','["uno", "dosso", "terrasso"]');CREATE TABLE "users" (
	"id"	INTEGER NOT NULL UNIQUE,
	"username"	TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"priviledge"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);INSERT INTO "users" VALUES(1,'cheffe','LassMichRein',10);DELETE FROM "sqlite_sequence";INSERT INTO "sqlite_sequence" VALUES('users',1);INSERT INTO "sqlite_sequence" VALUES('shifts',3);INSERT INTO "sqlite_sequence" VALUES('secret_keys',8);COMMIT;