// Server simulation URL (using JSONPlaceholder)
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Initialize quotes array
let quotes = [];
let lastSyncTime = 0;
let syncInterval = 30000; // Sync every 30 seconds
let syncInProgress = false;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    loadLocalData();
    setupEventListeners();
    startSyncInterval();
});

// Load data from localStorage
function loadLocalData() {
    const localData = localStorage.getItem('quotes');
    quotes = localData ? JSON.parse(localData) : getDefaultQuotes();
    const lastFilter = localStorage.getItem('lastFilter');
    
    populateCategories();
    filterQuotes();
    
    if (lastFilter) {
        document.getElementById('categoryFilter').value = lastFilter;
        filterQuotes();
    }
}

// Get default quotes if none exist
function getDefaultQuotes() {
    return [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Inspiration", id: Date.now(), version: 1 },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Leadership", id: Date.now()+1, version: 1 },
        { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "Life", id: Date.now()+2, version: 1 },
        { text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Inspiration", id: Date.now()+3, version: 1 },
        { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", category: "Perseverance", id: Date.now()+4, version: 1 }
    ];
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('exportBtn').addEventListener('click', exportQuotes);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('fileInput').addEventListener('change', handleFileImport);
    document.getElementById('syncNowBtn').addEventListener('click', syncWithServer);
    document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
}

// Start periodic sync
function startSyncInterval() {
    setInterval(syncWithServer, syncInterval);
}

// Sync with server
async function syncWithServer() {
    if (syncInProgress) return;
    syncInProgress = true;
    
    try {
        showNotification('Syncing with server...', 'info');
        
        // Simulate fetching from server
        const serverQuotes = await fetchServerQuotes();
        
        // Merge changes
        const mergeResult = mergeQuotes(quotes, serverQuotes);
        
        if (mergeResult.conflicts.length > 0) {
            showConflictResolution(mergeResult.conflicts);
        }
        
        if (mergeResult.updated || mergeResult.conflicts.length > 0) {
            quotes = mergeResult.mergedQuotes;
            saveLocalData();
            populateCategories();
            filterQuotes();
        }
        
        lastSyncTime = Date.now();
        showNotification('Sync completed', 'success');
    } catch (error) {
        showNotification('Sync failed: ' + error.message, 'error');
    } finally {
        syncInProgress = false;
    }
}

// Simulate fetching from server
async function fetchServerQuotes() {
    // In a real app, this would be a fetch() call to your actual API
    // For simulation, we'll use localStorage as our "server"
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate server occasionally adding new quotes
    const shouldAddNewQuote = Math.random() > 0.7;
    let serverQuotes = JSON.parse(localStorage.getItem('serverQuotes')) || [];
    
    if (shouldAddNewQuote) {
        const newQuote = {
            id: Date.now(),
            text: "New quote from server sync",
            author: "System",
            category: "Server",
            version: 1
        };
        serverQuotes.push(newQuote);
        localStorage.setItem('serverQuotes', JSON.stringify(serverQuotes));
    }
    
    return serverQuotes;
}

// Merge local and server quotes
function mergeQuotes(localQuotes, serverQuotes) {
    const mergedQuotes = [...localQuotes];
    const conflicts = [];
    
    serverQuotes.forEach(serverQuote => {
        const localIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
        
        if (localIndex === -1) {
            // New quote from server
            mergedQuotes.push(serverQuote);
        } else {
            // Existing quote - check for conflicts
            const localQuote = mergedQuotes[localIndex];
            if (serverQuote.version > localQuote.version) {
                // Server has newer version
                if (JSON.stringify(serverQuote) !== JSON.stringify(localQuote)) {
                    conflicts.push({
                        id: serverQuote.id,
                        local: localQuote,
                        server: serverQuote,
                        resolved: serverQuote // Default to server version
                    });
                }
                mergedQuotes[localIndex] = serverQuote;
            }
        }
    });
    
    return {
        mergedQuotes,
        conflicts,
        updated: serverQuotes.length > 0 || conflicts.length > 0
    };
}

// Show conflict resolution dialog
function showConflictResolution(conflicts) {
    const conflictDialog = document.createElement('div');
    conflictDialog.className = 'conflict-dialog';
    conflictDialog.innerHTML = `
        <div class="conflict-content">
            <h3>Data Conflicts Detected (${conflicts.length})</h3>
            <div id="conflictList"></div>
            <button id="resolveConflictsBtn">Accept Server Changes</button>
            <button id="keepLocalBtn">Keep My Changes</button>
        </div>
    `;
    
    const conflictList = conflictDialog.querySelector('#conflictList');
    conflicts.forEach(conflict => {
        const conflictItem = document.createElement('div');
        conflictItem.className = 'conflict-item';
        conflictItem.innerHTML = `
            <p><strong>Quote ID: ${conflict.id}</strong></p>
            <div class="conflict-version local">
                <h4>Your Version</h4>
                <p>${conflict.local.text}</p>
                <small>Author: ${conflict.local.author}, Category: ${conflict.local.category}</small>
            </div>
            <div class="conflict-version server">
                <h4>Server Version</h4>
                <p>${conflict.server.text}</p>
                <small>Author: ${conflict.server.author}, Category: ${conflict.server.category}</small>
            </div>
            <select class="resolve-select">
                <option value="server">Use Server Version</option>
                <option value="local">Keep My Version</option>
            </select>
        `;
        conflictList.appendChild(conflictItem);
    });
    
    document.body.appendChild(conflictDialog);
    
    conflictDialog.querySelector('#resolveConflictsBtn').addEventListener('click', () => {
        // Use server versions for all conflicts
        conflicts.forEach(conflict => {
            const index = quotes.findIndex(q => q.id === conflict.id);
            if (index !== -1) {
                quotes[index] = conflict.server;
            }
        });
        saveLocalData();
        conflictDialog.remove();
        showNotification('Conflicts resolved using server versions', 'success');
    });
    
    conflictDialog.querySelector('#keepLocalBtn').addEventListener('click', () => {
        // Keep local versions for all conflicts
        conflictDialog.remove();
        showNotification('Conflicts resolved keeping your versions', 'success');
    });
}

// Notification system
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

// [Previous functions (populateCategories, filterQuotes, addQuote, exportQuotes, handleFileImport) remain the same]
