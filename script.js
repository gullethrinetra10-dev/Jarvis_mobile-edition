
"use strict";

// ===============================
// J.A.R.V.I.S AI ASSISTANT
// Gemini Brain + Voice Assistant
// ===============================

const apiKeyInput = document.getElementById("apiKey");
const startBtn = document.getElementById("start-btn");
const statusText = document.getElementById("status");
const responseText = document.getElementById("response");

// Gemini model
const MODEL = "gemini-2.5-flash";

// Gemini API endpoint
const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Voice recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;
let isProcessing = false;

// ===============================
// 1. LOAD SAVED API KEY
// ===============================

apiKeyInput.value = localStorage.getItem("jarvis_key") || "";

// ===============================
// 2. SAVE API KEY
// ===============================

apiKeyInput.addEventListener("change", () => {
  const key = apiKeyInput.value.trim();

  if (key) {
    localStorage.setItem("jarvis_key", key);
    statusText.textContent = "API Key Saved";
  } else {
    localStorage.removeItem("jarvis_key");
  }
});

// ===============================
// 3. VOICE RECOGNITION SETUP
// ===============================

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    startBtn.textContent = "Listening...";
    statusText.textContent = "Listening for your command...";
  };

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript;

    statusText.textContent = "You said: " + command;

    processCommand(command);
  };

  recognition.onerror = (event) => {
    isListening = false;
    startBtn.textContent = "Start Listening";

    statusText.textContent =
      "Voice Error: " + event.error;

    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = () => {
    isListening = false;
    startBtn.textContent = "Start Listening";
  };

} else {
  statusText.textContent =
    "Voice recognition not supported. Use Chrome.";
}

// ===============================
// 4. START / STOP LISTENING
// ===============================

startBtn.addEventListener("click", () => {

  if (!recognition) {
    statusText.textContent =
      "Please use a supported browser like Chrome.";
    return;
  }

  if (isProcessing) {
    statusText.textContent =
      "J.A.R.V.I.S is processing your command.";
    return;
  }

  if (isListening) {
    recognition.stop();
    return;
  }

  try {
    recognition.start();
  } catch (error) {
    statusText.textContent =
      "Voice Error: " + error.message;
  }
});

// ===============================
// 5. PROCESS USER COMMAND
// ===============================

async function processCommand(command) {

  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    statusText.textContent =
      "Please enter your Gemini API Key.";

    apiKeyInput.focus();
    return;
  }

  if (!command.trim()) {
    statusText.textContent = "Please say something.";
    return;
  }

  isProcessing = true;
  startBtn.disabled = true;

  statusText.textContent = "J.A.R.V.I.S is thinking...";
  responseText.textContent = "";

  try {

    const reply = await askGemini(command, apiKey);

    responseText.textContent = reply;
    statusText.textContent = "J.A.R.V.I.S is ready.";

    speak(reply);

  } catch (error) {

    console.error(error);

    statusText.textContent = "Error: " + error.message;

    responseText.textContent =
      "Sorry, I could not process your request.";

  } finally {

    isProcessing = false;
    startBtn.disabled = false;

  }
}

// ===============================
// 6. GEMINI AI BRAIN
// ===============================

async function askGemini(command, apiKey) {

  const response = await fetch(API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },

    body: JSON.stringify({

      systemInstruction: {
        parts: [{
          text:
            "You are J.A.R.V.I.S, a helpful AI assistant. " +
            "Reply naturally and clearly. " +
            "If the user speaks Telugu, reply in Telugu. " +
            "Do not claim to have performed actions that you cannot perform."
        }]
      },

      contents: [{
        role: "user",
        parts: [{
          text: command
        }]
      }],

      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }

    })

  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data.error?.message || "Gemini API request failed.";

    throw new Error(message);
  }

  const reply =
    data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

  if (!reply) {
    throw new Error("Gemini returned an empty response.");
  }

  return reply;
}

// ===============================
// 7. TEXT TO SPEECH
// ===============================

function speak(text) {

  if (!("speechSynthesis" in window)) {
    statusText.textContent =
      "Text-to-speech is not supported.";
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "en-IN";
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onstart = () => {
    statusText.textContent = "J.A.R.V.I.S is speaking...";
  };

  utterance.onend = () => {
    statusText.textContent = "J.A.R.V.I.S is ready.";
  };

  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event.error);
    statusText.textContent =
      "Reply received, but voice playback failed.";
  };

  window.speechSynthesis.speak(utterance);
}

// ===============================
// 8. TEXT COMMAND SUPPORT
// ===============================

window.executeCommand = function (command) {
  processCommand(command);
};

console.log("J.A.R.V.I.S script loaded successfully.");
