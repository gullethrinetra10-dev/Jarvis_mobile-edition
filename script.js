const API_KEY_STORAGE_NAME = "jarvis_openai_api_key";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const statusText = document.getElementById("statusText");
const assistantFace = document.getElementById("assistantFace");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

let chatHistory = [];

function getSavedApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_NAME);
}

function saveApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE_NAME, key);
}

function openSettings() {
  apiKeyInput.value = getSavedApiKey() || "";
  settingsModal.classList.add("active");
}

function closeSettings() {
  settingsModal.classList.remove("active");
}

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  message.appendChild(paragraph);
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateStatus() {
  const apiKey = getSavedApiKey();

  if (apiKey) {
    statusText.textContent = "JARVIS activated. Ask me anything.";
  } else {
    statusText.textContent = "Enter your OpenAI API key to activate JARVIS.";
  }
}

async function askOpenAI(userMessage) {
  const apiKey = getSavedApiKey();

  if (!apiKey) {
    openSettings();
    return "Please add your OpenAI API key in Settings.";
  }

  chatHistory.push({
    role: "user",
    content: userMessage
  });

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are JARVIS, a helpful, friendly AI assistant. Reply clearly and concisely."
        },
        ...chatHistory
      ],
      temperature: 0.7
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data?.error?.message || "API request failed. Check your API key.";
    throw new Error(errorMessage);
  }

  const reply = data.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error("JARVIS could not generate a response.");
  }

  chatHistory.push({
    role: "assistant",
    content: reply
  });

  return reply;
}

chatForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const message = userInput.value.trim();

  if (!message) return;

  if (message.toLowerCase() === "clear chat") {
    chatBox.innerHTML = "";
    chatHistory = [];
    addMessage("Chat cleared. How can I help you?", "assistant");
    userInput.value = "";
    return;
  }

  addMessage(message, "user");
  userInput.value = "";

  statusText.textContent = "JARVIS is thinking...";
  assistantFace.style.boxShadow = "0 0 50px rgba(0, 229, 255, 0.7)";

  try {
    const reply = await askOpenAI(message);
    addMessage(reply, "assistant");
  } catch (error) {
    addMessage(`Error: ${error.message}`, "assistant");
  } finally {
    statusText.textContent = getSavedApiKey()
      ? "JARVIS activated. Ask me anything."
      : "Enter your OpenAI API key to activate JARVIS.";

    assistantFace.style.boxShadow = "0 0 35px rgba(0, 229, 255, 0.35)";
  }
});

settingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);

saveKeyBtn.addEventListener("click", function () {
  const key = apiKeyInput.value.trim();

  if (!key) {
    alert("Please enter your OpenAI API key.");
    return;
  }

  saveApiKey(key);
  updateStatus();
  closeSettings();
  addMessage("API key saved in this browser. JARVIS is ready.", "assistant");
});

document.querySelectorAll(".action-btn").forEach(function (button) {
  button.addEventListener("click", function () {
    userInput.value = button.dataset.command;
    chatForm.dispatchEvent(new Event("submit"));
  });
});

settingsModal.addEventListener("click", function (event) {
  if (event.target === settingsModal) {
    closeSettings();
  }
});

updateStatus();
