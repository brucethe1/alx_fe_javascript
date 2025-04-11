// [Previous code remains the same until the end...]

// Add this new function to handle quote export
function exportQuotes() {
    // Get current filtered quotes
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quotesToExport = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Create JSON string
    const jsonString = JSON.stringify(quotesToExport, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedCategory === 'all' ? 'all_quotes.json' : `${selectedCategory}_quotes.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add event listener for export button
document.addEventListener('DOMContentLoaded', function() {
    // [Previous DOMContentLoaded code remains...]
    
    // Add export button event listener
    document.getElementById('exportBtn').addEventListener('click', exportQuotes);
});
