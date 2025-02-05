// Fetch quotes from the server
const fetchQuotes = async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await response.json();
    return serverQuotes;
  } catch (error) {
    console.error('Error fetching quotes:', error);
  }
};

// Sync local data with server data
const syncLocalData = (serverQuotes) => {
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

  const mergedQuotes = serverQuotes.reduce((acc, serverQuote) => {
    const localQuote = localQuotes.find((q) => q.id === serverQuote.id);
    if (localQuote && localQuote.updatedAt > serverQuote.updatedAt) {
      acc.push(localQuote);
    } else {
      acc.push(serverQuote);
    }
    return acc;
  }, []);

  localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
  notifyUser('Quotes have been updated from the server.');
};

// Notify user of updates
const notifyUser = (message) => {
  const notification = document.createElement('div');
  notification.innerText = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#4CAF50';
  notification.style.color = 'white';
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 5000);
};

// Periodically fetch and sync data
setInterval(async () => {
  const serverQuotes = await fetchQuotes();
  syncLocalData(serverQuotes);
}, 10000);
