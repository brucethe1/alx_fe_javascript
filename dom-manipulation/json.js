const quoteContainer = document.getElementById('quote-container');
const addQuoteBtn = document.getElementById('add-quote');
const exportBtn = document.getElementById('export-quotes');
const importFileInput = document.getElementById('importFile');
const categoriesSelect = document.getElementById('categories'); // Assuming you have a select dropdown for categories
const quotes = JSON.parse(localStorage.getItem('quotes')) || [];

function displayQuotes() {
    quoteContainer.innerHTML = '';
    // Using map to transform quotes before displaying them
    const quoteElements = quotes.map((quote, index) => {
        const quoteElement = document.createElement('p');
        quoteElement.textContent = quote.text || quote; // Assuming each quote has a 'text' property or is just a string
        return quoteElement;
    });

    // Append all quote elements
    quoteElements.forEach(quoteElement => quoteContainer.appendChild(quoteElement));

    sessionStorage.setItem('lastViewedQuote', quotes[quotes.length - 1] || '');
}

function populateCategories() {
    const categories = ['Motivational', 'Funny', 'Inspirational']; // Example categories
    categoriesSelect.innerHTML = ''; // Clear existing options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoriesSelect.appendChild(option);
    });
}

function categoryFilter(selectedCategory) {
    // Filter quotes based on the selected category using map
    const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    quoteContainer.innerHTML = '';
    const quoteElements = filteredQuotes.map(quote => {
        const quoteElement = document.createElement('p');
        quoteElement.textContent = quote.text;
        return quoteElement;
    });
    quoteElements.forEach(quoteElement => quoteContainer.appendChild(quoteElement));
}

function addQuote() {
    const newQuote = prompt('Enter a new quote:');
    if (newQuote) {
        const category = categoriesSelect.value; // Assume you select a category for the new quote
        quotes.push({ text: newQuote, category: category });
        localStorage.setItem('quotes', JSON.stringify(quotes));
        displayQuotes();
    }
}

function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                localStorage.setItem('quotes', JSON.stringify(quotes));
                displayQuotes();
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid JSON format.');
            }
        } catch (error) {
            alert('Error parsing JSON file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
addQuoteBtn.addEventListener('click', addQuote);
exportBtn.addEventListener('click', exportQuotes);
importFileInput.addEventListener('change', importFromJsonFile);
categoriesSelect.addEventListener('change', (event) => categoryFilter(event.target.value));

displayQuotes();
populateCategories();
