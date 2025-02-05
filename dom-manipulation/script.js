// Load quotes from localStorage or start with default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "Believe in yourself.", category: "Motivation" },
    { text: "Stay positive and happy.", category: "Happiness" },
    { text: "Work hard and don’t give up hope.", category: "Motivation" }
];

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to generate and display a new quote based on filter
function generateQuote() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    const filteredQuotes = selectedCategory === "all" 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        document.getElementById("quoteDisplay").innerText = "No quotes in this category.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];

    // Display quote
    document.getElementById("quoteDisplay").innerText = selectedQuote.text;

    // Store the last viewed quote in session storage
    sessionStorage.setItem("lastQuote", selectedQuote.text);
}

// Function to add a new quote with a category
function addQuote() {
    const newQuote = document.getElementById("newQuoteInput").value.trim();
    const category = document.getElementById("categoryInput").value.trim();

    if (newQuote === "" || category === "") {
        alert("Please enter both a quote and a category!");
        return;
    }

    quotes.push({ text: newQuote, category: category });
    saveQuotes(); // Save to local storage
    populateCategories(); // Update categories in dropdown
    document.getElementById("newQuoteInput").value = ""; // Clear input
    document.getElementById("categoryInput").value = ""; // Clear category input
    alert("Quote added successfully!");
}

// Function to populate categories dynamically
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset dropdown

    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.innerText = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category filter from localStorage
    const lastFilter = localStorage.getItem("lastFilter");
    if (lastFilter) {
        categoryFilter.value = lastFilter;
    }
}

// Function to filter quotes based on category
function filterQuotes() {
    localStorage.setItem("lastFilter", document.getElementById("categoryFilter").value);
    generateQuote(); // Refresh quote display
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
            populateCategories();
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
    populateCategories(); // Load categories when the page loads
};
