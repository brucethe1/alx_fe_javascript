const quoteContainer = document.getElementById('quote-container');
const addQuoteBtn = document.getElementById('add-quote');
const exportBtn = document.getElementById('export-quotes');
const importFileInput = document.getElementById('importFile');
const quotes = JSON.parse(localStorage.getItem('quotes')) || [];

function displayQuotes() {
    quoteContainer.innerHTML = '';
    quotes.forEach((quote, index) => {
        const quoteElement = document.createElement('p');
        quoteElement.textContent = quote;
        quoteContainer.appendChild(quoteElement);
    });
    sessionStorage.setItem('lastViewedQuote', quotes[quotes.length - 1] || '');
}

displayQuotes();

function addQuote() {
    const newQuote = prompt('Enter a new quote:');
    if (newQuote) {
        quotes.push(newQuote);
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


displayQuotes();

function addQuote() {
    const newQuote = prompt('Enter a new quote:');
    if (newQuote) {
        quotes.push(newQuote);
        localStorage.setItem('quotes', JSON.stringify(quotes));
        displayQuotes();
    }
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

addQuoteBtn.addEventListener('click', addQuote);
exportBtn.addEventListener('click', exportQuotes);
importFileInput.addEventListener('change', importFromJsonFile);
