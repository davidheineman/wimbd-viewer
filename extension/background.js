let lastResult = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "getWIMBDCount",
    title: "Get WIMBD Count",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getWIMBDCount") {
    console.log("Context menu clicked!", info.selectionText);
    
    // First get the selection coordinates from the content script
    chrome.tabs.sendMessage(tab.id, { type: 'getSelectionCoords' }, (response) => {
      const selectedText = info.selectionText;
      fetchCounts(selectedText, response, tab);
    });
  }
});

async function fetchCounts(query, coords, tab) {
  console.log("Fetching counts for:", query, "with coords:", coords);
  try {
    const response = await fetch(
      `http://localhost:3000/counts?q=${encodeURIComponent(query)}&index=re_pile`
    );
    console.log("Response received:", response);
    const data = await response.json();
    
    chrome.tabs.sendMessage(tab.id, {
      type: 'showResults',
      results: `${data.count} occurrences in the Pile`,
      query: query,
      x: coords?.x,
      y: coords?.y,
      scrollX: coords?.scrollX,
      scrollY: coords?.scrollY
    });

  } catch (error) {
    console.error('Error fetching counts:', error);
    
    chrome.tabs.sendMessage(tab.id, {
      type: 'showResults',
      results: `<div class="error">Error: ${error.message}</div>`,
      x: coords?.x,
      y: coords?.y
    });
  }
}

// Add this message listener to handle popup requests for the last result
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getLastResult' && lastResult) {
    sendResponse(lastResult);
  }
});

// In your background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // First get the coordinates
    chrome.tabs.sendMessage(sender.tab.id, { type: 'getSelectionCoords' }, coords => {
        // Then create popup with results at those coordinates
        chrome.tabs.sendMessage(sender.tab.id, {
            type: 'showResults',
            results: request.results,
            x: coords?.x,
            y: coords?.y,
            scrollX: coords?.scrollX,
            scrollY: coords?.scrollY
        });
    });
}); 