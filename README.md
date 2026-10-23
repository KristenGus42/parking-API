# DubPark

DubPark is a web application prototype for exploring parking options around the University of Washington. Visitors can browse parking locations, review lot details and availability, search and filter locations, and reserve parking spots. The application also includes account registration and sign-in, transaction history, and an option to reserve a map.

This project was developed by **Kristen Gustafson and Jennifer Feng** as a two-developer CSE 154 final project.

## Features

- Browse parking locations in grid or list views.
- Search for lots and filter by accessible parking.
- View location details, rates, and parking information.
- Select a parking spot and time range, then confirm and submit a reservation.
- Create an account, sign in, and view transaction history.
- Request a map reservation.

## Technology

- **Frontend:** HTML, CSS, and JavaScript
- **Backend:** Node.js and Express
- **Database:** SQLite

## Getting started

### Requirements

- Node.js and npm

### Install and run

From the project directory, install the dependencies and start the server:

```sh
npm install
node app.js
```

Then open [http://localhost:8000](http://localhost:8000) in a browser. The server uses port `8000` by default and supports the `PORT` environment variable.

## Project structure

| Path | Description |
| --- | --- |
| `app.js` | Express server, API endpoints, and SQLite access |
| `data.db` | SQLite database used by the application |
| `public/` | Frontend pages, styles, scripts, and image assets |
| `public/tables.sql` | Database table definitions |
| `APIDOC.md` | Documentation for the API endpoints |
| `assignment-description.md` | Original course assignment description |

## Documentation

See [APIDOC.md](./APIDOC.md) for endpoint details and [assignment-description.md](./assignment-description.md) for the original course project specification.

## Project scope

DubPark is an educational prototype and is not affiliated with or connected to University of Washington parking services. Its availability and reservation information comes from the project’s local database; reservations made in the application do not reserve real-world parking.

Originally this project was worked on and hosted in a private GitHub repo for the course, and has been migrated here to be available publicly. 
