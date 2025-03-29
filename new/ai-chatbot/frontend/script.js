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

  // 🌙 Apply saved theme preference
  if (localStorage.getItem("theme") === "dark") {
      enableDarkMode();
  } else {
      enableLightMode();
  }

  // Toggle theme button
  themeToggle.addEventListener("click", () => {
      if (body.classList.contains("dark-mode")) {
          enableLightMode();
      } else {
          enableDarkMode();
      }
  });

  function enableDarkMode() {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "🌙";

      document.documentElement.style.setProperty("--bg-color", "#111827"); 
      document.documentElement.style.setProperty("--chat-bg", "#1F2937");
      document.documentElement.style.setProperty("--text-color", "#E5E7EB");
      document.documentElement.style.setProperty("--border-color", "#374151");
  }

  function enableLightMode() {
      body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌞";

      document.documentElement.style.setProperty("--bg-color", "#F3F4F6"); 
      document.documentElement.style.setProperty("--chat-bg", "#FFFFFF");
      document.documentElement.style.setProperty("--text-color", "#111827");
      document.documentElement.style.setProperty("--border-color", "#D1D5DB");
  }

  // 💬 Send Message Function
  window.sendMessage = async () => {
      const text = userInput.value.trim();
      if (!text) return;

      // Display user message
      chat.innerHTML += `<div class="text-right font-semibold my-1" style="color: var(--text-color)">${text}</div>`;
      userInput.value = "";

      // Show typing indicator
      const typingIndicator = document.createElement("div");
      typingIndicator.className = "text-left font-semibold my-1";
      typingIndicator.textContent = "AI is typing...";
      typingIndicator.style.color = "#9CA3AF";
      chat.appendChild(typingIndicator);
      chat.scrollTop = chat.scrollHeight;

      try {
          const response = await fetch("http://localhost:5000/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, userId }), // Ensure userId is sent
          });

          const data = await response.json();

          typingIndicator.remove();
          chat.innerHTML += `<div class="text-left font-semibold my-1" style="color: #00A8E1;">${data.reply || "No response"}</div>`;
      } catch (error) {
          typingIndicator.remove();
          chat.innerHTML += `<div style="color: red; my-1">Error: Could not connect to AI.</div>`;
      }

      chat.scrollTop = chat.scrollHeight;
  };
});
