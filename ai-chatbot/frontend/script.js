document.addEventListener("DOMContentLoaded", () => {
    const chat = document.getElementById("chat");
    const userInput = document.getElementById("userInput");
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    // Generate a unique userId for tracking user messages
    let userId = localStorage.getItem("userId");
    if (!userId) {
        userId = "user-" + Date.now();
        localStorage.setItem("userId", userId);
    }

    // Apply saved theme preference
    if (localStorage.getItem("theme") === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }

    // Toggle theme button
    themeToggle.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
    });

    // Send Message Function
    window.sendMessage = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        // Display user message
        const userMsg = document.createElement("div");
        userMsg.className = "message-bubble user-message";
        userMsg.textContent = text;
        chat.appendChild(userMsg);
        userInput.value = "";

        // Show typing indicator
        const typingIndicator = document.createElement("div");
        typingIndicator.className = "message-bubble bot-message";
        typingIndicator.innerHTML = `
            <div class="flex items-center">
                <div class="typing-indicator flex space-x-1">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="ml-2 text-sm">AI is typing...</span>
            </div>
        `;
        chat.appendChild(typingIndicator);
        chat.scrollTop = chat.scrollHeight;

        try {
            const response = await fetch("http://localhost:5000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, userId }),
            });

            const data = await response.json();
            typingIndicator.remove();
            
            const botMsg = document.createElement("div");
            botMsg.className = "message-bubble bot-message";
            botMsg.textContent = data.reply || "No response";
            chat.appendChild(botMsg);
            
        } catch (error) {
            typingIndicator.remove();
            const errorMsg = document.createElement("div");
            errorMsg.className = "message-bubble bot-message text-red-600 dark:text-red-400";
            errorMsg.textContent = "Error: Could not connect to AI";
            chat.appendChild(errorMsg);
        }

        chat.scrollTop = chat.scrollHeight;
    };

    // Allow sending message with Enter key
    userInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});