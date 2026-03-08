document.addEventListener('DOMContentLoaded', () => {
    const chatLauncher = document.getElementById('chat-launcher');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messageList = document.getElementById('message-list');
    const sendBtn = document.getElementById('send-btn');
    const quickBtns = document.querySelectorAll('.quick-btn');

    let messages = [
        {
            role: 'assistant',
            content: "Hey! 👋 I'm Aurums AI — your XAU/USD trading companion. Ask me about lot sizing, pip values, risk calculations, session times, or anything MT5-related."
        }
    ];

    // Toggle Chat
    chatLauncher.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        if (!chatContainer.classList.contains('hidden')) {
            chatInput.focus();
            chatLauncher.classList.remove('pulse');
        }
    });

    closeChat.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    // Handle Input
    chatInput.addEventListener('input', () => {
        sendBtn.disabled = !chatInput.value.trim();
    });

    // Handle Quick Actions
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            handleSend(query);
            // Hide quick actions after first use to clean up
            document.getElementById('quick-actions').style.display = 'none';
        });
    });

    // Handle Form Submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
            handleSend(text);
        }
    });

    async function handleSend(content) {
        // Add User Message
        addMessage('user', content);
        chatInput.value = '';
        sendBtn.disabled = true;

        const userMessage = { role: 'user', content };
        messages.push(userMessage);

        // Show Typing Indicator
        const typingId = showTypingIndicator();

        try {
            const response = await fetch('http://localhost:3005/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages,
                    context: {
                        trades: typeof mockTrades !== 'undefined' ? mockTrades : [],
                        stats: typeof dailyStats !== 'undefined' ? dailyStats : {}
                    }
                })
            });

            const data = await response.json();
            removeTypingIndicator(typingId);

            if (data.content) {
                addMessage('assistant', data.content);
                messages.push({ role: 'assistant', content: data.content });
            } else {
                throw new Error(data.error || 'No response from AI');
            }
        } catch (error) {
            console.error('Chat Error:', error);
            removeTypingIndicator(typingId);
            addMessage('assistant', "Sorry, I'm having trouble connecting. Please check if the local server is running.");
        }
    }

    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        if (role === 'assistant') {
            const label = document.createElement('div');
            label.className = 'message-label';
            label.innerHTML = `<img src="ai-bull.png" alt="bot"> Aurums AI`;
            messageDiv.appendChild(label);
        }

        const textDiv = document.createElement('div');
        textDiv.className = 'text';
        textDiv.textContent = content;
        messageDiv.appendChild(textDiv);

        messageList.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.id = 'typing-' + Date.now();
        typingDiv.innerHTML = `
            <div class="message-label"><img src="ai-bull.png" alt="bot"> Aurums AI</div>
            <div class="typing">
                <span></span><span></span><span></span>
            </div>
        `;
        messageList.appendChild(typingDiv);
        scrollToBottom();
        return typingDiv.id;
    }

    function removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        messageList.scrollTop = messageList.scrollHeight;
    }

    // Initial message
    addMessage('assistant', messages[0].content);
});
