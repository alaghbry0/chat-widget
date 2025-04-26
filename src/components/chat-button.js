/**
 * مكون زر فتح نافذة الدردشة
 */
class ChatButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;

    // إعداد الأنماط
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
      }

      .chat-bubble {
        position: fixed;
        bottom: 20px;
        right: 26px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-color, #007BFF);
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.3s, background-color 0.3s;
        z-index: 9998;
      }

      :host([position="bottom-left"]) .chat-bubble {
        left: 24px;
        right: auto;
      }

      .chat-bubble:hover {
        transform: scale(1.05);
        background-color: var(--primary-hover, #0069d9);
      }

      .chat-bubble svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: white;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: transform 0.3s ease;
      }

      .chat-bubble.open svg {
        transform: rotate(180deg);
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
        }
      }

      .chat-bubble.pulse {
        animation: pulse 2s infinite;
      }
    `;

    // إنشاء هيكل المكون
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="chat-bubble pulse">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M18 15l-6-6-6 6"></path>
        </svg>
      </div>
    `;

    // إضافة الأنماط والقالب للظل
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // تخزين مرجع لعنصر الزر
    this.bubbleElement = this.shadowRoot.querySelector('.chat-bubble');
  }

  connectedCallback() {
    this.bubbleElement.addEventListener('click', () => {
      this.bubbleElement.classList.remove('pulse');
      // تبديل حالة الفتح/الإغلاق
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.bubbleElement.classList.add('open');
      } else {
        this.bubbleElement.classList.remove('open');
      }
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'position' && oldValue !== newValue) {
      if (newValue === 'bottom-left') {
        this.bubbleElement.style.left = '24px';
        this.bubbleElement.style.right = 'auto';
      } else {
        this.bubbleElement.style.right = '24px';
        this.bubbleElement.style.left = 'auto';
      }
    }
  }

  static get observedAttributes() {
    return ['position'];
  }
}

customElements.define('chat-button', ChatButton);