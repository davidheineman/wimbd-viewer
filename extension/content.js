let popup = null;

function createPopup(x, y, content) {
    const posX = x || window.innerWidth / 2;
    const posY = y || window.innerHeight / 2;

    if (popup) {
        document.body.removeChild(popup);
    }

    popup = document.createElement('div');
    popup.className = 'wimbd-popup';

    const OFFSET_Y = 10;
    popup.style.left = `${posX - window.scrollX}px`;
    popup.style.top = `${posY - window.scrollY + OFFSET_Y}px`;
    popup.innerHTML = content;

    document.body.appendChild(popup);

    document.addEventListener('click', function closePopup(e) {
        if (popup && !popup.contains(e.target)) {
            document.body.removeChild(popup);
            popup = null;
            document.removeEventListener('click', closePopup);
        }
    });
}

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
    if (message.type === 'showResults') {
        const query = message.query;

        createPopup(message.x, message.y, '<div class="loading">Loading...</div>');

        const results = `
            <div class="query">${query}</div>
            <div class="count">${message.results}</div>
        `;

        if (popup) {
            popup.innerHTML = results;
        }
    }
}); 