const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const quoteList = document.getElementById('quoteList');
const form = document.getElementById('quoteForm');

document.addEventListener('DOMContentLoaded', () => {
  fetchQuotes();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = document.getElementById('quoteText').value.trim();
  const author = document.getElementById('quoteAuthor').value.trim();

  if (!text || !author) return alert("Fill both fields");

  const newQuote = {
    title: text,
    body: author,
    userId: 1
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newQuote)
    });

    const result = await response.json();
    console.log('Posted:', result);
    addQuoteToList(text, author);
    form.reset();
    alert("Quote posted successfully (simulated)");
  } catch (error) {
    console.error("POST failed", error);
    alert("POST failed");
  }
});

async function fetchQuotes() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const quotes = data.slice(0, 5);
    quotes.forEach(q => addQuoteToList(q.title, `User ${q.userId}`));
  } catch (err) {
    console.error("GET failed", err);
    alert("Failed to fetch quotes");
  }
}

function addQuoteToList(text, author) {
  const li = document.createElement('li');
  li.textContent = `"${text}" — ${author}`;
  quoteList.appendChild(li);
}
