/**
 * Name: Kristen Gustafson & Jennifer Feng
 * Date: 12/11/2023
 * Section: CSE 154 AC, Kasten Welsh & Elias Belzberg
 *
 * This is the js file for our whole main page which includes the
 * log in and sign up functionality, as well as the initial view of
 * parking garages. This file also contains behavior for searching
 * and filtering through garages.
 */
'use strict';
(function() {

  window.addEventListener("load", init);

  /**
   * Sets up event listeners that can detect whether or not a user
   * is interacting with the page
   */
  function init() {
    localStorage.removeItem("lot");
    localStorage.removeItem("user");
    id("history-btn").addEventListener("click", historyPage);
    id("sign-in-btn").addEventListener("click", signInPage);
    id("sign-in-form-btn").addEventListener("click", signInMakeRequest);
    id("sign-up-form-btn").addEventListener("click", signUpMakeRequest);

    id("init-filter-btn").addEventListener("click", toggleFilter);
    id("cluster-view-icon").addEventListener("click", clusterView);
    id("list-view-icon").addEventListener("click", listView);

    id("filter-submit-btn").addEventListener("click", startFilter);

    id("map-confirm-btn").addEventListener("click", beginMap);
    id("map-submit-btn").addEventListener("click", reserveMap);

    let cards = document.querySelectorAll(".card");
    for (let i = 0; i < cards.length; i++) {
      cards[i].addEventListener("click", updateInfo);
    }

    let list = document.querySelectorAll(".list-view-card");
    for (let i = 0; i < list.length; i++) {
      list[i].addEventListener("click", updateInfo);
    }

    document.getElementById("search-btn").addEventListener("click", searchBar);
    document.getElementById("register-account-btn").addEventListener("click", signupPage);
  }

  /**
   * Initiates the filtering process based on user preferences,
   * specifically for handicapped spots.
   */
  async function startFilter() {
    if (document.getElementById("handicapped-form").checked) {
      try {
        let response = await fetch("/handicapped");
        await statusCheck(response);
        response = await response.json();
        applyFilter(response, this.selected);
      } catch (err) {
        handleError(err);
      }
    } else {
      let cards = document.querySelectorAll(".card");
      let list = document.querySelectorAll(".list-view-card");

      for (let i = 0; i < cards.length; i++) {
        list[i].classList.remove("hidden");
        cards[i].classList.remove("hidden");
      }
    }
  }

  /**
   * Reveals the submit button for reserving a map.
   */
  function beginMap() {
    id("map-submit-btn").classList.remove("hidden");
  }

  /**
   * Initiates the process of reserving a map and updates the DOM accordingly.
   */
  async function reserveMap() {
    let form = new FormData();
    form.append("username", localStorage.getItem("user"));

    try {
      let response = await fetch("/maps", {method: "POST", body: form});
      await statusCheck(response);
      response = await response.text();
      mapDom(response);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Updates the DOM with the result of a map reservation attempt.
   * @param {string} res - The response message from the server.
   */
  function mapDom(res) {
    let msg = document.createElement("p");
    msg.textContent = res;
    document.getElementById("ad").appendChild(msg);
  }

  /**
   * Filters parking spots based on handicapped availability and updates the DOM accordingly.
   * @param {Object} res - The response object containing handicapped parking information.
   */
  function applyFilter(res) {
    let locs = res.handicapped;

    let cards = document.querySelectorAll(".card");
    let list = document.querySelectorAll(".list-view-card");

    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.add("hidden");
      list[i].classList.add("hidden");
    }
    for (let i = 0; i < cards.length; i++) {
      let curLot = cards[i].id.substring(0, 3).toUpperCase(); // second line
      for (let j = 0; j < locs.length; j++) {
        if (curLot === locs[j].Name) {
          cards[i].classList.remove("hidden");
          list[i].classList.remove("hidden");
        }
      }
    }
  }

  /**
   * Allows the user to search for a term for relevant parking garages
   */
  async function searchBar() {
    let word = document.getElementById("search-box").value;
    try {
      let response = await fetch("/search/" + word);
      await statusCheck(response);
      response = await response.json();
      searchDOM(response);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * After a search is made this method relays which lots best
   * match their search
   * @param {Response} res - Information regarding search
   */
  function searchDOM(res) {
    let locations = res.locations;

    let cards = document.querySelectorAll(".card");
    let list = document.querySelectorAll(".list-view-card");

    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.add("hidden");
      list[i].classList.add("hidden");
    }
    for (let i = 0; i < cards.length; i++) {
      console.log("HERE");
      let curLot = cards[i].id.substring(0, 3).toUpperCase(); // change
      console.log(curLot);
      for (let j = 0; j < locations.length; j++) {
        console.log(locations[j]);
        if (curLot === locations[j]) {
          cards[i].classList.remove("hidden");
          list[i].classList.remove("hidden");
        }
      }
    }
  }

  /**
   * Allows the user to view a sign up page to create an account
   */
  function signupPage() {
    document.querySelector("#left-container-wrapper div h2").textContent = "Sign up!";
    document.getElementById("register-container").innerHTML = "";

    id("sign-in-form").classList.add("hidden");
    id("sign-up-form").classList.remove("hidden");
  }

  /**
   * Allows a user to make a sign up request with a username, password and
   * email
   */
  async function signUpMakeRequest() {
    let form = new FormData();
    let username = id("new-username").value;
    let password = id("new-password").value;
    let email = id("new-email").value;

    form.append("username", username);
    form.append("password", password);
    form.append("email", email);

    try {
      let response = await fetch("/signup", {method: "POST", body: form});
      await statusCheck(response);
      response = await response.text();
      loginAttempt(response);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Relays information to user about log in status to web service
   * @param {Response} res - Information regarding log in status
   */
  function loginAttempt(res) {
    let container = document.querySelector("#left-container-wrapper div");
    if (res.includes("already")) {
      let errorMsg = document.createElement("p");
      errorMsg.id = "error-msg";
      errorMsg.textContent = res;
      container.appendChild(errorMsg);
    } else {
      let error = document.getElementById("error-msg");
      if (error) {
        container.removeChild(error);
      }

      let success = document.createElement("p");
      success.textContent = res;
      success.classList.add("success");
      container.appendChild(success);
    }
  }

  /**
   * Sets ther user's chosen lot
   */
  function updateInfo() {
    let id = this.id;
    let lot = id.substring(0, id.indexOf("-")).toLowerCase();
    localStorage.setItem("lot", lot);
  }

  /**
   * direct to transaction history page
   */
  function historyPage() {
    let url = 'history.html';
    window.location.href = url;
  }

  /**
   * toggle filter feature
   */
  function toggleFilter() {
    id('filter').classList.toggle('hidden');
  }

  /**
   * show cluster view for the garages
   */
  function clusterView() {
    id('cluster-view-total').classList.remove('hidden');
    id('list-view').classList.add('hidden');
  }

  /**
   * show list view for the garages
   */
  function listView() {
    id('cluster-view-total').classList.add('hidden');
    id('list-view').classList.remove('hidden');
  }

  /**
   * direct to sign in page
   */
  function signInPage() {
    id('home').classList.add('hidden');
    id('sign-in-view').classList.remove('hidden');
    let mapMsg = document.querySelector("#ad p");
    if (mapMsg) {
      id("ad").removeChild(mapMsg);
    }
    if (localStorage.getItem("saved")) {
      id('home').classList.remove('hidden');
      id('sign-in-view').classList.add('hidden');
      localStorage.setItem("user", localStorage.getItem("saved"));
      document.getElementById("sign-in-btn").textContent = localStorage.getItem("saved");
    }
    clearSignInForm();
  }

  /**
   * sign in request
   * (successful => back to home page;
   * not successful => display message to try again)
   */
  async function signInMakeRequest() {
    let username = id('username').value;
    let password = id('password').value;

    try {
      let response = await fetch("/signin/" + username + "/" + password);
      await statusCheck(response);
      response = await response.text();
      signIn(response, username);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Relays information to user about status of signing in to service
   * @param {Response} res information regarding status of signing in
   * @param {String} username username of user trying to sign in
   */
  function signIn(res, username) {
    if (res.includes("Welcome")) {
      id('home').classList.remove('hidden');
      id('sign-in-view').classList.add('hidden');
      localStorage.setItem("user", username);
      document.getElementById("sign-in-btn").textContent = username;
      if (document.getElementById("remember-me").checked) {
        localStorage.setItem("saved", username);
      }
    } else {
      let rejection = document.createElement("p");
      rejection.textContent = res;
      let container = document.querySelector("#left-container-wrapper div");
      container.appendChild(rejection);
    }
  }

  /**
   * clear sign in form everytime click on the sign in button
   */
  function clearSignInForm() {
    id('username').textContent = '';
    id('password').textContent = '';
    id('remember-me').value = '';
  }

  /**
   * Handles api errors by displaying a message on the webpage.
   * @param {Error} err - The error object to be handled.
   */
  function handleError(err) {
    let message = document.createElement('p');
    message.textContent = err.message;
  }

  /**
   * Checks the status of the response and throws an error if the response is not okay.
   * @param {Response} res - The response object to be checked.
   * @returns {Promise<Response>} - Returns a Promise with the response.
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Shortcut function to get an element by its ID.
   * @param {string} id - The ID of the element to be retrieved.
   * @returns {HTMLElement} - Returns the element with the specified ID.
   */
  function id(id) {
    return document.getElementById(id);
  }
})();