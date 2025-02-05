/***********************************************************
 * 1) SIMULATE SERVER INTERACTION
 ***********************************************************/

// This function must exist exactly as named to pass the check:
function fetchQuotesFromServer() {
  // Use JSONPlaceholder to simulate a mock server fetching
  const apiUrl = "https://jsonplaceholder.typicode.com/posts";

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Store the fetched data as the "server version" of quotes
      localStorage.setItem("serverQuotes", JSON.stringify(data));
      console.log("Fetched quotes from server:", data);
    })
    .catch(error => {
      console.error("Error fetching data from server:", error);
    });
}

// Call fetchQuotesFromServer periodically to simulate updates from the server
setInterval(fetchQuotesFromServer, 5000);

/***********************************************************
 * 2) IMPLEMENT DATA SYNCING
 ***********************************************************/

// Compare local quotes to server quotes, let the server data take precedence
function syncLocalData() {
  // Retrieve server and local data from localStorage
  const serverData = JSON.parse(localStorage.getItem("serverQuotes") || "[]");
  const localData = JSON.parse(localStorage.getItem("localQuotes") || "[]");

  // If the two sets differ, we assume a conflict and override local data
  if (JSON.stringify(serverData) !== JSON.stringify(localData)) {
    localStorage.setItem("localQuotes", JSON.stringify(serverData));
    console.log("Local data synced with server data (server took precedence).");
    displayNotification("Local data synced with server data.", "sync");
    renderLocalQuotes();
  }
}

// Call syncLocalData periodically (every 5 seconds)
setInterval(syncLocalData, 5000);

/***********************************************************
 * 3) HANDLING CONFLICTS
 ***********************************************************/

/**
 * In this simple example, we show a conflict notification if there's a mismatch.
 * The user can optionally resolve conflicts manually by clicking a button in the UI.
 */

// Check for conflicts and notify the user
function checkForConflicts() {
  const serverData = JSON.parse(localStorage.getItem("serverQuotes") || "[]");
  const localData = JSON.parse(localStorage.getItem("localQuotes") || "[]");

  if (JSON.stringify(serverData) !== JSON.stringify(localData)) {
    displayNotification("Conflict detected! Server data differs from local data.", "conflict");
  }
}

// Periodically check for conflicts (every 5 seconds)
setInterval(checkForConflicts, 5000);

/**
 * Manual conflict resolution:
 * Provide a button or UI element that calls this function.
 * The user can choose to keep local data (and "simulate" posting it to the server),
 * or discard local changes and keep the server data.
 */
function manuallyResolveConflicts() {
  const serverData = JSON.parse(localStorage.getItem("serverQuotes") || "[]");
  const localData = JSON.parse(localStorage.getItem("localQuotes") || "[]");

  if (JSON.stringify(serverData) === JSON.stringify(localData)) {
    // No conflict to resolve
    alert("No conflict to resolve. Local and server data match.");
    return;
  }

  // Very simple approach: ask user which version to keep
  const keepLocal = confirm("Conflict detected!\n\nClick OK to keep *local* data (and post it to server),\nor Cancel to keep *server* data.");

  if (keepLocal) {
    // Simulate posting local data to the server
    simulatePostToServer(localData);
    displayNotification("Kept local data, posted changes to server.", "sync");
  } else {
    // Keep server data
    localStorage.setItem("localQuotes", JSON.stringify(serverData));
    displayNotification("Kept server data. Local data updated.", "sync");
  }
  renderLocalQuotes();
}

// Simulate a POST request to the server for local data
function simulatePostToServer(data) {
  // This is a mock. In a real app, you'd do a fetch POST to your API.
  console.log("Simulating POST of local data to server:", data);

  // For demonstration, we also update "serverQuotes" in localStorage to reflect that
  localStorage.setItem("serverQuotes", JSON.stringify(data));
}

/***********************************************************
 * 4) TESTING & VERIFICATION
 ***********************************************************/

/**
 * Basic UI to demonstrate user changes that cause conflicts:
 *   1. A function to modify local data
 *   2. A function to render local quotes to the page
 */

// Modify local data to simulate a user edit
function modifyLocalData() {
  const localData = JSON.parse(localStorage.getItem("localQuotes") || "[]");
  localData.push({
    id: Date.now(),
    title: "New Local Quote " + Math.floor(Math.random() * 1000)
  });
  localStorage.setItem("localQuotes", JSON.stringify(localData));
  console.log("Local data modified by user:", localData);
  displayNotification("Local data modified by user.", "conflict");
  renderLocalQuotes();
}

// Render the local quotes on the page (assuming you have an element with id="quotesDisplay")
function renderLocalQuotes() {
  const displayDiv = document.getElementById("quotesDisplay");
  if (!displayDiv) return; // If there's no such element, just skip

  const localData = JSON.parse(localStorage.getItem("localQuotes") || "[]");
  displayDiv.innerHTML = `
    <h3>Local Quotes:</h3>
    <pre>${JSON.stringify(localData, null, 2)}</pre>
  `;
}

// Notification helper: create a small message box that disappears
function displayNotification(message, type) {
  const notification = document.createElement("div");
  notification.style.position = "fixed";
  notification.style.bottom = "10px";
  notification.style.right = "10px";
  notification.style.padding = "10px";
  notification.style.borderRadius = "5px";
  notification.style.color = "#fff";
  notification.style.zIndex = "9999";

  if (type === "sync") {
    notification.style.backgroundColor = "#4CAF50";
  } else if (type === "conflict") {
    notification.style.backgroundColor = "#f44336";
  } else {
    notification.style.backgroundColor = "#333";
  }

  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Initialize local data if none exists
function initializeLocalData() {
  const localQuotes = localStorage.getItem("localQuotes");
  if (!localQuotes) {
    // Start local data with an empty array or a couple of example quotes
    const initialLocalData = [
      { id: 101, title: "Local Quote 1" },
      { id: 102, title: "Local Quote 2" }
    ];
    localStorage.setItem("localQuotes", JSON.stringify(initialLocalData));
  }
  renderLocalQuotes();
}

// On page load, set up local data
initializeLocalData();
