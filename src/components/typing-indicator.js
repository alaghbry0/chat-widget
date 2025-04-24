// src/components/typing-indicator.js

/**
 * مكون مؤشر الكتابة
 */
class TypingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const avatar = this.getAttribute('avatar') || '';

    // إعداد CSS
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
      }

      .typing-indicator {
        display: flex;
        align-items: flex-end;
        margin-bottom: 10px;
        animation: fadeIn 0.3s ease-in-out;
      }

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-right: 8px;
        background-color: var(--primary-color, #007BFF);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
      }

      .typing-bubble {
        background-color: var(--message-bg-bot, #F1F1F1);
        border-radius: 18px;
        padding: 12px 16px;
        border-bottom-left-radius: 4px;
        display: flex;
        align-items: center;
      }

      .dot {
        width: 8px;
        height: 8px;
        background-color: var(--text-secondary, #666);
        border-radius: 50%;
        margin: 0 2px;
        opacity: 0.6;
      }

      .dot:nth-child(1) {
        animation: bounce 1.2s infinite 0s;
      }

      .dot:nth-child(2) {
        animation: bounce 1.2s infinite 0.2s;
      }

      .dot:nth-child(3) {
        animation: bounce 1.2s infinite 0.4s;
      }

      @keyframes bounce {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-4px);
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;

    // إنشاء هيكل المكون
    const template = document.createElement('template');
    let avatarHTML = '';

    if (avatar) {
      avatarHTML = `<img class="avatar" src="${avatar}" alt="Bot Avatar">`;
    } else {
      avatarHTML = `<div class="avatar">B</div>`;
    }

    template.innerHTML = `
      <div class="typing-indicator">
        ${avatarHTML}
        <div class="typing-bubble">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    `;

    // إضافة الأنماط والقالب للظل
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

// تسجيل المكون
customElements.define('typing-indicator', TypingIndicator);