import { state } from '../services/state.js';

export function renderChatbot() {
  const { chatOpen, chatLoading, chatMessages, chatInput } = state;
  return `
  <div class="chatbot-container">
    <button id="chatToggle" class="chatbot-toggle">💬 Chat</button>
    ${chatOpen ? `
    <div class="chatbot-window">
      <div class="chatbot-header">AI Assistant</div>
      <div class="chatbot-messages">
        ${chatLoading ? '<p class="chatbot-typing">🤖 Typing...</p>' : ''}
        ${chatMessages.map(msg => {
          if (msg.sender === 'user') {
            return `
            <div class="message message-user">
              <p>${msg.text}</p>
            </div>
            `;
          } else if (msg.type === 'text') {
            return `
            <div class="message message-bot">
              <p>${msg.message}</p>
            </div>
            `;
          } else if (msg.type === 'products') {
            return `
            <div class="message message-bot">
              ${msg.message ? `<p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">${msg.message}</p>` : ''}
              ${msg.data && msg.data.length === 0 ? '<p style="font-size: 0.875rem; color: #6b7280;">No products found 😢</p>' : ''}
              ${msg.data && msg.data.length > 0 ? `
              <div class="message-products">
                ${msg.data.map(p => `
                <div class="product-recommendation" data-id="${p.id}">
                  <img src="${p.image}" alt="${p.name}" />
                  <p>${p.name}</p>
                  <p class="price">₹${p.price}</p>
                </div>
                `).join('')}
              </div>
              ` : ''}
            </div>
            `;
          }
          return '';
        }).join('')}
      </div>
      <div class="chatbot-input">
        <input type="text" id="chatInput" value="${chatInput}" placeholder="Ask about products..." />
        <button id="chatSend">Send</button>
      </div>
    </div>
    ` : ''}
  </div>
`;
}
