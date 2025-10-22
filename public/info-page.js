/**
 * Name: Kristen Gustafson & Jennifer Feng
 * Date: 12/11/2023
 * Section: CSE 154 AC, Kasten Welsh & Elias Belzberg
 *
 * This is the js file for detailed info page. The page will append info about the parking place
 * user selected from the main page (name, description, location, rate).
 */

'use strict';
(function() {

  window.addEventListener("load", init);

  /**
   * Sets up event listeners that can detect whether or not a user
   * is interacting with the page
   */
  function init() {
    id("history-btn").addEventListener("click", historyPage);
    id("reservation-btn").addEventListener("click", reservePage);
    document.getElementById("sign-in-btn").textContent = localStorage.getItem("user");

    let selectedLot = localStorage.getItem("lot").toUpperCase();
    recieveInfo(selectedLot);
  }

  /**
   * Recieves pertinent garage info including:
   * full name, rate, location and image
   * @param {String} lot the shorthand name for the lot
   * that you want to access information from ie) E18
   */
  async function recieveInfo(lot) {
    try {
      let response = await fetch("/info/" + lot);
      await statusCheck(response);
      response = await response.json();
      appendInfo(response);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Appends information to the HTML elements based on the provided data.
   *
   * @param {Object} res - The response object containing data to be displayed.
   * @property {Object} res.data - The data object containing information.
   * @property {string} res.data.fullName - The full name to be displayed.
   * @property {string} res.data.description - The description to be displayed.
   * @property {string} res.data.imageInfo - The image information for the background.
   * @property {string} res.data.location - The location information to be displayed.
   * @property {string} res.data.rate - The rate information to be displayed.
   */
  function appendInfo(res) {
    let data = res.data;
    let name = data.fullName;
    let description = data.description;
    let img = data.imageInfo;
    let location = data.location;
    let rate = data.rate;

    qs('#top-inner-content-container h1').textContent = name;
    qs('#top-inner-content-container p').textContent = description;
    qs('#address p').textContent = location;
    qs('#rate h3').textContent = rate;
    qs('#top-overview-container').style.backgroundImage = 'url("images/' + img + '")';
  }

  /**
   * direct to transaction history page
   */
  function historyPage() {
    let url = 'history.html';
    window.location.href = url;
  }

  /** go to reservation page */
  function reservePage() {
    let url = 'parking.html';
    window.location.href = url;
  }

  // helper functions
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

  /**
   * Shortcut function to get an element by a CSS selector.
   * @param {string} selector - The CSS selector used to select the element.
   * @returns {HTMLElement} - Returns the selected element.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();