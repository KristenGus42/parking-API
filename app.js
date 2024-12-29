/**
 * Name: Kristen Gustafson & Jennifer Feng
 * Date: 12/11/2023
 * Section: CSE 154 AC, Kasten Welsh & Elias Belzberg
 *
 * This is the server side js file for our website.
 * We waill have a total of 10 end points (7 GET end points and 3 POST end points).
 * It will include retriving parking lot info from user selections or filtering from the front end,
 * keeping track of reservation transaction info (user, lot, spot, time),
 * info about booked slots, info used for user verification process, user trasaction info,
 * create new account info, retriving handicaped lot info, and free map reservation info.
 */

'use strict';

const express = require('express');
const app = express();

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const multer = require('multer');

// The status code for server errors
const SERVER = 500;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

/**
 * GET endpoint: Retrieves information about a specific parking lot by name.
 * @param {string} req.params.name - The name of the parking lot.
 * @returns {Object} - JSON object containing information about the parking lot.
 */
app.get("/building/:name", async (req, res) => {
  let name = req.params.name;
  try {
    let db = await getDBConnection();
    let query = "SELECT Spots, Handicap FROM Lots WHERE Name=?";
    let spots = await db.all(query, `${name}`);
    query = "SELECT timeSlots FROM Spots";
    let booked = await db.all(query);
    res.json({"spots": spots[0].Spots, "handicap": spots[0].Handicap, "booked": booked});
    db.close();
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send(err.message);
  }
});

/**
 * POST endpoint: Processes reservation requests and updates the database.
 * @param {Object} req.body - Request body containing spot, lot, time, and user information.
 * @returns {string} - Response message indicating the status of the reservation.
 */
app.post("/reserve", async (req, res) => {
  try {
    let curSpot = req.body.spot;
    let curLot = req.body.lot;
    let curSlot = req.body.time;
    let curUser = req.body.user;
    let db = await getDBConnection();
    let query = "SELECT timeSlots FROM Spots WHERE spotId = ? AND lot = ?";
    let data = await db.all(query, `${curSpot}`, `${curLot}`);
    let curTimes = data[0].timeSlots;
    res.type("text");
    if (curUser === "null") {
      res.send("Reservation was not made, please log in! Refresh page and try again.");
    } else if (!isBooked(curSlot, curTimes)) {
      let con = await startTransactions(curUser, curLot);
      query = "UPDATE Spots SET timeSlots = ? WHERE lot = ? AND spotId = ?";
      await db.run(query, `${getList(curSlot, curTimes)}`, `${curLot}`, `${curSpot}`);
      query = "INSERT INTO Transactions (user, lot, spot, time, confirmation) ";
      query = query + "VALUES (?, ?, ?, ?, ?)";
      await db.run(query, `${curUser}`, `${curLot}`, `${curSpot}`, `${curSlot}`, `${con}`);
      res.send("Reservation made for " + curSlot + "pm! #" + con);
    } else {
      res.send("Reservation not made, please make sure a valid time is provided. Refresh page.");
    }
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send("An error occurred on the server. Try again later.");
  }
});

/**
 * Retrieves relevant information about the current user and lot so that a
 * transaction number can be created
 * @param {String} curUser current user making transaction
 * @param {String} curLot current lot being reserved in transaction
 * @returns {Promise} a confirmation number
 */
async function startTransactions(curUser, curLot) {
  let db = await getDBConnection();
  let query = "SELECT id FROM User WHERE username=?";
  let userId = await db.all(query, `${curUser}`);
  query = "SELECT id FROM Transactions";
  let transactions = await db.all(query);
  query = "SELECT Confirm FROM Lots WHERE Name=?";
  let lotCode = await db.all(query, `${curLot}`);
  let transactionNum = transactions.length + "";
  let num = createNum(transactionNum, userId[0].id, lotCode[0].Confirm);
  return num;
}

/**
 * GET endpoint: Retrieves information about all booked time slots for parking spots.
 * @returns {Object} - JSON object containing information about booked time slots.
 */
app.get("/booked", async (req, res) => {
  try {
    let db = await getDBConnection();
    let query = "SELECT timeSlots FROM Spots";
    let booked = await db.all(query);
    res.json({"booked": booked});
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send(err.message);
  }
});

/**
 * GET endpoint: Retrieves detailed information about a specific parking lot.
 * @param {string} req.params.lot - The name of the parking lot.
 * @returns {Object} - JSON object containing detailed information about the parking lot.
 */
app.get("/info/:lot", async (req, res) => {
  try {
    let lot = req.params.lot;
    let db = await getDBConnection();
    let query = "SELECT * FROM Lots WHERE Name=?";
    let data = await db.all(query, `${lot}`);
    res.json({"data": data[0]});
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send(err.message);
  }
});

/**
 * GET endpoint: Verifies user credentials during the sign-in process.
 * @param {string} req.params.username - The username of the user.
 * @param {string} req.params.password - The password of the user.
 * @returns {string} - Response message indicating the success or
 * failure of the sign-in process.
 */
app.get("/signin/:username/:password", async (req, res) => {
  try {
    let username = req.params.username;
    let password = req.params.password;
    let db = await getDBConnection();
    let query = "SELECT id FROM user WHERE username=? AND password=?";
    let data = await db.all(query, `${username}`, `${password}`);
    res.type("text");
    if (data.length > 0) {
      res.send("Welcome back " + username);
    } else {
      res.send("There is no user " + username);
    }
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send(err.message);
  }
});

/**
 * GET endpoint: Retrieves a list of transactions associated with a specific user.
 * @param {string} req.params.user - The username of the user.
 * @returns {Object} - JSON object containing a list of user transactions.
 */
app.get("/transactions/:user", async (req, res) => {
  try {
    let user = req.params.user;
    let db = await getDBConnection();
    let query = "SELECT * FROM Transactions WHERE user=?";
    let data = await db.all(query, `${user}`);
    res.json({"data": data});
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send(err.message);
  }
});

/**
 * POST endpoint: Processes user registration requests and creates new accounts.
 * @param {Object} req.body - Request body containing username, password, and
 * email information.
 * @returns {string} - Response message indicating the status of the
 * registration process.
 */
app.post("/signup", async (req, res) => {
  try {
    let newUser = req.body.username;
    let newPassword = req.body.password;
    let newEmail = req.body.email;
    let db = await getDBConnection();
    let query = "SELECT username FROM User WHERE username=?";
    let users = await db.all(query, `${newUser}`);
    if (containsUser(users, newUser)) {
      res.type("text");
      res.send("Username already exists, please choose another!");
    } else {
      query = "INSERT INTO User (username, password, email) VALUES (?, ?, ?)";
      await db.run(query, `${newUser}`, `${newPassword}`, `${newEmail}`);
      res.type("text");
      res.send("Account created with " + newUser + "! Refresh page and sign in!");
    }
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send("An error occurred on the server. Try again later.");
  }
});

/**
 * GET endpoint: Searches for parking lots based on a given keyword.
 * @param {string} req.params.word - The keyword for searching parking lots.
 * @returns {Object} - JSON object containing a list of parking lots
 * matching the keyword.
 */
app.get("/search/:word", async (req, res) => {
  try {
    let word = req.params.word;
    let words = word.split(" ");

    let db = await getDBConnection();
    let query = "SELECT * FROM Lots";
    let data = await db.all(query);
    let locs = wordLocations(data, words[0]);
    res.json({"locations": locs});
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send(err.message);
  }
});

/**
 * GET endpoint: Retrieves the names of parking lots with handicapped spots.
 * @returns {Object} - JSON object containing an array of parking lot names
 * with handicapped spots.
 */
app.get("/handicapped", async (req, res) => {
  try {
    let db = await getDBConnection();
    let query = "SELECT Name FROM Lots WHERE handicapped=1";
    let data = await db.all(query);
    res.json({"handicapped": data});
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send(err.message);
  }
});

/**
 * POST endpoint: Processes map reservations and updates the database.
 * @param {Object} req.body - Request body containing the username.
 * @returns {string} - Response message indicating the status of the map reservation.
 */
app.post("/maps", async (req, res) => {
  try {
    let user = req.body.username;
    let db = await getDBConnection();
    let query = "SELECT id FROM User WHERE username=?";
    let userId = await db.all(query, `${user}`);
    query = "SELECT id FROM Transactions";
    let transactions = await db.all(query);
    let transactionNum = transactions.length + "";
    if (user === "null") {
      res.type("text");
      res.send("Reservation was not made, please log in!");
    } else {
      let confirmationCode = createNum(transactionNum, userId[0].id, "MM");
      res.type("text");
      query = "INSERT INTO Transactions (user, lot, spot, time, confirmation)";
      query = query + " VALUES (?, 'Map', 'na', 'All day', ?)";
      await db.run(query, `${user}`, `${confirmationCode}`);
      res.send("Map reservation made! #" + confirmationCode);
    }
  } catch (err) {
    console.error(err.messsage);
    res.status(SERVER).type("text");
    res.send("An error occurred on the server. Try again later.");
  }
});

/**
 * Finds parking lots containing a specified keyword.
 * @param {Array} data - Array of parking lot objects.
 * @param {string} word - Keyword to search for.
 * @returns {Array} - Array of parking lot names matching the keyword.
 */
function wordLocations(data, word) {
  let lots = [];
  for (let i = 0; i < data.length; i++) {
    let str = compile(data[i]);
    if (str.includes(word)) {
      lots.push(data[i].Name);
    }
  }
  return lots;
}

/**
 * Checks if a username exists in a list of users.
 * @param {Array} users - Array of user objects.
 * @param {string} user - Username to check.
 * @returns {boolean} - True if the username exists, false otherwise.
 */
function containsUser(users, user) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === user) {
      return true;
    }
  }
  return false;
}

/**
 * Compiles specific properties of a parking lot object into a single string.
 * @param {Object} data - Parking lot object.
 * @returns {string} - Compiled string of specified property values.
 */
function compile(data) {
  let ids = ["Name", "Spots", "Handicap", "fullName", "rate", "description", "tags"];
  let str = "";
  for (let i = 0; i < ids.length; i++) {
    let cur = data[[ids[i]]];
    str = str + cur;
  }
  return str;
}

/**
 * Creates a unique confirmation number based on transaction, user, and lot details.
 * @param {string} transId - Transaction ID.
 * @param {string} userId - User ID.
 * @param {string} lot - Lot code.
 * @returns {string} - Unique confirmation number.
 */
function createNum(transId, userId, lot) {
  if (transId.length !== 2) {
    transId = "0" + transId;
  }
  if (userId.length !== 2) {
    userId = "0" + userId;
  }
  return (transId + userId + lot);
}

/**
 * Checks if a specified time is booked in a given time slot.
 * @param {string} time - Time to check (e.g., "1-3").
 * @param {string} slot - Comma-separated string of booked hours (e.g., "1,2,3").
 * @returns {boolean} - True if the time is booked, false otherwise.
 */
function isBooked(time, slot) {
  let start = parseInt(time.substring(0, 1));
  let end = parseInt(time.substring(2));
  let proposedHours = [];
  for (let i = start; i < end; i++) {
    proposedHours.push(i);
  }

  let bookedHours = slot.split(",");

  for (let i = 0; i < proposedHours.length; i++) {
    for (let j = 0; j < bookedHours.length; j++) {
      if (proposedHours[i] === parseInt(bookedHours[j])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Generates a comma-separated string of hours for a specified time range.
 * @param {string} time - Time range (e.g., "1-3").
 * @param {string} oldTime - Previously booked time (or "na" if none).
 * @returns {string} - Comma-separated string of hours.
 */
function getList(time, oldTime) {
  let start = parseInt(time.substring(0, 1));
  let end = parseInt(time.substring(2));
  let hours = "";
  if (oldTime !== "na") {
    hours = oldTime;
  }
  for (let i = start; i < end; i++) {
    hours = hours + i + ",";
  }
  return hours;
}

/**
 * Faciliitates a connection between a SQLite database
 * @returns {Object} a data base connection
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "data.db",
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const local = 8000;
const PORT = process.env.PORT || local;
app.listen(PORT);