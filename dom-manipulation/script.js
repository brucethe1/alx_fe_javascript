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
            if (Array.isArray(importedQuotes) {
                quotes = importedQuotes;
                localStorage.setItem('quotes', JSON.stringify(quotes));
                populateCategories();
                filterQuotes();
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid file format. Please import a valid JSON array of quotes.');
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

// [Rest of your existing functions (populateCategories, filterQuotes, addQuote, exportQuotes) remain unchanged]
