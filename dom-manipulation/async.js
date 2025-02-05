// Fetch quotes from the server
const fetchQuotesFromServer = async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) {
      throw new Error('Failed to fetch quotes from the server');
    }
    const serverQuotes = await response.json();
    return serverQuotes;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return []; // Return an empty array in case of error
  }
};

// Sync local data with server data
const syncLocalData = async () => {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

  const mergedQuotes = serverQuotes.reduce((acc, serverQuote) => {
    const localQuote = localQuotes.find((q) => q.id === serverQuote.id);
    if (localQuote && localQuote.updatedAt > serverQuote.updatedAt) {
      // Keep local quote if it was updated more recently
      acc.push(localQuote);
    } else {
      // Otherwise, use server quote
      acc.push(serverQuote);
    }
    return acc;
  }, []);

  // Save merged data to local storage
  localStorage.setItem('quotes', JSON.stringify(mergedQuotes));

  // Notify user of updates
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
  }, 5000); // Remove notification after 5 seconds
};

// Periodically fetch and sync data every 5 seconds
setInterval(syncLocalData, 5000); // 5000 milliseconds = 5 seconds

// Initial sync when the page loads
syncLocalData();
