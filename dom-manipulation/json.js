let quotes = [];

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes
        quotes = [
            { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
            { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
            { text: "The best way to predict the future is to create it.", category: "Inspiration" }
        ];
    }
    showRandomQuote();
    populateCategories(); // Ensure categories are populated on load
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available.";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteDisplay.textContent = `"${quotes[randomIndex].text}" - ${quotes[randomIndex].category}`;
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);
        saveQuotes();
        
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        
        alert("Quote added successfully!");
        populateCategories();
        filterQuotesByCategory(); // Refresh displayed quotes
    } else {
        alert("Please enter both quote text and category.");
    }
}

function exportQuotes() {
    const json = JSON.stringify(quotes, null, 2); // Pretty print JSON
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById('exportQuotes').addEventListener('click', exportQuotes);

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            alert('Quotes imported successfully!');
            showRandomQuote();
            populateCategories();
            filterQuotesByCategory();
        } catch (error) {
            alert('Invalid JSON format.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

function populateCategories() {
    const categorySet = new Set(quotes.map(quote => quote.category));
    const categorySelect = document.getElementById('categoryFilter');

    categorySelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All Categories';
    categorySelect.appendChild(defaultOption);

    categorySet.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// **Filtering Quotes Based on Selected Category**
function filterQuotesByCategory() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory
        ? quotes.filter(quote => quote.category === selectedCategory)
        : quotes; // If no category is selected, show all

    const quoteList = document.getElementById('filteredQuotes');
    quoteList.innerHTML = '';

    if (filteredQuotes.length === 0) {
        quoteList.innerHTML = "<p>No quotes found for this category.</p>";
        return;
    }

    filteredQuotes.forEach(quote => {
        const li = document.createElement('li');
        li.textContent = `"${quote.text}" - ${quote.category}`;
        quoteList.appendChild(li);
    });
}

document.getElementById('categoryFilter').addEventListener('change', filterQuotesByCategory);

window.onload = loadQuotes;
