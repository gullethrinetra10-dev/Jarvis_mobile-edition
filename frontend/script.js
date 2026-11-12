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

    // API key lekunda temporary response kosam
    setTimeout(() => {
        loadingElement.innerText = 'J.A.R.V.I.S: Systems online.';
    }, 1000);
}

function add(text, who) {
    const d = document.createElement('div');
    d.className = 'msg ' + who;
    d.innerText = text;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
    return d;
}
