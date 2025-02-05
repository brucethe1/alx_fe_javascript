// Simulated API URL
const apiUrl = "https://jsonplaceholder.typicode.com/posts";

// Function to fetch quotes from the server (mock API)
function fetchQuotesFromServer() {
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Store the fetched data in localStorage
      localStorage.setItem('quotes', JSON.stringify(data));
      console.log("Fetched server data", data);
    })
    .catch((error) => console.error("Error fetching data", error));
}

// Periodically fetch server data (every 5 seconds)
setInterval(fetchQuotesFromServer, 5000);

// Function to sync local data with the server data
function syncLocalData() {
  const serverQuotes = JSON.parse(localStorage.getItem('quotes'));
  const localQuotes = JSON.parse(localStorage.getItem('localQuotes'));

  // If the data is different, sync it
  if (JSON.stringify(serverQuotes) !== JSON.stringify(localQuotes)) {
    localStorage.setItem('localQuotes', JSON.stringify(serverQuotes));
    console.log("Local data synced with server");
    displaySyncNotification();
  }
}

// Periodically sync local data with server (every 5 seconds)
setInterval(syncLocalData, 5000);

// Function to check for conflicts between server and local data
function checkForConflicts() {
  const serverQuotes = JSON.parse(localStorage.getItem('quotes'));
  const localQuotes = JSON.parse(localStorage.getItem('localQuotes'));

  // If there’s a conflict, notify the user
  if (JSON.stringify(serverQuotes) !== JSON.stringify(localQuotes)) {
    alert("Data conflict detected! Server data has been updated.");
    displayConflictNotification();
  }
}

// Periodically check for conflicts (every 5 seconds)
setInterval(checkForConflicts, 5000);

// Display a notification about data syncing
function displaySyncNotification() {
  const syncNotification = document.createElement('div');
  syncNotification.innerHTML = "Data has been synced with the server!";
  syncNotification.style.position = 'fixed';
  syncNotification.style.bottom = '10px';
  syncNotification.style.right = '10px';
  syncNotification.style.backgroundColor = '#4CAF50';
  syncNotification.style.color = 'white';
  syncNotification.style.padding = '10px';
  syncNotification.style.borderRadius = '5px';
  document.body.appendChild(syncNotification);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    syncNotification.remove();
  }, 3000);
}

// Display a notification about conflict
function displayConflictNotification() {
  const conflictNotification = document.createElement('div');
  conflictNotification.innerHTML = "Data conflict! Please resolve.";
  conflictNotification.style.position = 'fixed';
  conflictNotification.style.bottom = '10px';
  conflictNotification.style.right = '10px';
  conflictNotification.style.backgroundColor = '#FF6565';
  conflictNotification.style.color = 'white';
  conflictNotification.style.padding = '10px';
  conflictNotification.style.borderRadius = '5px';
  document.body.appendChild(conflictNotification);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    conflictNotification.remove();
  }, 3000);
}

// Initialize with some local data (this simulates local changes by the user)
function initializeLocalData() {
  const initialQuotes = [{ id: 1, title: "Local Quote 1" }, { id: 2, title: "Local Quote 2" }];
  localStorage.setItem('localQuotes', JSON.stringify(initialQuotes));
}

// Initialize the local data if not already present
if (!localStorage.getItem('localQuotes')) {
  initializeLocalData();
}
