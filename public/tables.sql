CREATE TABLE "Lots" (
	"ID"	INTEGER,
	"Name"	TEXT,
	"Spots"	INTEGER,
	"Handicap"	INTEGER,
	"Confirm"	TEXT,
	"fullName"	TEXT,
	"imageHome"	TEXT,
	"imageInfo"	TEXT,
	"rate"	TEXT,
	"location"	TEXT,
	"description"	TEXT,
	PRIMARY KEY("Name")
);

CREATE TABLE "Spots" (
	"id"	INTEGER,
	"spotId"	INTEGER,
	"lot"	TEXT,
	"handi"	INTEGER,
	"reserved"	INTEGER,
	"timeSlots"	TEXT
);

CREATE TABLE "Transactions" (
	"id"	INTEGER,
	"spot"	INTEGER,
	"time"	TEXT,
	"user"	TEXT,
	"lot"	TEXT,
	"confirmation"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "User" (
	"id"	INTEGER,
	"username"	TEXT,
	"password"	TEXT,
	"email"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "sqlite_sequence" (
	"name"	,
	"seq"
);