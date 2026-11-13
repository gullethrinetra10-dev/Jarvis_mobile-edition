const chat = document.getElementById('chat');
const input = document.getElementById('msg');
const API_KEY = "PASTE_YOUR_API_KEY_HERE"; // 👈 Ikkada mee Gemini API key pettandi

document.getElementById('send').onclick = async () => {
    const text = input.value.trim();
    if(!text) return;
    
    add('YOU: ' + text, 'user');
    input.value = '';
    add('J.A.R.V.I.S: Processing...', 'ai');

    try {
        const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + API_KEY,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }]
                })
            }
        );
        const data = await res.json();
        if(data.candidates && data.candidates[0]) {
            const replyText = data.candidates[0].content.parts[0].text;
            chat.lastChild.innerText = 'J.A.R.V.I.S: ' + replyText;
        } else {
            chat.lastChild.innerText = 'J.A.R.V.I.S: Error getting response.';
        }
    } catch(e) {
        chat.lastChild.innerText = 'J.A.R.V.I.S: Network Error!';
    }
};

function add(text, who){
    const d = document.createElement('div');
    d.className = 'msg ' + who;
    d.innerText = text;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
}

