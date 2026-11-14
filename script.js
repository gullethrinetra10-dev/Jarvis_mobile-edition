<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>J.A.R.V.I.S</title>
    <!-- Google Fonts Interlinking -->
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Orbitron', monospace; }
        body { background: #000; color: #0ff; padding: 20px; }
        header { text-align: center; }
        header h1 { letter-spacing: 6px; text-shadow: 0 0 12px #0ff; }
        header p { font-size: 10px; letter-spacing: 4px; opacity: .6; }

        .core { position: relative; width: 160px; height: 160px; margin: 25px auto; }
        .ring { position: absolute; border: 2px solid #0ff; border-radius: 50%; box-shadow: 0 0 15px #0ff; }
        .r1 { inset: 0; border-top-color: transparent; animation: spin 3s linear infinite; }
        .r2 { inset: 20px; border-bottom-color: transparent; animation: spin 2s linear infinite reverse; }
        .center { position: absolute; inset: 50px; background: #0ff; border-radius: 50%; box-shadow: 0 0 30px #0ff; animation: pulse 1.5s infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 50% { opacity: .4; } }
        .core-text { text-align: center; font-size: 11px; letter-spacing: 3px; }

        .status { border: 1px solid rgba(0, 255, 255, .3); background: rgba(0, 255, 255, .05); padding: 12px; margin: 20px 0; }
        .status h2 { font-size: 12px; letter-spacing: 2px; margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; font-size: 11px; margin: 6px 0; }
        .on { color: #0f0; } .off { color: #f00; }

        .chat { border: 1px solid rgba(0, 255, 255, .3); height: 180px; overflow-y: auto; padding: 10px; font-size: 12px; margin-bottom: 12px; }
        .msg { margin: 6px 0; padding: 6px; border-left: 2px solid #0ff; background: rgba(0, 255, 255, .08); white-space: pre-wrap; }
        .msg.user { border-left-color: #fff; }

        .input-area { display: flex; gap: 8px; margin-top: 12px; }
        input { flex: 1; background: #000; border: 1px solid #0ff; color: #0ff; padding: 10px; outline: none; }
        button { background: #0ff; color: #000; border: none; padding: 10px 16px; font-weight: bold; cursor: pointer; }
        button:hover { background: #fff; }
    </style>
</head>
<body>

    <header>
        <h1>J.A.R.V.I.S</h1>
        <p>MOBILE EDITION</p>
    </header>

    <div class="core">
        <div class="ring r1"></div>
        <div class="ring r2"></div>
        <div class="center"></div>
    </div>
    <p class="core-text">CORE ACTIVE</p>

    <div class="status">
        <h2>SYSTEM STATUS</h2>
        <div class="row"><span>AI CORE</span><b class="on">• ONLINE</b></div>
        <div class="row"><span>NETWORK</span><b class="on">• ONLINE</b></div>
        <div class="row"><span>VOICE</span><b class="off" id="voice-status">o LOCKED</b></div>
        <div class="row"><span>MEMORY</span><b class="on">• ACTIVE</b></div>
    </div>

    <!-- Chat Box Interlinking -->
    <div class="chat" id="chat"></div>
    
    <div class="input-area">
        <input id="msg" placeholder="Ask J.A.R.V.I.S..." />
        <button id="send">SEND</button>
        <button id="mic-btn">MIC</button>
    </div>

    <script>
        // @ts-check
        
        // 1. API KEY Setup (LocalStorage / Prompt)
        let API_KEY = localStorage.getItem('jarvis_key');
        if (!API_KEY) {
            API_KEY = prompt('Enter your Gemini API Key:') || '';
            if (API_KEY) localStorage.setItem('jarvis_key', API_KEY);
        }

        // 2. Smart Models (Auto-fallback)
        const MODELS = ["gemini-1.5-flash-latest", "gemini-flash-latest"];
        const chat = /** @type {HTMLElement} */ (document.getElementById('chat'));
        const input = /** @type {HTMLInputElement} */ (document.getElementById('msg'));
        const micBtn = /** @type {HTMLButtonElement} */ (document.getElementById('mic-btn'));

        // UI Add Message Helper
        /**
         * @param {string} t
         * @param {string} w
         */
        function add(t, w) {
            const d = document.createElement('div');
            d.className = 'msg ' + w;
            d.innerText = t;
            chat.appendChild(d);
            chat.scrollTop = chat.scrollHeight;
        }

        // 3. Tools Interlinking (Time, Weather, Timer, Translate, YouTube)
        /**
         * @param {string} text
         */
        async function handleTools(text) {
            const t = text.toLowerCase();

            // 1. Time
            if (/\btime\b/.test(t) || t.includes('సమయం')) {
                return 'The time is ' + new Date().toLocaleTimeString() + ', Boss.';
            }

            // 2. Weather
            if (t.includes('weather') || t.includes('వాతావరణం')) {
                return new Promise(res => {
                    /** @param {GeolocationPosition} p */
                    navigator.geolocation.getCurrentPosition(async p => {
                        try {
                            const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&current_weather=true`);
                            const d = await r.json();
                            res(`It is ${d.current_weather.temperature} degrees Celsius now, Boss.`);
                        } catch(e) { res('Weather service error, Boss.'); }
                    }, () => res('I need location permission for weather, Boss.'));
                });
            }

            // 3. Timer
            const m = t.match(/(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i);
            if ((t.includes('timer') || t.includes('టైమర్')) && m) {
                const amount = parseInt(m[1]); 
                const unit = m[2].toLowerCase();
                const factor = /^(hours?|hrs?|h)/.test(unit) ? 3600000 : /^(seconds?|secs?|s)/.test(unit) ? 1000 : 60000;
                const duration = amount * factor;
                setTimeout(() => speak(`టైమర్ పూర్తయింది! ${amount} ${unit} అయ్యాయి.`), duration);
                return `Timer set for ${amount} ${unit}.`;
            }

            // 4. Translate
            if (t.includes('translate')) {
                const q = text.replace(/translate (this )?/i, '').trim() || 'hello';
                try {
                    const r = await fetch(`https://api.mymemory.translated.net/get?q=` + encodeURIComponent(q) + `&langpair=en|te`);
                    const d = await r.json();
                    return 'In Telugu: ' + d.responseData.translatedText;
                } catch(e) { return 'Translate error, Boss.'; }
            }

            // 5. YouTube Play
            if (t.includes('play ') || t.includes('youtube ')) {
                const q = text.replace(/play |youtube (search )?/i, '').trim();
                if (q) window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(q));
                return 'Searching YouTube for ' + q + ', Boss.';
            }

            return null; 
        }

        // 4. Gemini Brain (Auto-fallback fetch)
        /**
         * @param {string} p
         */
        async function callGemini(p) {
            let lastErr;
            for (const m of MODELS) {
                try {
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${API_KEY}`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({contents: [{parts: [{text: p}]}]})
                    });
                    const data = await res.json();
                    if (data.error) {
                        lastErr = new Error(data.error.message);
                        if (/high demand|temporal|quota|rate|unavailable|no longer available|deprecated/i.test(data.error.message)) continue;
                        throw lastErr;
                    }
                    return data.candidates[0].content.parts[0].text;
                } catch(e) { lastErr = e; }
            }
            throw lastErr;
        }

        // Ask Gemini or Tool handler Interlinking
        /**
         * @param {string} p
         */
        async function askGemini(p) {
            add('J.A.R.V.I.S: Thinking...', 'ai');
            try {
                let reply = await handleTools(p);
                if (!reply) {
                    reply = await callGemini(p);
                }
                if(chat.lastChild) {
                    /** @type {HTMLElement} */ (chat.lastChild).innerText = 'J.A.R.V.I.S: ' + reply;
                }
                speak(reply); 
            } catch(e) {
                if(chat.lastChild) {
                    /** @type {HTMLElement} */ (chat.lastChild).innerText = 'J.A.R.V.I.S: ' + /** @type {Error} */(e).message;
                }
            }
        }

        // 5. Speech Recognition (Mic)
        try {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.lang = 'en-US';
            /** @param {any} e */
            rec.onresult = (e) => {
                const t = e.results[0][0].transcript;
                add('YOU: ' + t, 'user');
                askGemini(t);
            };
            micBtn.onclick = () => { rec.start(); micBtn.innerText = "LISTENING..."; };
            rec.onend = () => { 
                micBtn.innerText = "MIC"; 
                const voiceStatus = document.getElementById('voice-status');
                if(voiceStatus) {
                    voiceStatus.innerText = "• ONLINE"; 
                    voiceStatus.className = "on";
                }
            };
        } catch(err) { console.log("Speech recognition not supported"); }

        // 6. Text-to-Speech (Speaking)
        /** @type {SpeechSynthesisVoice[]} */
        let voices = [];
        function loadVoices() { voices = speechSynthesis.getVoices(); }
        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;

        /**
         * @param {string} t
         */
        function speak(t) {
            const u = new SpeechSynthesisUtterance(t);
            u.rate = 1.05; u.pitch = 0.85;
            const v = voices.find(v => v.lang.startsWith('en'));
            if (v) u.voice = v;
            speechSynthesis.speak(u);
        }

        // 7. Text Send Button Interlinking
        const sendBtn = document.getElementById('send');
        if(sendBtn) {
            sendBtn.onclick = () => {
                const t = input.value.trim();
                if (!t) return;
                add('YOU: ' + t, 'user');
                input.value = '';
                askGemini(t);
            };
        }
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const sendButton = document.getElementById('send');
                if(sendButton) /** @type {HTMLElement} */(sendButton).click();
            }
        });
    </script>
</body>
</html>
            
