chrome.runtime.sendMessage({type: 'getLastResult'}, (response) => {
  if (response) {
    updateDisplay(response);
  }
});

function updateDisplay(message) {
  const resultsDiv = document.getElementById('results');

  if (message.type === 'updateCount') {
    resultsDiv.innerHTML = `
      <div class="result">
        <div class="query">"${message.data.query}"</div>
        <div class="count">Count: ${message.data.count.toLocaleString()}</div>
      </div>
    ` + resultsDiv.innerHTML;
  } else if (message.type === 'error') {
    resultsDiv.innerHTML = `
      <div class="error">Error: ${message.data}</div>
    ` + resultsDiv.innerHTML;
  }
}

chrome.runtime.onMessage.addListener((message) => {
  updateDisplay(message);
}); 