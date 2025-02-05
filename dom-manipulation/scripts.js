document.addEventListener("DOMContentLoaded", () => {
    const quoteInput = document.getElementById("quoteInput");
    const addQuoteBtn = document.getElementById("addQuoteBtn");
    const quoteList = document.getElementById("quoteList");
    const exportBtn = document.getElementById("exportBtn");
    const importFile = document.getElementById("importFile");


    
    function localStoragesetItem() {
            
 const quotes = ["Believe in yourself.", "Stay focused.", "Never give up."];
localStorage.setItem("quotes", JSON.stringify(quotes));
console.log("Quotes saved to localStorage!");
        
       
    }
    
    function renderQuotes() {
        quoteList.innerHTML = "";
        quotes.forEach((quote, index) => {
            const li = document.createElement("li");
            li.textContent = quote;
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => {
                quotes.splice(index, 1);
                saveQuotes();
                renderQuotes();
            };
            li.appendChild(deleteBtn);
            quoteList.appendChild(li);
        });
    }
    
    addQuoteBtn.addEventListener("click", () => {
        const quote = quoteInput.value.trim();
        if (quote) {
            quotes.push(quote);
            saveQuotes();
            renderQuotes();
            quoteInput.value = "";
        }
    });
    
    exportBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "quotes.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    importFile.addEventListener("change", (event) => {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            try {
                const importedQuotes = JSON.parse(event.target.result);
                if (Array.isArray(importedQuotes)) {
                    quotes.push(...importedQuotes);
                    saveQuotes();
                    renderQuotes();
                    alert("Quotes imported successfully!");
                } else {
                    alert("Invalid JSON format");
                }
            } catch (error) {
                alert("Error reading file");
            }
        };
        fileReader.readAsText(event.target.files[0]);
    });
    
    // Store last viewed quote in session storage
    if (sessionStorage.getItem("lastViewedQuote")) {
        alert("Last viewed quote: " + sessionStorage.getItem("lastViewedQuote"));
    }
    
    quoteList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            sessionStorage.setItem("lastViewedQuote", event.target.textContent);
        }
    });
    
    renderQuotes();
});
