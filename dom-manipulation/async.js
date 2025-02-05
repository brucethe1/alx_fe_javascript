// Global flag to pause automatic sync when doing manual resolution.
let manualOverrideActive = false;

// API URL (using JSONPlaceholder to simulate a server)
const apiUrl = "https://jsonplaceholder.typicode.com/posts";

// ---------------------------------------------------------------------
// Step 1: Simulate Server Interaction
// ---------------------------------------------------------------------

// Fetch quotes from the server (simulation)
function fetchQuotesFromServer() {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Save fetched data as the “server quotes”
      localStorage.setItem('serverQuotes', JSON.stringify(data));
      console.log("Fetched server data:", data);
      updateQuotesDisplay();
    })
    .catch(error => console.error("Error fetching server data:", error));
}

// Periodically fetch server data every 5 seconds.
setInterval(fetchQuotesFromServer, 5000);

// ---------------------------------------------------------------------
// Step 2: Implement Data Syncing
// ---------------------------------------------------------------------

// Auto-sync local data with server data (server wins by default)
function syncLocalData() {
  // If a manual resolution is in progress, skip auto-sync.
  if (manualOverrideActive) return;

  const serverData = JSON.parse(localStorage.getItem('serverQuotes') || "[]");
  const localData = JSON.parse(localStorage.getItem('localQuotes') || "[]");

  // If there's a difference (conflict), override local data with server data.
  if (JSON.stringify(serverData) !== JSON.stringify(localData)) {
    localStorage.setItem('localQuotes', JSON.stringify(serverData));
    console.log("Auto-synced: Server data took precedence over local changes.");
    displayNotification("Data auto-synced with server (server data took precedence).", "sync");
    updateQuotesDisplay();
  }
}
setInterval(syncLocalData, 5000);

// ---------------------------------------------------------------------
// Utility: Display Notifications
// ---------------------------------------------------------------------
function displayNotification(message, type) {
  const notification = document.createElement('div');
  notification.classList.add("notification");
  if (type === "sync") {
    notification.classList.add("sync-notification");
  } else if (type === "conflict") {
    notification.classList.add("conflict-notification");
  }
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ---------------------------------------------------------------------
// Step 3: Handling Conflicts - Manual Resolution Modal
// ---------------------------------------------------------------------

function showManualResolveModal() {
  // Get current server and local data
  const serverData = JSON.parse(localStorage.getItem('serverQuotes') || "[]");
  const localData = JSON.parse(localStorage.getItem('localQuotes') || "[]");

  // Only show the modal if a conflict exists.
  if (JSON.stringify(serverData) === JSON.stringify(localData)) {
    displayNotification("No conflict detected.", "sync");
    return;
  }

  // Pause auto-sync while the user resolves the conflict.
  manualOverrideActive = true;
  
  // Create the modal
  const modal = document.createElement('div');
  modal.classList.add("modal");
  
  const modalContent = document.createElement('div');
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = `
    <h2>Conflict Detected</h2>
    <p><strong>Local Data:</strong></p>
    <pre>${JSON.stringify(localData, null, 2)}</pre>
    <p><strong>Server Data:</strong></p>
    <pre>${JSON.stringify(serverData, null, 2)}</pre>
    <p>Select which data to keep:</p>
    <button id="keepServerBtn">Keep Server Data</button>
    <button id="keepLocalBtn">Keep Local Changes</button>
  `;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Option 1: Keep Server Data (default resolution)
  document.getElementById('keepServerBtn').addEventListener('click', () => {
    localStorage.setItem('localQuotes', JSON.stringify(serverData));
    displayNotification("Server data kept. Local data updated.", "sync");
    updateQuotesDisplay();
    closeModal(modal);
  });

  // Option 2: Keep Local Changes (manual override)
  document.getElementById('keepLocalBtn').addEventListener('click', () => {
    // Simulate posting the local changes to the server.
    postLocalDataToServer(localData);
    displayNotification("Local changes kept and posted to server.", "sync");
    closeModal(modal);
  });
}

// Close the modal and resume auto-sync.
function closeModal(modal) {
  modal.remove();
  manualOverrideActive = false;
}

// Simulate posting local data to the server (using a POST request)
function postLocalDataToServer(data) {
  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => console.log("Posted local data to server:", result))
  .catch(error => console.error("Error posting data:", error));
}

// ---------------------------------------------------------------------
// Extra: Simulate User Modifying Local Data
// ---------------------------------------------------------------------

// This function simulates a user editing the local data, which will
// then create a conflict with the server data.
function modifyLocalData() {
  const localData = JSON.parse(localStorage.getItem('localQuotes') || "[]");
  // Add a new quote with a random title.
  const newQuote = {
    id: Date.now(),
    title: "User Modified Quote " + Math.floor(Math.random() * 100)
  };
  localData.push(newQuote);
  localStorage.setItem('localQuotes', JSON.stringify(localData));
  displayNotification("Local data modified by user.", "conflict");
  updateQuotesDisplay();
}

// ---------------------------------------------------------------------
// UI: Update the Displayed Quotes
// ---------------------------------------------------------------------
function updateQuotesDisplay() {
  const displayDiv = document.getElementById('quotesDisplay');
  const localData = JSON.parse(localStorage.getItem('localQuotes') || "[]");
  displayDiv.innerHTML = "<h3>Local Quotes:</h3><pre>" + JSON.stringify(localData, null, 2) + "</pre>";
}

// ---------------------------------------------------------------------
// Step 4: Testing & Initialization
// ---------------------------------------------------------------------

// Initialize local data if it doesn't exist. Start with server data if available,
// or use sample data.
function initializeLocalData() {
  if (!localStorage.getItem('localQuotes')) {
    const serverData = JSON.parse(localStorage.getItem('serverQuotes') || "[]");
    if (serverData.length > 0) {
      localStorage.setItem('localQuotes', JSON.stringify(serverData));
    } else {
      const initialQuotes = [
        { id: 1, title: "Local Quote 1" },
        { id: 2, title: "Local Quote 2" }
      ];
      localStorage.setItem('localQuotes', JSON.stringify(initialQuotes));
    }
    updateQuotesDisplay();
  }
}

initializeLocalData();

// ---------------------------------------------------------------------
// Event Listeners for UI Buttons
// ---------------------------------------------------------------------
document.getElementById('modifyLocalBtn').addEventListener('click', modifyLocalData);
document.getElementById('manualResolveBtn').addEventListener('click', showManualResolveModal);
