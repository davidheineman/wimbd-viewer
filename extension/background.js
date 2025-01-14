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
      let query = info.selectionText

      const index_name = 'docs_v1.7_2024-06-04';
      const seeMoreUrl = `http://localhost:3000/index.html?idx=${index_name}&q=${encodeURIComponent(query)}`;
      const see_more = `(<a href="${seeMoreUrl}" target="_blank">see more</a>)`;
      
      chrome.tabs.sendMessage(tab.id, {
        type: 'showResults',
        results: `<div class="loading">Loading... ${see_more}</div>`,
        x: response?.x,
        y: response?.y,
        query: query
      });
      
      const selectedText = query;
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
    const see_more = `(<a href="${seeMoreUrl}" target="_blank">see more</a>)`;
    const data = await response.json();


    chrome.tabs.sendMessage(tab.id, {
      type: 'showResults',
      results: `${data.count} occurrences in Dolma 1.7 ${see_more}`,
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

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'http://localhost:3000' });
});