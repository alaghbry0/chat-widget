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
        background: linear-gradient(to right, #F8F9FA, #FFFFFF);
        color: var(--text-color, #333);
        border: 1px solid var(--border-color, #E6E6E6);
        border-radius: 16px;
        padding: 8px 16px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }

      .suggestion:hover {
        background: linear-gradient(to right, var(--primary-color, #007BFF), var(--primary-hover, #0056b3));
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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

      @media (max-width: 576px) {
        .suggestions {
          gap: 6px;
        }

        .suggestion {
          padding: 6px 12px;
          font-size: 12px;
        }
      }
    `;

    const container = document.createElement('div');
    container.innerHTML = `
      <div class="title">يمكنك أن تسأل:</div>
      <div class="suggestions">
        ${this._suggestions.map(suggestion => `
          <button class="suggestion" aria-label="${suggestion}">${suggestion}</button>
        `).join('')}
      </div>
    `;

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);

    const suggestionButtons = this.shadowRoot.querySelectorAll('.suggestion');
    suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const suggestion = button.textContent;
        this.dispatchEvent(new CustomEvent('suggestion-clicked', {
          detail: { suggestion },
          bubbles: true,
          composed: true
        }));
      });
    });
  }
}

customElements.define('chat-suggestions', ChatSuggestions);