// Constants
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 30000;

let quotes = [];
let lastSyncTime = null;
let isOffline = false;

// On load
document.addEventListener('DOMContentLoaded', async () => {
  loadFromLocalStorage();
  renderQuotes();
  showLastSyncTime();
  await syncWithServer();
  setInterval(syncWithServer, SYNC_INTERVAL);

  // Form submission
  const form = document.getElementById('quoteForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('quoteText').value.trim();
    const author = document.getElementById('quoteAuthor').value.trim();

    if (!text || !author) return alert('Both fields required.');

    const newQuote = {
      id: Date.now(), // temporary ID
      text,
      author,
      category: 'General',
      version: 1
    };

    quotes.push(newQuote);
    saveToLocalStorage();
    renderQuotes();

    // Try to post immediately if online
    if (navigator.onLine) {
      await postQuoteToServer(newQuote);
    } else {
      showStatus('Saved locally. Will sync when online.', 'warning');
    }

    form.reset();
  });
});

// Load from local storage
function loadFromLocalStorage() {
  const saved = localStorage.getItem('quotes');
  quotes = saved ? JSON.parse(saved) : [];
}

// Save to local storage
function saveToLocalStorage() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  localStorage.setItem('lastSync', Date.now().toString());
}

// Show last sync time
function showLastSyncTime() {
  const display = document.getElementById('lastSyncDisplay');
  const last = localStorage.getItem('lastSync');
  display.textContent = last
    ? `Last sync: ${new Date(parseInt(last)).toLocaleTimeString()}`
    : 'Never synced';
}

// Render quotes
function renderQuotes() {
  const list = document.getElementById('quoteList');
  list.innerHTML = '';

  quotes.forEach(q => {
    const item = document.createElement('li');
    item.textContent = `"${q.text}" — ${q.author}`;
    list.appendChild(item);
  });
}

// Fetch from server
async function fetchQuotesFromServer() {
  const res = await fetch(API_URL);
  const data = await res.json();

  return data.slice(0, 10).map(post => ({
    id: post.id,
    text: post.title,
    author: 'Unknown',
    category: 'General',
    version: 1
  }));
}

// Sync with server
async function syncWithServer() {
  try {
    if (!navigator.onLine) {
      isOffline = true;
      showStatus('Offline: Using local data', 'warning');
      return;
    }

    // First, POST local quotes not yet synced
    for (const quote of quotes) {
      if (!quote.synced) {
        await postQuoteToServer(quote);
        quote.synced = true; // Mark as synced
      }
    }

    const serverQuotes = await fetchQuotesFromServer();
    const newQuotes = mergeQuotes(quotes, serverQuotes);

    if (newQuotes.length > quotes.length) {
      quotes = newQuotes;
      saveToLocalStorage();
      renderQuotes();
      showStatus('Synced with server', 'success');
    } else {
      showStatus('Already up to date', 'info');
    }

    lastSyncTime = Date.now();
    saveToLocalStorage();
    showLastSyncTime();
  } catch (err) {
    console.error('Sync failed:', err);
    showStatus('Sync failed: ' + err.message, 'error');
  }
}

// POST quote to server
async function postQuoteToServer(quote) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: quote.text,
        body: quote.author,
        userId: 1
      })
    });

    const data = await res.json();
    console.log('Posted:', data);
    showStatus('Quote synced with server', 'success');
  } catch (error) {
    console.error('POST failed:', error);
    showStatus('Failed to post quote', 'error');
  }
}

// Merge quotes
function mergeQuotes(local, server) {
  const merged = [...local];

  server.forEach(sq => {
    if (!local.find(lq => lq.id === sq.id)) {
      merged.push(sq);
    }
  });

  return merged;
}

// Show status message
function showStatus(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `status ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 3000);
}
