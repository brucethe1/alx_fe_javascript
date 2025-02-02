// Initialize quotes from localStorage
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Save to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    displayQuotes();
}

function addQuote() {
    const text = document.getElementById('quoteText').value;
    const author = document.getElementById('author').value;
    
    if (text && author) {
        quotes.push({ text, author });
        saveQuotes();
        document.getElementById('quoteText').value = '';
        document.getElementById('author').value = '';
    }
}

function displayQuotes() {
    const container = document.getElementById('quotesContainer');
    container.innerHTML = '';
    
    quotes.forEach((quote, index) => {
        const div = document.createElement('div');
        div.className = 'quote';
        div.innerHTML = `
            <p>"${quote.text}"</p>
            <em>- ${quote.author}</em>
            <button onclick="deleteQuote(${index})">Delete</button>
        `;
        div.onclick = () => showQuoteDetail(index);
        container.appendChild(div);
    });
}

// Session Storage Example
function showQuoteDetail(index) {
    sessionStorage.setItem('lastViewedQuote', index);
    alert(`Quote Details:\n\n"${quotes[index].text}"\n- ${quotes[index].author}`);
}

// Export functionality
function exportToJson() {
    const dataStr = JSON.stringify(quotes);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Import functionality
document.getElementById('importFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error('Invalid format');
            
            imported.forEach(quote => {
                if (!quote.text || !quote.author) {
                    throw new Error('Missing required fields');
                }
            });

            quotes.push(...imported);
            saveQuotes();
            alert(`Imported ${imported.length} quotes successfully!`);
        } catch (error) {
            alert(`Import failed: ${error.message}`);
        }
    };
    reader.readAsText(file);
});

// Initialize on load
window.onload = function() {
    displayQuotes();
    const lastIndex = sessionStorage.getItem('lastViewedQuote');
    if (lastIndex !== null) {
        alert(`Welcome back! Last viewed quote:\n\n"${quotes[lastIndex].text}"\n- ${quotes[lastIndex].author}`);
    }
}

function deleteQuote(index) {
    quotes.splice(index, 1);
    saveQuotes();
}
