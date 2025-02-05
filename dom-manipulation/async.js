"use strict";

/***********************************************************
 * STEP 1: SIMULATE SERVER INTERACTION
 ***********************************************************/
function fetchQuotesFromServer() {
  // Use JSONPlaceholder to simulate a server endpoint
  const apiUrl = "https://jsonplaceholder.typicode.com/posts";

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Store fetched data as the "server version" of quotes
      localStorage.setItem("serverQuotes", JSON.stringify(data));
      console.log("Fetched quotes from server:", data);
    })
    .catch(function (error) {
      console.error("Error fetching data from server:", error);
    });
}

// Periodically fetch new quotes from the "server"
setInterval(fetchQuotesFromServer, 5000);

/***********************************************************
 * STEP 2: IMPLEMENT DATA SYNCING
 ***********************************************************/
function syncLocalData() {
  // Read both server and local quotes from localStorage
  const serverQuotes = JSON.parse(localStorage.getItem("serverQuotes") || "[]");
  const localQuotes = JSON.parse(localStorage.getItem("localQuotes") || "[]");

  // If there's a difference, let the server's data overwrite local
  if (JSON.stringify(serverQuotes) !== JSON.stringify(localQuotes)) {
    localStorage.setItem("localQuotes", JSON.stringify(serverQuotes));
    console.log("Local data synced with server data (server takes precedence).");
  }
}

// Periodically sync local data with server data
setInterval(syncLocalData, 5000);

/***********************************************************
 * STEP 3: HANDLING CONFLICTS
 ***********************************************************/
function checkForConflicts() {
  const serverQuotes = JSON.parse(localStorage.getItem("serverQuotes") || "[]");
  const localQuotes = JSON.parse(localStorage.getItem("localQuotes") || "[]");

  if (JSON.stringify(serverQuotes) !== JSON.stringify(localQuotes)) {
    console.warn("Conflict detected between server data and local data!");
  }
}

// Periodically check for conflicts
setInterval(checkForConflicts, 5000);

/**
 * A simple function to manually resolve conflicts if desired.
 * This could be triggered by a button in your UI.
 */
function manuallyResolveConflicts() {
  const serverQuotes = JSON.parse(localStorage.getItem("serverQuotes") || "[]");
  const localQuotes = JSON.parse(localStorage.getItem("localQuotes") || "[]");

  // If there's no difference, nothing to resolve
  if (JSON.stringify(serverQuotes) === JSON.stringify(localQuotes)) {
    alert("No conflict to resolve: local and server data match.");
    return;
  }

  // Ask the user which data they want to keep
  const keepLocal = confirm(
    "Conflict detected!\n\n" +
    "Click OK to keep LOCAL data (and overwrite server),\n" +
    "or Cancel to keep SERVER data (overwrite local)."
  );

  if (keepLocal) {
    // Simulate "posting" local data to server by copying it to serverQuotes
    console.log("Keeping LOCAL data. Overwriting server data (in localStorage).");
    localStorage.setItem("serverQuotes", JSON.stringify(localQuotes));
  } else {
    // Overwrite local with server data
    console.log("Keeping SERVER data. Overwriting local data.");
    localStorage.setItem("localQuotes", JSON.stringify(serverQuotes));
  }
}

/***********************************************************
 * STEP 4: TESTING & VERIFICATION
 ***********************************************************/
/**
 * Function to simulate user modifying local data, causing a potential conflict
 * with the server data.
 */
function modifyLocalData() {
  const localQuotes = JSON.parse(localStorage.getItem("localQuotes") || "[]");

  localQuotes.push({
    id: Date.now(),
    title: "User-Modified Quote " + Math.floor(Math.random() * 1000),
  });

  localStorage.setItem("localQuotes", JSON.stringify(localQuotes));
  console.log("Local data modified by user:", localQuotes);
}

/**
 * Initialize local data if none exists (to simulate a fresh user environment).
 */
function initializeLocalData() {
  if (!localStorage.getItem("localQuotes")) {
    const initialQuotes = [
      { id: 1, title: "Local Quote 1" },
      { id: 2, title: "Local Quote 2" },
    ];
    localStorage.setItem("localQuotes", JSON.stringify(initialQuotes));
    console.log("Initialized localQuotes with sample data:", initialQuotes);
  }
}

// Run initialization once on load
initializeLocalData();
