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
    showLastSyncTime();
  } catch (err) {
    console.error('Sync failed:', err);
    showStatus('Sync failed: ' + err.message, 'error');
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

