/**
 * Name: Kristen Gustafson & Jennifer Feng
 * Date: 12/11/2023
 * Section: CSE 154 AC, Kasten Welsh & Elias Belzberg
 *
 * This is the js file for our website's transaction history page.
 * User will need to login to view their history.
 * History will show up as cards, appending to the page with each transaction info accordingly.
 */

'use strict';
(function() {

  window.addEventListener("load", init);

  /**
   * Sets up event listeners that can detect whether or not a user
   * is interacting with the page and logged in or not
   */
  function init() {
    if (localStorage.getItem("user")) {
      getTransactions(localStorage.getItem("user"));
    } else {
      let msg = document.createElement("p");
      msg.textContent = "Please go back to the home page to sign in. Then you could view history!";
      document.getElementById("history-card-section-container").appendChild(msg);
    }
  }

  /**
   * Fetches the transaction history for a specific user.
   * @param {string} user - The username for which to retrieve the transaction history.
   */
  async function getTransactions(user) {
    try {
      let response = await fetch("/transactions/" + user);
      await statusCheck(response);
      response = await response.json();
      display(response);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Displays the transaction history on the page.
   * @param {Object} res - The response object containing the transaction data.
   */
  function display(res) {
    if (res.data.length === 0) {
      let msg = document.createElement("p");
      msg.textContent = "No history yet!";
      document.getElementById("history-card-section-container").appendChild(msg);
    } else {
      for (let i = 0; i < res.data.length; i++) {
        let cur = res.data[i];
        let section = document.createElement("section");
        section.classList.add("card");
        let garageName = document.createElement("h2");
        garageName.textContent = cur.lot;
        let number = document.createElement("p");
        number.textContent = cur.confirmation;
        let time = document.createElement("p");
        time.textContent = cur.time + "pm";
        let div1 = document.createElement("div");
        let div2 = document.createElement("div");

        div1.appendChild(garageName);
        div1.appendChild(number);
        div2.appendChild(time);
        section.appendChild(div1);
        section.appendChild(div2);

        let container = document.getElementById("history-card-section-container");
        container.appendChild(section);
      }
    }
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
})();