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