// src/components/avatar.js

/**
 * مكون الصورة الرمزية
 */
class ChatAvatar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    const src = this.getAttribute('src') || '';
    const fallback = this.getAttribute('fallback') || 'B';
    const bgColor = this.getAttribute('bg-color') || '#007BFF';
    const size = this.getAttribute('size') || '32px';

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-block;
      }

      .avatar {
        width: ${size};
        height: ${size};
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: white;
        background: linear-gradient(135deg, ${bgColor}, ${this._darkenColor(bgColor, 20)});
        font-size: calc(${size} * 0.4);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s ease-out;
      }

      .avatar:hover {
        transform: scale(1.05);
      }

      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.2s;
      }

      @keyframes avatarFadeIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }

      .avatar {
        animation: avatarFadeIn 0.3s ease-out forwards;
      }
    `;

    const template = document.createElement('template');

    if (src) {
      template.innerHTML = `
        <div class="avatar">
          <img src="${src}" alt="Avatar" onerror="this.style.display='none'; this.parentNode.textContent='${fallback}'" />
        </div>
      `;
    } else {
      template.innerHTML = `
        <div class="avatar">${fallback}</div>
      `;
    }

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  _darkenColor(color, percent) {
    // Simple function to darken a hex color
    const num = parseInt(color.replace('#', ''), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 0 ? 0 : R) * 0x10000 + (G < 0 ? 0 : G) * 0x100 + (B < 0 ? 0 : B)).toString(16).slice(1);
  }

  static get observedAttributes() {
    return ['src', 'fallback', 'bg-color', 'size'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
    }
  }
}

customElements.define('chat-avatar', ChatAvatar);