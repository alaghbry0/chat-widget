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
    const src = this.getAttribute('src') || '';
    const fallback = this.getAttribute('fallback') || 'B';
    const bgColor = this.getAttribute('bg-color') || '#007BFF';
    const size = this.getAttribute('size') || '40px';

    // إعداد CSS
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
        background-color: ${bgColor};
        font-size: calc(${size} * 0.4);
      }

      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `;

    // إنشاء هيكل المكون
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

    // إضافة الأنماط والقالب للظل
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ['src', 'fallback', 'bg-color', 'size'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.shadowRoot) {
      const avatar = this.shadowRoot.querySelector('.avatar');

      if (!avatar) return;

      if (name === 'src') {
        let img = avatar.querySelector('img');
        if (newValue) {
          if (!img) {
            img = document.createElement('img');
            img.setAttribute('alt', 'Avatar');
            avatar.textContent = '';
            avatar.appendChild(img);
          }
          img.setAttribute('src', newValue);
        } else if (img) {
          avatar.textContent = this.getAttribute('fallback') || 'B';
          img.remove();
        }
      } else if (name === 'fallback') {
        const img = avatar.querySelector('img');
        if (!img) {
          avatar.textContent = newValue || 'B';
        }
      } else if (name === 'bg-color') {
        avatar.style.backgroundColor = newValue;
      } else if (name === 'size') {
        avatar.style.width = newValue;
        avatar.style.height = newValue;
        avatar.style.fontSize = `calc(${newValue} * 0.4)`;
      }
    }
  }
}

// تسجيل المكون
customElements.define('chat-avatar', ChatAvatar);