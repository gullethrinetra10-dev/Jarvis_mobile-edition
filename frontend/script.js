```html
<!DOCTYPE html>
<html>
<body>
    <button id="start-btn">Activate Jarvis</button>
    <p id="output"></p>
    <script src="script.js"></script>
</body>
</html>
```

### 2. The Script (`script.js`)
This script listens for your voice, processes basic commands, and speaks back.

```javascript
const startBtn = document.getElementById('start-btn');
const output = document.getElementById('output');

// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onstart = () => {
    output.textContent = "Jarvis is listening...";
};

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    output.textContent = `You said: ${transcript}`;
    processCommand(transcript);
};

function processCommand(command) {
    if (command.includes("hello")) {
        speak("Hello sir, how can I help you today?");
    } else if (command.includes("time")) {
        const time = new Date().toLocaleTimeString();
        speak("The time is " + time);
    } else if (command.includes("open google")) {
        speak("Opening Google");
        window.open("https://google.com", "_blank");
    } else {
        speak("I am sorry, I do not understand that command.");
    }
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: change voice
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices[0]; 
    window.speechSynthesis.speak(utterance);
}

startBtn.addEventListener('click', () => {
    recognition.start();
});
```
