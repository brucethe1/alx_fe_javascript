// Load quotes from localStorage or start with default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    "Believe in yourself.",
    "Stay positive and happy.",
    "Work hard and don’t give up hope."
];

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to generate and display a new quote
function generateQuote() {
    if (quotes.length === 0) {
        document.getElementById("quoteDisplay").innerText = "No quotes available.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];

    // Display quote
    document.getElementById("quoteDisplay").innerText = selectedQuote;

    // Store the last viewed quote in session storage
    sessionStorage.setItem("lastQuote", selectedQuote);
}

// Function to add a new quote
function addQuote() {
    const newQuote = document.getElementById("newQuoteInput").value.trim();
    if (newQuote === "") {
        alert("Please enter a valid quote!");
        return;
    }

    quotes.push(newQuote);
    saveQuotes(); // Save to local storage
    document.getElementById("newQuoteInput").value = ""; // Clear input
    alert("Quote added successfully!");
}

// Function to export quotes as a JSON file
function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");

            quotes.push(...importedQuotes);
            saveQuotes();
            alert("Quotes imported successfully!");
        } catch (error) {
            alert("Invalid JSON file. Please upload a valid quotes file.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Load the last viewed quote from session storage when the page loads
window.onload = function() {
    const lastQuote = sessionStorage.getItem("lastQuote");
    if (lastQuote) {
        document.getElementById("quoteDisplay").innerText = lastQuote;
    }
};
