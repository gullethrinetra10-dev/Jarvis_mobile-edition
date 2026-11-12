
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("send");

// Gemini API Configuration
const API_KEY = "YOUR_GEMINI_API_KEY";
const MODEL = "gemini-2.5-flash";

// Add message to chat
function addMessage(sender, message) {
    const div = document.createElement("div");

    div.textContent = sender + ": " + message;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// Send button
sendBtn.addEventListener("click", sendMessage);

// Enter key
input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Main function
async function sendMessage() {

    const message = input.value.trim();

    if (message === "") {
        return;
    }

    if (
        !API_KEY ||
        API_KEY === "YOUR_GEMINI_API_KEY"
    ) {
        addMessage("JARVIS", "API key not configured. Please add your Gemini API key.");
        return;
    }

    addMessage("YOU", message);

    input.value = "";

    sendBtn.disabled = true;

    const loading = document.createElement("div");
    loading.textContent = "JARVIS: Connecting...";
    chat.appendChild(loading);

    chat.scrollTop = chat.scrollHeight;

    try {

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            MODEL +
            ":generateContent?key=" +
            encodeURIComponent(API_KEY),
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: message
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        loading.remove();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "Gemini API request failed"
            );
        }

        const reply =
            data.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || "")
                .join("")
            || "No response received from Gemini.";

        addMessage("JARVIS", reply);

    } catch (error) {

        loading.remove();

        addMessage("ERROR", error.message);

        console.error("JARVIS Error:", error);

    } finally {

        sendBtn.disabled = false;

        input.focus();
    }
}
