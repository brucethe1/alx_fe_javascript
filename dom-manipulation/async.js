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

// Post a quote to the server
const postQuoteToServer = async (quote) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quote),
    });
    if (!response.ok) {
      throw new Error('Failed to post quote to the server');
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error posting quote:', error);
    return null;
  }
};

// Display quotes in the UI
const displayQuotes = (quotes) => {
  const quotesContainer = document.getElementById('quotes-container');
  quotesContainer.innerHTML = ''; // Clear previous content

  quotes.forEach((quote) => {
    const quoteElement = document.createElement('div');
    quoteElement.className = 'quote';
    quoteElement.innerHTML = `<p>${quote.title}</p>`;
    quotesContainer.appendChild(quoteElement);
  });
};

// Load and display quotes
const loadQuotes = async () => {
  const quotes = await fetchQuotesFromServer();
  displayQuotes(quotes);
};

// Example: Post a new quote
const newQuote = {
  title: 'This is a new quote',
  body: 'This is the content of the new quote',
  userId: 1,
};

postQuoteToServer(newQuote).then((result) => {
  if (result) {
    console.log('Quote posted successfully:', result);
  }
});

// Load quotes when the page loads
loadQuotes();
