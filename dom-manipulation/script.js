// Server configuration
const API_BASE = 'https://jsonplaceholder.typicode.com';
const QUOTES_ENDPOINT = '/posts'; // We'll use posts endpoint to simulate quotes
const SYNC_INTERVAL = 30000; // 30 seconds

// Quote data and state
let quotes = [];
let lastSyncTime = null;
let syncInProgress = false;
let offlineMode = false;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await loadLocalData();
    setupUI();
    setupEventListeners();
    startSyncInterval();
    showNotification('Application loaded', 'info');
});

// Data loading and synchronization
async function loadLocalData() {
    const localData = localStorage.getItem('quotes');
    quotes = localData ? JSON.parse(localData) : getDefaultQuotes();
    updateLastSyncDisplay();
}

async function syncWithServer() {
    if (syncInProgress || offlineMode) return;
    syncInProgress = true;

    try {
        showNotification('Starting synchronization...', 'info');

        if (!await checkNetworkConnection()) {
            offlineMode = true;
            showNotification('Offline mode - working locally', 'warning');
            return;
        }

        const serverQuotes = await fetchQuotesFromServer();

        const mergeResult = mergeQuotes(quotes, serverQuotes);

        if (mergeResult.conflicts.length > 0) {
            await handleConflicts(mergeResult.conflicts);
        }

        if (mergeResult.updated) {
            quotes = mergeResult.mergedQuotes;
            await saveLocalData();
            populateCategories();
            filterQuotes();
            showNotification('Data synchronized successfully', 'success');
        } else {
            showNotification('Data is up to date', 'info');
        }

        lastSyncTime = Date.now();
        updateLastSyncDisplay();
    } catch (error) {
        showNotification(`Sync failed: ${error.message}`, 'error');
        console.error('Sync error:', error);
    } finally {
        syncInProgress = false;
    }
}

// Server communication functions
async function checkNetworkConnection() {
    try {
        const response = await fetch(`${API_BASE}/posts/1`);
        return response.ok;
    } catch {
        return false;
    }
}

async function fetchQuotesFromServer() {
    try {
        const response = await fetch(`${API_BASE}${QUOTES_ENDPOINT}`);
        if (!response.ok) throw new Error('Server error');

        const data = await response.json();
        return data.map(post => ({
            id: post.id,
            text: post.title,
            author: 'Unknown',
            category: 'General',
            version: 1,
            serverModified: true
        }));
    } catch (error) {
        throw new Error('Failed to fetch server data');
    }
}

// Data merging and conflict resolution
function mergeQuotes(localQuotes, serverQuotes) {
    const mergedQuotes = [...localQuotes];
    const conflicts = [];
    let updated = false;

    serverQuotes.forEach(serverQuote => {
        const localIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);

        if (localIndex === -1) {
            mergedQuotes.push(serverQuote);
            updated = true;
        } else {
            const localQuote = mergedQuotes[localIndex];
            if (JSON.stringify(serverQuote) !== JSON.stringify(localQuote)) {
                conflicts.push({
                    id: serverQuote.id,
                    local: localQuote,
                    server: serverQuote,
                    resolved: serverQuote
                });
                mergedQuotes[localIndex] = serverQuote;
                updated = true;
            }
        }
    });

    return { mergedQuotes, conflicts, updated };
}

async function handleConflicts(conflicts) {
    return new Promise(resolve => {
        const dialog = createConflictDialog(conflicts);

        dialog.querySelector('#resolveAllServer').addEventListener('click', () => {
            conflicts.forEach(conflict => {
                const index = quotes.findIndex(q => q.id === conflict.id);
                if (index !== -1) quotes[index] = conflict.server;
            });
            dialog.remove();
            showNotification('All conflicts resolved (server versions kept)', 'success');
            resolve();
        });

        dialog.querySelector('#resolveAllLocal').addEventListener('click', () => {
            dialog.remove();
            showNotification('All conflicts resolved (local versions kept)', 'success');
            resolve();
        });

        dialog.querySelector('#customResolve').addEventListener('click', () => {
            dialog.remove();
            showNotification('Custom conflict resolution not yet implemented', 'info');
            resolve();
        });
    });
}

// UI Functions
function setupUI() {
    populateCategories();
    filterQuotes();
    updateLastSyncDisplay();
}

function updateLastSyncDisplay() {
    const syncDisplay = document.getElementById('lastSyncDisplay');
    if (!lastSyncTime) {
        syncDisplay.textContent = 'Never synced';
        return;
    }
    const syncTime = new Date(lastSyncTime);
    syncDisplay.textContent = `Last sync: ${syncTime.toLocaleTimeString()}`;
}

function createConflictDialog(conflicts) {
    const dialog = document.createElement('div');
    dialog.className = 'conflict-dialog';
    dialog.innerHTML = `
        <div class="conflict-content">
            <h3>Conflict Resolution (${conflicts.length} conflicts)</h3>
            <div class="conflict-list">
                ${conflicts.map(conflict => `
                    <div class="conflict-item">
                        <h4>Quote ID: ${conflict.id}</h4>
                        <div class="versions">
                            <div class="version local">
                                <h5>Your Version</h5>
                                <p>${conflict.local.text}</p>
                                <small>Author: ${conflict.local.author}, Category: ${conflict.local.category}</small>
                            </div>
                            <div class="version server">
                                <h5>Server Version</h5>
                                <p>${conflict.server.text}</p>
                                <small>Author: ${conflict.server.author}, Category: ${conflict.server.category}</small>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="resolution-options">
                <button id="resolveAllServer">Use All Server Versions</button>
                <button id="resolveAllLocal">Keep All My Versions</button>
                <button id="customResolve">Resolve Individually</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    return dialog;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Utility Functions
function startSyncInterval() {
    setInterval(() => {
        if (!document.hidden) {
            syncWithServer();
        }
    }, SYNC_INTERVAL);
}

function saveLocalData() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('lastSync', lastSyncTime);
}

// Placeholder for missing UI logic
function populateCategories() {
    // Dummy placeholder logic
    console.log('Categories populated');
}

function filterQuotes() {
    // Dummy placeholder logic
    console.log('Quotes filtered');
}

function setupEventListeners() {
    // Dummy placeholder logic
    console.log('Event listeners set up');
}

function getDefaultQuotes() {
    return [
        {
            id: 1,
            text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
            author: "Winston Churchill",
            category: "Inspiration",
            version: 1
        }
    ];
}
