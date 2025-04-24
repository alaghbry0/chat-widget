// src/components/suggestions.js

/**
 * مكون اقتراحات الرسائل السريعة
 */
class ChatSuggestions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._suggestions = [];
  }

  connectedCallback() {
    this._render();
  }

  set suggestions(value) {
    if (Array.isArray(value)) {
      this._suggestions = value;
      if (this.shadowRoot) {
        this._render();
      }
    }
  }

  get suggestions() {
    return this._suggestions;
  }

  _render() {
    // إعداد CSS
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        margin: 16px 0;
      }

      .suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }

      .suggestion {
        background-color: var(--message-bg-bot, #F1F1F1);
        color: var(--text-color, #333);
        border: 1px solid var(--border-color, #E6E6E6);
        border-radius: 16px;
        padding: 8px 16px;
        font-size: 13px;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.2s;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }

      .suggestion:hover {
        background-color: var(--primary-color, #007BFF);
        color: white;
        transform: translateY(-2px);
      }

      .title {
        font-size: 14px;
        color: var(--text-secondary, #666);
        margin-bottom: 8px;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .suggestion {
        animation: fadeIn 0.3s ease-in-out;
        animation-fill-mode: both;
      }

      .suggestion:nth-child(1) { animation-delay: 0.1s; }
      .suggestion:nth-child(2) { animation-delay: 0.2s; }
      .suggestion:nth-child(3) { animation-delay: 0.3s; }
      .suggestion:nth-child(4) { animation-delay: 0.4s; }
    `;

    // إنشاء هيكل المكون
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="title">يمكنك أن تسأل:</div>
      <div class="suggestions">
        ${this._suggestions.map(suggestion => `
          <button class="suggestion">${suggestion}</button>
        `).join('')}
      </div>
    `;

    // إفراغ الظل وإضافة المحتوى الجديد
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);

    // إضافة مستمعي الأحداث للاقتراحات
    const suggestionButtons = this.shadowRoot.querySelectorAll('.suggestion');
    suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const suggestion = button.textContent;
        // إرسال حدث للأعلى عند النقر على اقتراح
        this.dispatchEvent(new CustomEvent('suggestion-clicked', {
          detail: { suggestion },
          bubbles: true,
          composed: true
        }));
      });
    });
  }
}

// تسجيل المكون
customElements.define('chat-suggestions', ChatSuggestions);