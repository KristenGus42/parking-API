# DubPark API
The API document for our website DubParks includes a total of seven endpoints, 4 GET requests and 3 POST requests.
A client can retrieve information regarding the garage, floor, and spot information. User information, such as account info, reservation info, and user revuews, can be passed from client-side, and POST requests will help modify the data for all of the APIs parking garages and reservation details.


## Garage Information
**Request Format:** /building/:name


**Request Type:** GET


**Returned Data Format**: JSON


**Description:** Returns information regarding the given building in a JSON response. The information that
will be returned includes the total spots number and handicap number in the parking place, and whether
the spot is booked or not.


**Example Request:** /building/E18


**Example Response:**
```JSON
{
 "spots": 13,
 "handicap": 4,
 "booked": "3,4,"
}
```


**Error Handling:** A 404 error will be returned if the given lot does not exist.
A 500 status error will be returned if any unexpected conditions occur severside.




## Reserve a Parking Spot
**Request Format:** /reserve


**Request Type:** POST


**Returned Data Format** TEXT


**Description:** Allows a user to reserve a spot. Needs a body with parameters: spot number, lot name, username, time slot (#-#). Will return with a text response on the status of the reservation. A successful response will state that a reservation was made, and an unsuccessful response will return a message either saying that a user needs to login, or choose a valid time. An unsuccessful message will prompt the user to refresh the page and fix any issues.


**Example Request:** Body parameters: ("spot" : 7, "lot name" : E18, "username" : kgus42, "time slot" : 1-3)


**Example Response:**
```
{
 Reservation made for 7 #0401E8!
}
```
**Error Handling:** A 500 level response will be returned if an internal server error occurs stating "An error occurred on the server. Try again later."




## Parking slot booking status
**Request Format:** /booked


**Request Type:** GET


**Returned Data Format** JSON


**Description:** Returns information about all of the spots, and will
provide information about the hours that each individual spot is reserved
for.


**Example Request:** /booked


**Example Response (Trunacated):**
```JSON
{
 "booked" : [
   {"timeSlots": "na"}
   {"timeSlots": "4,"}
   {"timeSlots": "5,6,7,8,"}]
}
etc
```


**Error Handling:**
A 500 level response will be returned if an internal server error occurs stating "An error occurred on the server. Try again later."




## Retrieving Lot Information
**Request Format:** /info/:lot


**Request Type:** GET


**Returned Data Format** JSON


**Description:** This endpoint will give the user information about a requested lot, given the lot name. The information provided through this endpoint is the lots id, number of spots, whether or not it has handicapped spots, lot code, image url for the lot, and other clerical information like location, rates, description.


**Example Request:** /info/N02


**Example Response (Trunacated):**
```JSON
{
 "Handicap" : 3,
 "ID": 2,
 "Spots" : 15,
 "description" : "Padelford Parking Garage is also known as N20. It's near by McMahon Hall, Padelford Hall, and the HUB. The parking includes muti-levels.",
 "fullName" : "Padelford Parking Garage",
 "location" : "Padelford Parking Garage, Seattle, WA 98105",
 "rate" : "$4.00 hourly, $19.50 daily, $6.50 flat rate after 4 p.m. on weeknights or on Saturday"
}
etc
```


**Error Handling:** A 500 level response will be returned if an internal server error occurs stating "An error occurred on the server. Try again later."


## Retrieving Floor Attributes
**Request Format:** /signin/:username/:password


**Request Type:** GET


**Returned Data Format** TEXT


**Description:** This endpoint will match the user's provided credentials to the usernames/passwords in the current table. If it is not an exact match, a message telling the user to try again is displayed.


**Example Request:** /signin/kgus42/password


**Example Response:**
```
{
 Welcome back kgus42!
}
```


**Error Handling:** A 500 level response will be returned if an internal server error occurs stating "An error occurred on the server. Try again later."




## Retrieving User Information
**Request Format:** /transactions/:user


**Request Type:** GET


**Returned Data Format** JSON


**Description:** This endpoint will return a JSON object containing information about a users transaction history given a user name. The information returned about each transaction includes the id, spot number, time slot, user, lot name and confirmation number.


**Example Request:** /transactions/kgus42


**Example Response:**
```JSON
{
 "transactions" :[
   {"name" : 1},
   {"spot" : 7},
   {"time": 2-3},
   {"user": "kgus42"},
   {"lot": "E18"},
   {"confirmation" : "0101E8"}
 ]
}
```


**Error Handling:** A 500 level response will be returned if an internal server error occurs stating "An error occurred on the server. Try again later."




## Signing up
**Request Format:** /signup
POST parameters: username, password, email


**Request Type:** POST


**Returned Data Format** TEXT


**Description:** This endpoint will take in information about a


**Example Request:** POST parameters: username="kgus42", password="testpassword", email="kgus42@uw.edu"


**Example Response:**
```
Account created for kgus42! Refresh to sign in!
```


**Error Handling:** A 500 status error will be returned if any unexpected conditions occur severside.




## Search for a word
**Request Format:** /search/:word


**Request Type:** GET


**Returned Data Format** JSON


**Description:** This endpoint will take in a search term, and return the relevant lots to the search term.


**Example Request:** /search/burke


**Example Response:**
```JSON
{
 "locations" : ["N05"]
}


```


**Error Handling:**
A 500 level response will be returned if an internal server error occurs stating "An error occurred on the server. Try again later."




## Filtering for handicapped parking
**Request Format:** /handicapped


**Request Type:** GET


**Returned Data Format** JSON


**Description:** This endpoint will retrieve the all the lots that has handicapped parking spaces.
It will be use for the filter function in the front end.


**Example Request:** /handicapped


**Example Response:**
```JSON
{
 "handicapped" : ["N20"],
 "handicapped" : ["N05"],
 "handicapped" : ["N01"],
 "handicapped" : ["E18"],
 "handicapped" : ["C06"],
}


```


**Error Handling:**
A 500 level response will be returned if an internal server error occurs stating "An error occurred on the server. Try again later."




## Reserve a map
**Request Format:** /maps


**Request Type:** POST


**Returned Data Format** TEXT


**Description:** Allows a user to reserve a map. It will need user as body param. Will return with a JSON response on the status of the reservation with the confirmation code. A successful response will state that a reservation was made, and an unsuccessful response will return a message either saying that a user needs to login, or choose a valid time. An unsuccessful message will prompt the user to refresh the page and fix any issues.


**Example Request:** /maps
Body parameters: username = 'kgus42'


**Example Response:**
```
{
 Reservation made for 7 #0401E8!
}
```


**Error Handling:**
A 500 level response will be returned if an internal server error occurs stating "An error occurred on the server. Try again later."
