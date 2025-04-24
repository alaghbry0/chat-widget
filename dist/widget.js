(function () {
  'use strict';

  /**
   * مكون زر فتح نافذة الدردشة
   */
  class ChatButton extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      // إعداد الأنماط
      const style = document.createElement('style');
      style.textContent = `
      :host {
        display: block;
      }

      .chat-bubble {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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
      // إضافة مستمع الحدث عند النقر
      this.bubbleElement.addEventListener('click', () => {
        // إرسال حدث النقر للأعلى
        this.dispatchEvent(new CustomEvent('click'));

        // إزالة تأثير النبض بعد النقر الأول
        this.bubbleElement.classList.remove('pulse');
      });
    }

    // تعيين موضع الزر بناءً على سمة الموضع
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

  // تسجيل المكون
  customElements.define('chat-button', ChatButton);

  // src/components/chat-message.js

  /**
   * مكون عرض رسائل الدردشة
   */
  class ChatMessage extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      // الحصول على سمات المكون
      const sender = this.getAttribute('sender') || 'bot';
      const avatar = this.getAttribute('avatar') || '';
      const messageId = this.getAttribute('message-id') || '';
      const content = this.textContent || '';

      // إعداد CSS
      const style = document.createElement('style');
      style.textContent = `
      :host {
        display: block;
        width: 100%;
      }

      .message {
        display: flex;
        flex-direction: column;
        max-width: 85%;
        animation: fadeIn 0.3s ease-in-out;
      }

      .message-user {
        align-self: flex-end;
        align-items: flex-end;
      }

      .message-bot {
        align-self: flex-start;
        align-items: flex-start;
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

      .message-header {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
      }

      .message-content {
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
        position: relative;
      }

      .message-user .message-content {
        background-color: var(--message-bg-user, #007BFF);
        color: var(--message-color-user, #fff);
        border-bottom-right-radius: 4px;
      }

      .message-bot .message-content {
        background-color: var(--message-bg-bot, #F1F1F1);
        color: var(--message-color-bot, #333);
        border-bottom-left-radius: 4px;
      }

      .message-time {
        font-size: 11px;
        color: var(--text-secondary, #666);
        margin-top: 4px;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* تنسيق الروابط في الرسائل */
      .message-content a {
        color: inherit;
        text-decoration: underline;
      }

      .message-content a:hover {
        opacity: 0.8;
      }

      /* تنسيق الأكواد البرمجية في الرسائل */
      .message-content pre {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 8px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 8px 0;
      }

      .message-content code {
        font-family: monospace;
        font-size: 13px;
      }

      /* تنسيق القوائم */
      .message-content ul, .message-content ol {
        padding-left: 24px;
        margin: 8px 0;
      }
    `;

      // معالجة محتوى الرسالة
      const processedContent = this._processMessageContent(content);

      // إنشاء هيكل المكون
      const messageElement = document.createElement('div');
      messageElement.className = `message message-${sender}`;
      messageElement.setAttribute('data-message-id', messageId);

      let avatarHTML = '';
      if (sender === 'bot') {
        if (avatar) {
          avatarHTML = `<img class="avatar" src="${avatar}" alt="Bot Avatar">`;
        } else {
          avatarHTML = `<div class="avatar">B</div>`;
        }
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      messageElement.innerHTML = `
      <div class="message-header">
        ${sender === 'bot' ? avatarHTML : ''}
      </div>
      <div class="message-content">${processedContent}</div>
      <div class="message-time">${timeStr}</div>
    `;

      // إضافة الأنماط والمحتوى للظل
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(messageElement);

      // تفعيل الروابط وأزرار الإجراءات
      this._activateLinks();
    }

    /**
     * معالجة محتوى الرسالة لإضافة الروابط والتنسيق
     */
    _processMessageContent(content) {
      // تحويل الروابط العادية إلى روابط قابلة للنقر
      let processed = content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      // تحويل أكواد الماركداون البسيطة (مثل ``code``)
      processed = processed.replace(
        /`([^`]+)`/g,
        '<code>$1</code>'
      );

      // معالجة أكواد الماركداون متعددة الأسطر
      processed = processed.replace(
        /```([^`]+)```/g,
        '<pre><code>$1</code></pre>'
      );

      // تحويل زر الإجراء (مثال: [زر الإجراء](action:do_something))
      processed = processed.replace(
        /\[([^\]]+)\]\(action:([^)]+)\)/g,
        '<button class="action-button" data-action="$2">$1</button>'
      );

      return processed;
    }

    /**
     * تفعيل الروابط وأزرار الإجراءات في الرسالة
     */
    _activateLinks() {
      // الحصول على جميع أزرار الإجراءات
      const actionButtons = this.shadowRoot.querySelectorAll('.action-button');
      actionButtons.forEach(button => {
        button.addEventListener('click', () => {
          const action = button.getAttribute('data-action');
          // إرسال حدث للأعلى عند النقر على زر الإجراء
          this.dispatchEvent(new CustomEvent('action-clicked', {
            detail: { action },
            bubbles: true,
            composed: true
          }));
        });
      });
    }
  }

  // تسجيل المكون
  customElements.define('chat-message', ChatMessage);

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

  /**
   * خدمة الاتصال بالخادم للدردشة باستخدام SSE
   */
  class ChatService {
    /**
     * إرسال رسالة إلى الخادم والحصول على دفق SSE للردود
     * @param {string} url - عنوان URL للخادم
     * @param {Object} data - بيانات الرسالة للإرسال
     * @returns {EventSource} - موجّه أحداث SSE
     */
    sendMessage(url, data) {
      return new Promise((resolve, reject) => {
        // التحقق من دعم المتصفح لـ EventSource
        if (!window.EventSource) {
          reject(new Error('المتصفح الحالي لا يدعم EventSource. يرجى تحديث المتصفح.'));
          return;
        }

        // إنشاء عنوان URL للاتصال مع تضمين المعاملات
        const queryParams = new URLSearchParams();
        for (const key in data) {
          queryParams.append(key, data[key]);
        }

        const fullUrl = `${url}?${queryParams.toString()}`;

        try {
          // إنشاء اتصال SSE
          const eventSource = new EventSource(fullUrl);

          // التحقق من نجاح الاتصال
          eventSource.onopen = () => {
            resolve(eventSource);
          };

          // معالجة أخطاء الاتصال
          eventSource.onerror = (error) => {
            eventSource.close();
            reject(error);
          };
        } catch (error) {
          reject(error);
        }
      });
    }

    /**
     * إرسال رسالة باستخدام طريقة POST (كبديل لـ SSE)
     * عندما لا يتوفر دعم SSE أو عند الحاجة لارسال بيانات POST
     * @param {string} url
     * @param {Object} data
     */
    async postMessage(url, data) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        return this._processStream(reader, decoder);
      } catch (error) {
        console.error('Error in postMessage:', error);
        throw error;
      }
    }

    /**
     * معالجة الدفق
     * @param {ReadableStreamDefaultReader} reader
     * @param {TextDecoder} decoder
     */
    async _processStream(reader, decoder) {
      let buffer = '';

      const processEvents = async () => {
        const { value, done } = await reader.read();
        if (done) return null;

        buffer += decoder.decode(value, { stream: true });

        // معالجة الأحداث
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        return events.map(event => {
          const lines = event.split('\n');
          const parsedEvent = {};

          lines.forEach(line => {
            if (line.startsWith('event: ')) {
              parsedEvent.type = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                parsedEvent.data = JSON.parse(line.slice(6).trim());
              } catch (e) {
                parsedEvent.data = line.slice(6).trim();
              }
            }
          });

          return parsedEvent;
        });
      };

      return {
        async next() {
          return await processEvents();
        },
        close() {
          reader.cancel();
        }
      };
    }
  }

  // استيراد الأنماط
  const styles = `
  :host {
    --primary-color: #007BFF;
    --primary-hover: #0069d9;
    --bg-color: #fff;
    --header-bg: #E6F0FA;
    --text-color: #333;
    --text-secondary: #666;
    --message-bg-user: var(--primary-color);
    --message-color-user: #fff;
    --message-bg-bot: #F8F9FA;
    --message-color-bot: #666;
    --border-color: #E6E6E6;
    --footer-bg: rgba(249, 250, 251, 0.8);
    --bubble-size: 56px;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    position: fixed;
    z-index: 9999;
    box-sizing: border-box;
  }

  :host([theme="dark"]) {
    --primary-color: #375FFF;
    --primary-hover: #2D4ECC;
    --bg-color: #1E1E1E;
    --header-bg: #2D2D2D;
    --text-color: #fff;
    --text-secondary: #B0B0B0;
    --message-bg-user: var(--primary-color);
    --message-color-user: #fff;
    --message-bg-bot: #2D2D2D;
    --message-color-bot: #E0E0E0;
    --border-color: #3D3D3D;
    --footer-bg: rgba(30, 30, 30, 0.85);
  }

  :host([position="bottom-right"]) .chat-container {
    bottom: 24px;
    right: 24px;
  }

  :host([position="bottom-left"]) .chat-container {
    bottom: 24px;
    left: 24px;
  }

  :host([direction="rtl"]) {
    direction: rtl;
    text-align: right;
  }

  .chat-container {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 350px;
    height: calc(95vh - 32px);
    max-height: 600px;
    background-color: transparent;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: transform 0.3s ease, opacity 0.3s ease;
    transform: translateY(20px);
    opacity: 0;
    pointer-events: none;
  }

  .chat-container.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  .chat-header {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: var(--header-bg);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .header-info {
    margin-left: 12px;
    margin-right: 12px;
  }

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
  }

  .header-subtitle {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0;
  }

  .messages-container {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background-color: var(--bg-color);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .messages-container::-webkit-scrollbar {
    width: 6px;
  }

  .messages-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .messages-container::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .chat-footer {
    padding: 16px;
    background-color: var(--footer-bg);
    border-top: 1px solid var(--border-color);
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    backdrop-filter: blur(10px);
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .chat-input {
    flex: 1;
    padding: 10px 16px;
    font-size: 14px;
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 9999px;
    outline: none;
  }

  .chat-input::placeholder {
    color: var(--text-secondary);
  }

  .send-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .send-button:hover {
    background-color: var(--primary-hover);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .send-button svg {
    width: 18px;
    height: 18px;
  }

  .footer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    padding: 4px 8px;
  }

  .footer-button:hover {
    color: var(--primary-color);
  }

  .powered-by {
    font-size: 12px;
    color: var(--text-secondary);
  }
`;

  class ChatWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.isOpen = false;
      this.messages = [];
      this.isTyping = false;
      this.sessionId = this._generateSessionId();

      // استدعاء التهيئة
      this._initialize();
    }

    static get observedAttributes() {
      return [
        'project-id', 'theme', 'position', 'welcome-message',
        'api-url', 'direction', 'avatar', 'title', 'subtitle', 'powered-by'
      ];
    }

    _initialize() {
      // إنشاء خدمة الدردشة
      this.chatService = new ChatService();

      // التهيئة الأساسية للمكون
      this._render();
      this._setupEventListeners();

      // إضافة رسالة الترحيب
      setTimeout(() => {
        this._addMessage({
          content: this.getAttribute('welcome-message') || 'مرحبًا بك! كيف يمكنني مساعدتك اليوم؟',
          sender: 'bot'
        });
      }, 300);
    }

    _render() {
      const styleEl = document.createElement('style');
      styleEl.textContent = styles;

      const template = document.createElement('template');
      template.innerHTML = `
      <div class="chat-container">
        <div class="chat-header">
          <chat-avatar
            src="${this.getAttribute('avatar') || ''}"
            fallback="${(this.getAttribute('title') || 'Bot').charAt(0)}"
            bg-color="var(--primary-color)">
          </chat-avatar>
          <div class="header-info">
            <h3 class="header-title">${this.getAttribute('title') || 'Chat Assistant'}</h3>
            <p class="header-subtitle">${this.getAttribute('subtitle') || 'Our virtual agent is here to help you'}</p>
          </div>
        </div>

        <div class="messages-container" id="messages"></div>

        <div class="chat-footer">
          <div class="input-group">
            <input type="text" class="chat-input" placeholder="اكتب رسالة..." />
            <button class="send-button" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div class="footer-actions">
            <button class="footer-button new-chat-btn">محادثة جديدة</button>
            <span class="powered-by">${this.getAttribute('powered-by') || 'Powered by AI'}</span>
            <button class="footer-button close-btn">إغلاق</button>
          </div>
        </div>
      </div>

      <chat-button></chat-button>
    `;

      this.shadowRoot.appendChild(styleEl);
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      // تخزين المراجع للعناصر المهمة
      this.chatContainer = this.shadowRoot.querySelector('.chat-container');
      this.messagesContainer = this.shadowRoot.querySelector('#messages');
      this.chatInput = this.shadowRoot.querySelector('.chat-input');
      this.sendButton = this.shadowRoot.querySelector('.send-button');
      this.chatButton = this.shadowRoot.querySelector('chat-button');

      // إضافة اقتراحات مبدئية
      const suggestionsEl = document.createElement('chat-suggestions');
      suggestionsEl.suggestions = [
        'ما هي خدماتكم؟',
        'كيف يمكنني التواصل معكم؟',
        'هل لديكم خدمة توصيل؟'
      ];
      this.messagesContainer.appendChild(suggestionsEl);
    }

    _setupEventListeners() {
      // زر فتح الدردشة
      this.chatButton.addEventListener('click', () => {
        this.toggleChat();
      });

      // زر إرسال الرسالة
      this.sendButton.addEventListener('click', () => {
        this._sendMessage();
      });

      // الإرسال عند الضغط على Enter
      this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this._sendMessage();
        }
      });

      // تفعيل/تعطيل زر الإرسال حسب محتوى الإدخال
      this.chatInput.addEventListener('input', () => {
        this.sendButton.disabled = !this.chatInput.value.trim();
      });

      // زر المحادثة الجديدة
      this.shadowRoot.querySelector('.new-chat-btn').addEventListener('click', () => {
        this._clearChat();
      });

      // زر الإغلاق
      this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => {
        this.toggleChat();
      });

      // الاستماع لأحداث اقتراحات الدردشة
      this.shadowRoot.addEventListener('suggestion-clicked', (e) => {
        const { suggestion } = e.detail;
        this.chatInput.value = suggestion;
        this._sendMessage();
      });
    }

    _addMessage(message) {
      const id = Date.now().toString();
      const timestamp = new Date();
      const fullMessage = {
        id,
        content: message.content,
        sender: message.sender,
        timestamp
      };

      // إضافة الرسالة إلى المصفوفة
      this.messages.push(fullMessage);

      // إنشاء مكون رسالة جديد
      const messageEl = document.createElement('chat-message');
      messageEl.setAttribute('sender', message.sender);
      messageEl.setAttribute('message-id', id);
      if (message.sender === 'bot') {
        messageEl.setAttribute('avatar', this.getAttribute('avatar') || '');
      }
      messageEl.textContent = message.content;

      // إضافة المكون للعرض
      this.messagesContainer.appendChild(messageEl);

      // التمرير إلى أسفل
      this._scrollToBottom();

      // إخفاء الاقتراحات عند إرسال أول رسالة
      if (this.messages.length === 2 && this.messages[1].sender === 'user') {
        const suggestions = this.shadowRoot.querySelector('chat-suggestions');
        if (suggestions) {
          suggestions.style.display = 'none';
        }
      }

      return fullMessage;
    }

    _sendMessage() {
      const message = this.chatInput.value.trim();
      if (!message) return;

      // إضافة رسالة المستخدم
      this._addMessage({
        content: message,
        sender: 'user'
      });

      // مسح حقل الإدخال
      this.chatInput.value = '';
      this.sendButton.disabled = true;

      // إظهار مؤشر الكتابة
      this._showTypingIndicator();

      // إرسال الرسالة إلى الخادم
      const apiUrl = this.getAttribute('api-url');
      const projectId = this.getAttribute('project-id');

      this.chatService.sendMessage(apiUrl, {
        message,
        session_id: this.sessionId,
        project_id: projectId
      })
      .then(stream => {
        let fullResponse = '';

        stream.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // معالجة أنواع الأحداث المختلفة
            if (event.type === 'chunk') {
              fullResponse += data.content;
            } else if (event.type === 'end') {
              // إخفاء مؤشر الكتابة عند انتهاء الرسالة
              this._hideTypingIndicator();

              // إضافة الرسالة الكاملة
              if (fullResponse) {
                this._addMessage({
                  content: fullResponse,
                  sender: 'bot'
                });
              }
            } else if (event.type === 'error') {
              console.error('Error from chat service:', data.message);
              this._hideTypingIndicator();
              this._addMessage({
                content: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
                sender: 'bot'
              });
            }
          } catch (err) {
            console.error('Error parsing SSE message:', err);
          }
        };

        stream.onerror = (err) => {
          console.error('SSE Error:', err);
          this._hideTypingIndicator();
          this._addMessage({
            content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
            sender: 'bot'
          });
        };
      })
      .catch(err => {
        console.error('Failed to send message:', err);
        this._hideTypingIndicator();
        this._addMessage({
          content: 'عذراً، تعذر الاتصال بالخادم. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
          sender: 'bot'
        });
      });
    }

    _showTypingIndicator() {
      this.isTyping = true;

      const typingEl = document.createElement('typing-indicator');
      typingEl.setAttribute('avatar', this.getAttribute('avatar') || '');
      typingEl.id = 'typing-indicator';

      this.messagesContainer.appendChild(typingEl);
      this._scrollToBottom();
    }

    _hideTypingIndicator() {
      this.isTyping = false;

      const typingEl = this.shadowRoot.querySelector('#typing-indicator');
      if (typingEl) {
        typingEl.remove();
      }
    }

    _clearChat() {
      // إزالة جميع الرسائل
      this.messages = [];

      // إفراغ حاوية الرسائل
      while (this.messagesContainer.firstChild) {
        this.messagesContainer.removeChild(this.messagesContainer.firstChild);
      }

      // إعادة إنشاء جلسة جديدة
      this.sessionId = this._generateSessionId();

      // إضافة رسالة الترحيب
      setTimeout(() => {
        this._addMessage({
          content: this.getAttribute('welcome-message') || 'مرحبًا بك! كيف يمكنني مساعدتك اليوم؟',
          sender: 'bot'
        });

        // إظهار الاقتراحات مرة أخرى
        const suggestionsEl = document.createElement('chat-suggestions');
        suggestionsEl.suggestions = [
          'ما هي خدماتكم؟',
          'كيف يمكنني التواصل معكم؟',
          'هل لديكم خدمة توصيل؟'
        ];
        this.messagesContainer.appendChild(suggestionsEl);
      }, 300);
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.chatContainer.classList.add('open');
        // حفظ حالة النافذة
        localStorage.setItem('chatWidgetOpen', 'true');
      } else {
        this.chatContainer.classList.remove('open');
        // حفظ حالة النافذة
        localStorage.setItem('chatWidgetOpen', 'false');
      }
    }

    _scrollToBottom() {
      setTimeout(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }, 100);
    }

    _generateSessionId() {
      // محاولة الحصول على معرف جلسة محفوظ
      const savedSessionId = localStorage.getItem('chatWidgetSessionId');
      if (savedSessionId) {
        return savedSessionId;
      }

      // إنشاء معرف جديد إذا لم يكن موجوداً
      const newSessionId = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chatWidgetSessionId', newSessionId);
      return newSessionId;
    }

    connectedCallback() {
      // التحقق من حالة النافذة المحفوظة
      const savedState = localStorage.getItem('chatWidgetOpen');
      if (savedState === 'true') {
        setTimeout(() => this.toggleChat(), 300);
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      // تحديث المكون عند تغيير السمات
      if (oldValue !== newValue) {
        switch (name) {
          case 'direction':
            this.style.direction = newValue || 'rtl';
            break;
        }
      }
    }
  }

  // تسجيل المكون
  customElements.define('chat-widget', ChatWidget);

  // نقطة الدخول الرئيسية للمكتبة

  // نافذة عامة للوصول إلى المكتبة
  window.ChatWidget = {
    init: (options = {}) => {
      // تهيئة الخيارات الافتراضية
      const defaultOptions = {
        projectId: '',
        theme: 'light',
        position: 'bottom-right',
        welcomeMessage: 'مرحبًا بك! كيف يمكنني مساعدتك اليوم؟',
        apiUrl: 'https://api.yourdomain.com/chat/stream',
        direction: 'rtl',
        avatar: '',
        title: 'Chat Assistant',
        subtitle: 'Our virtual agent is here to help you',
        poweredBy: 'Powered by AI'
      };

      // دمج الخيارات مع الافتراضية
      const config = { ...defaultOptions, ...options };

      // إنشاء مكون الدردشة
      const chatWidget = document.createElement('chat-widget');

      // تعيين السمات
      Object.keys(config).forEach(key => {
        chatWidget.setAttribute(key, config[key]);
      });

      // إضافة المكون للصفحة
      document.body.appendChild(chatWidget);

      // إرجاع مرجع إلى المكون
      return chatWidget;
    }
  };

  // إعداد مثيل تلقائياً إذا كانت هناك خيارات في نافذة المتصفح
  if (window.ChatWidgetOptions) {
    window.ChatWidget.init(window.ChatWidgetOptions);
  }

})();
