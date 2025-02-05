"use strict";

/***********************************************************
 * Global Variables & Initial Setup
 ***********************************************************/
// Our local array of quotes (each quote has: text, category)
let quotes = [];

// We'll store the last displayed quote in sessionStorage (optional)
let lastDisplayedQuote = sessionStorage.getItem("lastQuote") || null;

// Intervals (in milliseconds) for server sync and conflict checks
const FETCH_INTERVAL = 5000; // 5 seconds
const SYNC_INTERVAL = 5000;  // 5 seconds
const CONFLICT_CHECK_INTERVAL = 5000; // 5 seconds

// A separate key for storing "serverQuotes" in localStorage
const SERVER_QUOTES_KEY = "serverQuotes";

// We'll call `init()` once the page loads
window.addEventListener("load", init);

/***********************************************************
 * 0) Building a Dynamic Content Generator (DOM Manipulation)
 ***********************************************************/

/**
 * Display a random quote from our `quotes` array
 * and store the displayed quote in sessionStorage.
 */
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const chosenQuote = quotes[randomIndex];
  document.getElementById("quoteDisplay").textContent =
    `"${chosenQuote.text}" — [${chosenQuote.category}]`;

  // Store in sessionStorage for demonstration
  sessionStorage.setItem("lastQuote", chosenQuote.text);
  lastDisplayedQuote = chosenQuote.text;
}

/**
 * Add a new quote based on user input, update DOM and localStorage.
 */
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and a category.");
    return;
  }

  const newQuote = { text: newText, category: newCategory };
  quotes.push(newQuote);
  saveQuotes(); // persist to localStorage

  textInput.value = "";
  categoryInput.value = "";

  // Update category dropdown if needed
  populateCategories();

  alert("New quote added!");
}

/***********************************************************
 * 1) Implementing Web Storage and JSON Handling
 ***********************************************************/

/**
 * Save the current `quotes` array to localStorage as JSON.
 */
function saveQuotes() {
  localStorage.setItem("localQuotes", JSON.stringify(quotes));
}

/**
 * Load quotes from localStorage into our global `quotes` array.
 * If no data is found, initialize with a few example quotes.
 */
function loadQuotes() {
  const storedQuotes = localStorage.getItem("localQuotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Initial sample data if none in storage
    quotes = [
      { text: "The journey of a thousand miles begins with one step.", category: "Inspirational" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    ];
    saveQuotes();
  }
}

/**
 * Export quotes to a JSON file using a Blob.
 */
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary link to download the file
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import quotes from a selected JSON file. Merges them into the current array.
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        // Merge into our local quotes array
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON structure. Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error reading JSON file: " + err);
    }
  };
  fileReader.readAsText(file);
}

/***********************************************************
 * 2) Creating a Dynamic Content Filtering System
 ***********************************************************/

/**
 * Populate the category dropdown with unique categories
 * extracted from our `quotes` array.
 */
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");

  // Remember the currently selected category
  const currentSelection = categorySelect.value;

  // Clear existing options (except for "all")
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;

  // Collect unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Create an <option> for each category
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Restore previous selection if possible
  if (categories.includes(currentSelection)) {
    categorySelect.value = currentSelection;
  } else {
    categorySelect.value = "all";
  }

  // Save the user’s filter choice in localStorage
  localStorage.setItem("lastSelectedCategory", categorySelect.value);

  // Immediately filter the displayed quote (if any)
  filterQuotes();
}

/**
 * Filter quotes based on the selected category and display one of them randomly.
 */
function filterQuotes() {
  const categorySelect = document.getElementById("categoryFilter");
  const selectedCategory = categorySelect.value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  let filtered = quotes;
  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent =
      `No quotes found in category: ${selectedCategory}`;
    return;
  }

  // Show a random quote from the filtered set
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const chosenQuote = filtered[randomIndex];
  document.getElementById("quoteDisplay").textContent =
    `"${chosenQuote.text}" — [${chosenQuote.category}]`;

  // Also update sessionStorage for the last displayed quote
  sessionStorage.setItem("lastQuote", chosenQuote.text);
  lastDisplayedQuote = chosenQuote.text;
}

/***********************************************************
 * 3) Syncing Data with a Server & Conflict Resolution
 ***********************************************************/

/**
 * This function fetches quotes from JSONPlaceholder (mock server).
 * The requirement specifically mentions having a function named:
 *   fetchQuotesFromServer
 */
function fetchQuotesFromServer() {
  const apiUrl = "https://jsonplaceholder.typicode.com/posts"; // Mock endpoint

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      // We'll store the server's quotes in localStorage under a different key
      localStorage.setItem(SERVER_QUOTES_KEY, JSON.stringify(data));
      console.log("Fetched quotes from server:", data);
    })
    .catch(err => console.error("Error fetching from server:", err));
}

// Periodically fetch new data from the "server"
setInterval(fetchQuotesFromServer, FETCH_INTERVAL);

/**
 * Sync local data with server data. In this simple conflict strategy,
 * the server's data always overwrites local data if there's a difference.
 */
function syncLocalData() {
  const serverData = JSON.parse(localStorage.getItem(SERVER_QUOTES_KEY) || "[]");
  const localData = quotes; // Our in-memory array

  // Compare them by stringifying
  if (JSON.stringify(serverData) !== JSON.stringify(localData)) {
    // Overwrite local quotes with server data
    quotes = serverData.map(item => ({
      text: item.title || `Post #${item.id}`,  // Map to our quote structure
      category: "ServerData"                   // Simplify category
    }));

    saveQuotes();
    console.log("Local data synced with server data (server took precedence).");
    alert("Local data has been updated with server data!");
    populateCategories();
  }
}

// Periodically sync local data with server data
setInterval(syncLocalData, SYNC_INTERVAL);

/**
 * Check for conflicts (differences) between local and server data.
 * For demonstration, just log a warning or show an alert/notification.
 */
function checkForConflicts() {
  const serverData = JSON.parse(localStorage.getItem(SERVER_QUOTES_KEY) || "[]");
  const localData = JSON.parse(localStorage.getItem("localQuotes") || "[]");

  if (JSON.stringify(serverData) !== JSON.stringify(localData)) {
    console.warn("Conflict detected: server vs local data differ!");
    // A real UI might show a notification or highlight conflict
  }
}

// Periodically check for conflicts
setInterval(checkForConflicts, CONFLICT_CHECK_INTERVAL);

/**
 * Provide a manual resolution option: user decides to keep local data or server data.
 * If user keeps local data, we simulate "posting" it to the server.
 */
function manuallyResolveConflicts() {
  const serverData = JSON.parse(localStorage.getItem(SERVER_QUOTES_KEY) || "[]");
  const localData = JSON.parse(localStorage.getItem("localQuotes") || "[]");

  if (JSON.stringify(serverData) === JSON.stringify(localData)) {
    alert("No conflict to resolve. Local and server data match.");
    return;
  }

  const keepLocal = confirm(
    "Conflict detected!\n\n" +
    "Click OK to keep LOCAL data (and overwrite server),\n" +
    "or Cancel to keep SERVER data (overwrite local)."
  );

  if (keepLocal) {
    // Simulate posting local data to the server
    simulatePostToServer(localData);
    alert("Local data kept and posted to the server (simulated).");
  } else {
    // Overwrite local data with server data
    quotes.length = 0;
    serverData.forEach(item => {
      quotes.push({
        text: item.title || `Post #${item.id}`,
        category: "ServerData"
      });
    });
    saveQuotes();
    alert("Server data kept. Local data overwritten.");
  }
  populateCategories();
}

/**
 * Simulate a POST request to the server to overwrite the "serverQuotes" in localStorage.
 */
function simulatePostToServer(localData) {
  // In reality, you'd do: fetch(apiUrl, { method: 'POST', body: JSON.stringify(...) })
  // For now, we just store it as "serverQuotes" to simulate an update
  const serverLikeData = localData.map((quote, index) => ({
    id: index + 1,
    title: quote.text,
    body: "",
    category: quote.category
  }));
  localStorage.setItem(SERVER_QUOTES_KEY, JSON.stringify(serverLikeData));
  console.log("Simulated POST to server. Updated serverQuotes in localStorage:", serverLikeData);
}

/***********************************************************
 * 4) Initialization & Event Listeners
 ***********************************************************/

function init() {
  // 1. Load existing local quotes from localStorage (or use defaults)
  loadQuotes();

  // 2. Populate categories dropdown
  populateCategories();

  // 3. Restore last selected filter if available
  const lastSelectedCategory = localStorage.getItem("lastSelectedCategory");
  if (lastSelectedCategory) {
    document.getElementById("categoryFilter").value = lastSelectedCategory;
    filterQuotes();
  }

  // 4. If a lastDisplayedQuote is stored in sessionStorage, display it
  if (lastDisplayedQuote) {
    document.getElementById("quoteDisplay").textContent = lastDisplayedQuote;
  }

  // 5. Set up event listeners
  document.getElementById("newQuoteBtn").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  document.getElementById("manualResolveBtn").addEventListener("click", manuallyResolveConflicts);

  // Initial display
  showRandomQuote();
}
