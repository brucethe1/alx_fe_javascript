const quoteContainer = document.getElementById('quote-container');
const addQuoteBtn = document.getElementById('add-quote');
const exportBtn = document.getElementById('export-quotes');
const importFileInput = document.getElementById('importFile');
const categoriesSelect = document.getElementById('categories');
const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
const serverUrl = "https://jsonplaceholder.typicode.com/posts"; 

async function fetchServerData() {
    try {
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();
        syncDataWithServer(serverQuotes);
    } catch (error) {
        console.error('Error fetching server data:', error);
    }
}
function syncDataWithServer(serverQuotes) {
    if (syncInProgress) return;

    syncInProgress = true;


    const mergedQuotes = serverQuotes.map((serverQuote, index) => {
        const localQuote = quotes[index];
        if (localQuote && localQuote.text !== serverQuote.title) {
            console.log(`Conflict detected for quote #${index + 1}: Using server's data.`);
        }
        return { text: serverQuote.title, category: serverQuote.body }; // Simulated mapping
    });

    // Update local storage with the merged quotes
    localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
    displayQuotes();

    syncInProgress = false;
}

setInterval(fetchServerData, 10000);

function displayQuotes() {
    quoteContainer.innerHTML = '';
    quotes.forEach((quote, index) => {
        const quoteElement = document.createElement('p');
        quoteElement.textContent = quote.text;
        quoteContainer.appendChild(quoteElement);
    });
    sessionStorage.setItem('lastViewedQuote', quotes[quotes.length - 1] || '');
}

function addQuote() {
    const newQuote = prompt('Enter a new quote:');
    if (newQuote) {
        const category = categoriesSelect.value; 
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

addQuoteBtn.addEventListener('click', addQuote);
exportBtn.addEventListener('click', exportQuotes);
importFileInput.addEventListener('change', importFromJsonFile);


displayQuotes();
populateCategories();
fetchServerData();


function populateCategories() {
    const categories = ['Motivational', 'Funny', 'Inspirational']; 
    categoriesSelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoriesSelect.appendChild(option);
    });
}
