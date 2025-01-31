let quotes = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    
    // Add event listeners
    document.getElementById('categoryFilter').addEventListener('change', filterQuotesByCategory);
    document.getElementById('importFile').addEventListener('change', importFromJsonFile);
});

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    quotes = storedQuotes ? JSON.parse(storedQuotes) : [
        { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
        { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
        { text: "The best way to predict the future is to create it.", category: "Inspiration" }
    ];
    showRandomQuote();
    populateCategories();
}

function populateCategories() {
    const categorySelect = document.getElementById('categoryFilter');
    categorySelect.innerHTML = '<option value="all">All Categories</option>';
    
    // Get unique categories using Set
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function filterQuotesByCategory() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display filtered quotes (modify as needed)
    console.log(filteredQuotes); // Or update display logic
}

// Rest of your existing functions remain the same
