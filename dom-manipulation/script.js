const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 30000;

let quotes = [];

// Load on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  loadFromLocalStorage();
  renderQuotes();
  await syncWithServer();
  setInterval(syncWithServer, SYNC_INTERVAL);

  const form = document.getElementById('quoteForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('quoteText').value.trim();
    const author = document.getElementById('quoteAuthor').value.trim();

    if (!text || !author) {
      alert("Please fill in both fields.");
      return;
    }

    const newQuote = {
      text,
      author,
      category: "General",
      version: 1
    };

    await postQuoteToServer(newQuote);
    quotes.push(newQuote);
    saveToLocalStorage();
    renderQuotes();

    form.reset();
  });
});

// Load quotes from local storage
function loadFromLocalStorage() {
  const stored = localStorage.getItem('quotes');
  quotes = stored ? JSON.parse(stored) : [];
}

// Save quotes to local storage
function saveToLocalStorage() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Render quote list
function renderQuotes() {
  const list = document.getElementById('quoteList');
  list.innerHTML = '';
  quotes.forEach(q => {
    const li = document.createElement('li');
    li.textContent = `"${q.text}" — ${q.author}`;
    list.appendChild(li);
  });
}

// Sync with server (GET request)
async function syncWithServer() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const fetchedQuotes = data.slice(0, 5).map(post => ({
      id: post.id,
      text: post.title,
      author: 'Unknown',
      category: 'General',
      version: 1
    }));

    // Merge unique ones
    const merged = [...quotes];
    fetchedQuotes.forEach(q => {
      if (!quotes.find(item => item.id === q.id)) {
        merged.push(q);
      }
    });

    quotes = merged;
    saveToLocalStorage();
    renderQuotes();
    showStatus('Synced with server', 'success');
  } catch (error) {
    console.error('Sync error:', error);
    showStatus('Failed to sync', 'error');
  }
}

// POST quote to server (simulated)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quote)
    });

    const result = await response.json();
    console.log('Posted:', result);
    showStatus('Quote added to server (simulated)', 'success');
  } catch (error) {
    console.error('POST failed:', error);
    showStatus('Failed to post quote', 'error');
  }
}

// Show feedback message
function showStatus(message, type = 'info') {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.className = `status ${type}`;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

