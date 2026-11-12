// ⚠️ Ikkada mee Gemini API key paste cheyyandi
const API_KEY = AQ.Ab8RN6LO1ErUuBgqqY4fBasT0DjDcOcwHWnQ0Q5L9hvCIvxSfw;

const chat = document.getElementById('chat');
const input = document.getElementById('msg');
const sendBtn = document.getElementById('send');

sendBtn.onclick = () => {
    sendMessage();
};

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const t = input.value.trim();
    if (!t) return;
    
    add('YOU: ' + t, 'user');
    input.value = '';
    
    add('J.A.R.V.I.S: Processing...', 'ai');
    const loadingElement = chat.lastChild;

    let attempts = 3;
    let success = false;
    let data = null;

    while (attempts > 0 && !success) {
        try {
            const res = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: t }] }]
                    })
                }
            );
            data = await res.json();

            if (res.ok && data.candidates && data.candidates[0]) {
                success = true;
            } else {
                attempts--;
                if (attempts > 0) {
                    loadingElement.innerText = 'J.A.R.V.I.S: High demand, retrying...';
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        } catch (e) {
            attempts--;
            if (attempts === 0) {
                loadingElement.innerText = 'J.A.R.V.I.S: Network Error: ' + e.message;
                return;
            }
        }
    }

    if (success && data.candidates && data.candidates[0]) {
        const replyText = data.candidates[0].content.parts[0].text;
        loadingElement.innerText = 'J.A.R.V.I.S: ' + replyText;
    } else {
        loadingElement.innerText = 'J.A.R.V.I.S: Error connecting to brain.';
    }
}

function add(text, who) {
    const d = document.createElement('div');
    d.className = 'msg ' + who;
    d.innerText = text;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
}


