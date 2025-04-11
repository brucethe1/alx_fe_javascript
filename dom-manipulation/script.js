async function syncQuotes() {
  // POST unsynced quotes
  for (const quote of quotes) {
    if (!quote.synced) {
      await postQuoteToServer(quote);
      quote.synced = true;
    }
  }

  // Fetch from server and merge
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
}
