class ChatButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;

    const style = document.createElement('style');
    style.textContent = `
      :host {
      contain: strict;
      isolation: isolate;
      position: relative;
      z-index: 0;
        display: block;
        --primary-color: linear-gradient(135deg, #63a3f7 0%, #2F80ED 100%);
--hover-effect: brightness(1.09) saturate(1.2);

      }

      .chat-bubble {
        position: fixed;
        bottom: 25px;
        right: 25px;
        width: 70px;
        height: 70px;
        background: var(--primary-color);
        border-radius: 50%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 8900 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: none;
        overflow: hidden;
      }

      .chat-bubble::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .chat-bubble:hover {
        transform: scale(1.1);
        filter: var(--hover-effect);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      }

      .chat-bubble:hover::after {
        opacity: 1;
      }

      :host([position="bottom-left"]) .chat-bubble {
        left: 25px;
        right: auto;
      }

      .chat-bubble__icon {
        width: 30px;
        height: 30px;
        margin-bottom: 4px;
        z-index: 1;
      }

      .chat-bubble__text {
        color: white;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        z-index: 1;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      @keyframes floating {
        0% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0); }
      }

      .chat-bubble {
        animation: floating 3s ease-in-out infinite;
      }

      @media (max-width: 480px) {
        .chat-bubble {
          width: 63px;
          height: 63px;
          bottom: var(--mobile-bottom, 60px);
          right: var(--mobile-right, 20px);
          left: var(--mobile-left, auto);
        }
      }
    `;

    const template = document.createElement('template');
    template.innerHTML = `
      <div class="chat-bubble">
        <svg class="chat-bubble__icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span class="chat-bubble__text">Help</span>
      </div>
    `;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.bubbleElement = this.shadowRoot.querySelector('.chat-bubble');
  }

  connectedCallback() {
    this.bubbleElement.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      // يمكنك إضافة منطق إضافي للتفاعل مع النقر هنا
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'position' && oldValue !== newValue) {
      const positionMap = {
        'bottom-left': { left: '25px', right: 'auto' },
        'bottom-right': { right: '25px', left: 'auto' }
      };
      Object.assign(this.bubbleElement.style, positionMap[newValue] || positionMap['bottom-right']);
    }

    if (name === 'mobile-position') {
      const mobilePositions = newValue.split(' ');
      this.style.setProperty('--mobile-bottom', mobilePositions[0]);
      this.style.setProperty('--mobile-right', mobilePositions[1]);
      this.style.setProperty('--mobile-left', mobilePositions[2]);
    }
  }

  static get observedAttributes() {
    return ['position', 'mobile-position'];
  }
}

customElements.define('chat-button', ChatButton);