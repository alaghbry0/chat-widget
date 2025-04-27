/**
 * مكون مؤشر الكتابة
 */
class TypingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const avatar = this.getAttribute('avatar') || 'https://alaghbry0.github.io/chat-widget/profile.png';
    const direction = document.dir || this.getAttribute('direction') || 'rtl';

    // إعداد CSS
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        animation: fadeIn 0.3s ease-in-out;
      }

      .typing-indicator {
        display: flex;
        align-items: flex-end;
        margin-bottom: 10px;
        max-width: 85%;
        align-self: flex-start;
      }

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-right: ${direction === 'rtl' ? '0' : '8px'};
        margin-left: ${direction === 'rtl' ? '8px' : '0'};
        background-color: var(--primary-color, #007BFF);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        flex-shrink: 0;
      }

      .typing-bubble {
        background: transparent;
        padding: 8px 12px;
        display: flex;
        align-items: center;
      }

      .dots-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 20px;
      }

      .dot {
        width: 6px;
        height: 6px;
        background-color: var(--text-secondary, #666);
        border-radius: 50%;
        margin: 0 2px;
        opacity: 0.7;
        transition: transform 0.2s ease-in-out;
        animation: bounce 1.2s infinite;
      }

      .dot:nth-child(1) {
        animation-delay: 0s;
      }

      .dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .dot:nth-child(3) {
        animation-delay: 0.4s;
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

    // إضافة التحسينات: استخدام avatar component إذا كان موجودًا
    const avatarHTML = avatar ?
      `<img class="avatar" src="${avatar}" alt="Bot" />` :
      `<div class="avatar">${this.getAttribute('avatar-text') || 'B'}</div>`;

    const template = document.createElement('div');
    template.className = 'typing-indicator';
    template.innerHTML = `
      ${avatarHTML}
      <div class="typing-bubble">
        <div class="dots-container">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    `;

    // إضافة الأنماط والقالب للظل
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(template);
  }

  // دالة لتحديث صورة الأفاتار
  updateAvatar(avatarSrc) {
    const avatarEl = this.shadowRoot.querySelector('.avatar');
    if (avatarEl && avatarSrc) {
      if (avatarEl.tagName === 'IMG') {
        avatarEl.src = avatarSrc;
      } else {
        // استبدال العنصر تمامًا
        const parent = avatarEl.parentNode;
        const img = document.createElement('img');
        img.className = 'avatar';
        img.src = avatarSrc;
        img.alt = 'Bot';
        parent.replaceChild(img, avatarEl);
      }
    }
  }
}

// تسجيل المكون
customElements.define('typing-indicator', TypingIndicator);