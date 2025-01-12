console.log('Content script loaded!');

let popup = null;

function createPopup(x, y, results) {
    // Add default positioning if coordinates are undefined
    const posX = x || window.innerWidth / 2;
    const posY = y || window.innerHeight / 2;
    
    console.log('Creating popup at:', posX, posY, 'with results:', results);
    
    // Remove existing popup if any
    if (popup) {
        document.body.removeChild(popup);
    }

    // Create new popup
    popup = document.createElement('div');
    popup.className = 'wimbd-popup';
    
    // Position popup below the text with a 10px offset
    const OFFSET_Y = 10; // pixels below the selection
    popup.style.left = `${posX - window.scrollX}px`;
    popup.style.top = `${posY - window.scrollY + OFFSET_Y}px`;
    popup.innerHTML = results;

    document.body.appendChild(popup);

    // Add click outside listener to close popup
    document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target)) {
            document.body.removeChild(popup);
            popup = null;
            document.removeEventListener('click', closePopup);
        }
    });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getSelectionCoords') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            sendResponse({
                x: rect.left + window.scrollX,
                y: rect.bottom + window.scrollY,
                scrollX: window.scrollX,
                scrollY: window.scrollY
            });
        }
    }
    console.log('Content script received message:', message);
    if (message.type === 'showResults') {
        const query = message.query;  // We'll need the query passed from background.js
        const seeMoreUrl = `http://localhost:5500/browser/index.html?idx=re_pile&q=${encodeURIComponent(query)}`;
        
        const results = `
            <div class="query">${query}</div>
            <div class="count">
                ${message.results} 
                (<a href="${seeMoreUrl}" target="_blank">see more</a>)
            </div>
        `;
        
        createPopup(message.x, message.y, results);
    }
}); 