/**
 * Last Edit: Kristen
 * Date: 12/11/23
 * Section: CSE 154 AC, Kasten Welsh & Elias Belzberg
 *
 * This is the js file for the parking reservation page. This file
 * will set up the appearance of the parking page based on the given
 * user information about the parking lot to be displayed. This file
 * provides all reservation functionality
 */

'use strict';
(function() {
  window.addEventListener("load", init);

  /**
   * Sets up event listeners that can detect whether or not a user
   * is interacting with the page
   */
  function init() {
    document.getElementById("history-btn").addEventListener("click", historyPage);
    document.getElementById("submit-btn").addEventListener("click", reserve);
    document.getElementById("edit-btn").addEventListener("click", edit);
    document.getElementById("confirmation-btn").addEventListener("click", confirmUser);

    let curLot = localStorage.getItem("lot").toUpperCase();
    document.getElementById("page-title").textContent = curLot;
    setUp(curLot);
  }

  /**
   * direct to transaction history page
   */
  function historyPage() {
    let url = 'history.html';
    window.location.href = url;
  }

  /**
   * Allows user to return to spots view and edit their reservation
   */
  function edit() {
    setUp(localStorage.getItem("lot").toUpperCase());
    document.getElementById("user-confirmation").classList.add("hidden");
    document.querySelector("#spots-space-container h3").classList.remove("hidden");
    document.getElementById("confirmation-btn").disabled = false;
  }

  /**
   * Meant to show the user a confirmation page to confirm
   * their reservation details before submitting
   */
  function confirmUser() {
    document.getElementById("spots-space").innerHTML = "";
    document.getElementById("user-confirmation").classList.remove("hidden");
    document.getElementById("confirmation-btn").disabled = true;
    document.querySelector("#spots-space-container h3").classList.add("hidden");
  }

  /**
   * Meant to allow a user to submit reservation request
   */
  function reserve() {
    document.getElementById("submit-btn").disabled = true;
    const seconds = 3000;
    setTimeout(confirmationDom, seconds);
  }

  /**
   * If a user has a valid reservation request, it can be updated offiicially
   * @param {String} time the time of the reservation
   */
  async function updateDb(time) {
    let form = new FormData();
    form.append("spot", sessionStorage.getItem("spot"));
    form.append("lot", localStorage.getItem("lot").toUpperCase());
    form.append("user", localStorage.getItem("user"));
    let endTimeStr = parseInt(time[time.length - 1]) + 1;
    let timeStr = time[0] + "-" + (endTimeStr);
    form.append("time", timeStr);
    try {
      let response = await fetch("/reserve", {method: "POST", body: form});
      await statusCheck(response);
      response = await response.text();
      updateConfirm(response);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Displays a confirmation message
   * @param {Response} res contains information about the reservation request
   */
  function updateConfirm(res) {
    document.getElementById("message").textContent = res;
  }

  /**
   * Reads user input on what time slot they want
   * @returns {Array} the values of the clicked time buttons
   */
  function getTime() {
    let btns = document.querySelectorAll("input");
    let checkedBtns = [];
    for (let i = 0; i < btns.length; i++) {
      if (btns[i].checked) {
        checkedBtns.push(btns[i].value);
      }
    }
    return checkedBtns;
  }

  /**
   * Organizes reservation information and checks to see if all
   * inputs have been properly recieved
   */
  function confirmationDom() {
    document.getElementById("spots-space").innerHTML = "";
    document.getElementById("spots-space").classList.remove("hidden");
    document.getElementById("user-confirmation").classList.add("hidden");
    document.getElementById("confirmation-btn").disabled = true;
    let arrTime = getTime();
    let message = document.createElement("h2");
    message.id = "message";
    if (arrTime.length === 0) {
      message.textContent = "Please choose a time! Your page will refresh in 3 seconds";
      let space = document.getElementById("spots-space");
      space.appendChild(message);
      const seconds = 5000;
      setTimeout(function() {
        setUp(localStorage.getItem("lot").toUpperCase());
      }, seconds);
    } else {
      let space = document.getElementById("spots-space");
      space.appendChild(message);
      updateDb(arrTime);
    }
  }

  /**
   * Displays all of the parking spots
   * @param {String} name the name of the lot being displayed
   */
  async function setUp(name) {
    document.getElementById("submit-btn").disabled = false;
    try {
      let response = await fetch("building/" + name);
      await statusCheck(response);
      response = await response.json();
      createLotDOM(response);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This is a function that represents retrieving information about a specific garage,
   * its main purpose is to produce the garage information in the format of
   * an array of arrays.
   * @param {Response} res response carrying spot and lot information
   */
  function createLotDOM(res) {
    let nSpots = res.spots;
    let lot = [];
    for (let i = 0; i < nSpots; i++) {
      lot.push(i);
    }

    for (let i = 1; i < res.handicap; i++) {
      let spot = document.createElement("article");
      spot.classList.add("handi-spot");
      spot.id = lot[i];

      let heading = document.createElement("p");
      heading.textContent = lot[0] + ": " + i;
      spot.appendChild(heading);

      document.getElementById("spots-space").appendChild(spot);
      spot.addEventListener("click", selected);
    }

    for (let i = (res.handicap); i < (lot.length); i++) {
      let spot = document.createElement("article");
      spot.classList.add("spot");
      spot.id = lot[i];

      let heading = document.createElement("p");
      heading.textContent = lot[0] + ": " + i;
      spot.appendChild(heading);

      document.getElementById("spots-space").appendChild(spot);
      spot.addEventListener("click", selected);
    }

    if (document.getElementById("message")) {
      document.getElementById("spots-space").removeChild(document.getElementById("message"));
    }

  }

  /**
   * When a user selects a spot this function makes it appear selected
   * and deselects the last spot
   */
  async function selected() {
    sessionStorage.setItem("spot", parseInt(this.id));
    let oldSpot = document.querySelector(".selected-spot");
    if (oldSpot) {
      oldSpot.classList.remove("selected-spot");
    }

    let curSpot = document.getElementById(this.id);
    curSpot.classList.add("selected-spot");
    document.querySelector("#confirmation-space p").textContent = "Current Spot: " + this.id;

    try {
      let response = await fetch("/booked");
      await statusCheck(response);
      response = await response.json();
      availibleTimes(response, this.id);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Interprets and organizes information about previously
   * booked spots
   * @param {Response} res information about time slots
   * @param {String} id id of current spot
   */
  function availibleTimes(res, id) {
    let index = parseInt(id) - 1;
    let slot = res.booked[index].timeSlots;
    if (slot === "na") {
      document.getElementById("time-information").textContent = "Availible during all hours";
    } else {
      let text = "Not availible during these hours: " + slot;
      document.getElementById("time-information").textContent = text;
    }
  }

  /**
   * Checks a given response to see if the status is ok
   * @param {Promise} res a response to check the status of
   * @returns {Promise} the given response if an error is not thrown
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Displays a message to the user prompting them to refresh the page
   * @param {Promise} err a rejected error promise
   */
  function handleError(err) {
    console.error(err);
  }

})();