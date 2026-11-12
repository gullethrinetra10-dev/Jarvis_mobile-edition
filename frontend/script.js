
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("send");

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {
    const message = input.value.trim();

    if (!message) return;

    add("YOU: " + message, "user");

    input.value = "";
    sendBtn.disabled = true;

    const loading = add(
        "J.A.R.V.I.S: Connecting to AI...",
        "ai"
    );

    try {
        // Secure backend API endpoint
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Server connection failed"
            );
        }

        loading.innerText =
            "J.A.R.V.I.S: " + data.reply;

    } catch (error) {
        loading.innerText =
            "J.A.R.V.I.S: Error - " + error.message;

    } finally {
        sendBtn.disabled = false;
        input.focus();
    }
}

function add(text, who) {
    const div = document.createElement("div");

    div.className = "msg " + who;
    div.innerText = text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    return div;
}
