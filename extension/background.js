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
    chrome.tabs.sendMessage(tab.id, { type: 'getSelectionCoords' }, (response) => {
      // First, show the loading popup
      chrome.tabs.sendMessage(tab.id, {
        type: 'showResults',
        results: '<div class="loading">Loading...</div>',
        x: response?.x,
        y: response?.y,
        query: info.selectionText
      });
      
      const selectedText = info.selectionText;
      fetchCounts(selectedText, response, tab);
    });
  }
});

async function fetchCounts(query, coords, tab) {
  try {
    // const index_name = 're_pile';
    const index_name = 'docs_v1.7_2024-06-04';
    const seeMoreUrl = `http://localhost:3000/index.html?idx=${index_name}&q=${encodeURIComponent(query)}`;
    const response = await fetch(`http://localhost:3000/counts?index=${index_name}&q=${encodeURIComponent(query)}`);
    const data = await response.json();


    chrome.tabs.sendMessage(tab.id, {
      type: 'showResults',
      results: `${data.count} occurrences in Dolma 1.7 (<a href="${seeMoreUrl}" target="_blank">see more</a>)`,
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getLastResult' && lastResult) {
    sendResponse(lastResult);
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  chrome.tabs.sendMessage(sender.tab.id, { type: 'getSelectionCoords' }, coords => {
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