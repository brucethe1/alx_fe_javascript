// Initialize quotes array from localStorage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Leadership" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "Life" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Inspiration" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", category: "Perseverance" }
];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    populateCategories();
    filterQuotes();
    
    // Load last selected filter
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter) {
        document.getElementById('categoryFilter').value = lastFilter;
        filterQuotes();
    }

    // Add event listener for export button
    document.getElementById('exportBtn').addEventListener('click', exportQuotes);
    
    // Add event listener for import button
    document.getElementById('importBtn').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });

    // Add file input change handler
    document.getElementById('fileInput').addEventListener('change', handleFileImport);
});

// Function to handle file import
function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Create new FileReader instance
    const reader = new FileReader();
    
    // Set up onload event handler
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes) && importedQuotes.every(isValidQuote)) {
                quotes = importedQuotes;
                localStorage.setItem('quotes', JSON.stringify(quotes));
                populateCategories();
                filterQuotes();
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid file format. Please import a valid JSON array of quotes with text, author, and category fields.');
            }
        } catch (error) {
            alert('Error parsing file: ' + error.message);
        }
    };
    
    // Set up onerror event handler
    reader.onerror = function() {
        alert('Error reading file');
    };
    
    // Read the file as text
    reader.readAsText(file);
}

// Helper function to validate quote structure
function isValidQuote(quote) {
    return quote && 
           typeof quote.text === 'string' && 
           typeof quote.author === 'string' && 
           typeof quote.category === 'string';
}

// Function to populate categories dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Clear existing options except "All Categories"
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Get unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quotesContainer = document.getElementById('quotesContainer');
    
    // Save the selected filter
    localStorage.setItem('lastFilter', selectedCategory);
    
    // Clear the container
    quotesContainer.innerHTML = '';
    
    // Filter quotes
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display filtered quotes
    filteredQuotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-container';
        quoteElement.innerHTML = `
            <p>"${quote.text}"</p>
            <p><em>- ${quote.author}</em></p>
            <small>Category: ${quote.category}</small>
        `;
        quotesContainer.appendChild(quoteElement);
    });
}

// Function to add a new quote
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const author = document.getElementById('newQuoteAuthor').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    
    if (!text || !author || !category) {
        alert('Please fill in all fields');
        return;
    }
    
    // Add new quote
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    
    // Save to localStorage
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // Update UI
    populateCategories(); // In case it's a new category
    filterQuotes();
    
    // Clear form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteAuthor').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

// Function to export quotes as JSON file
function exportQuotes() {
    // Get current filtered quotes
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quotesToExport = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Create JSON string with proper formatting
    const jsonString = JSON.stringify(quotesToExport, null, 2);
    
    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedCategory === 'all' ? 'all_quotes.json' : `${selectedCategory}_quotes.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
