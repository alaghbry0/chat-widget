import { renderMarkdown } from '../utils/renderMarkdown.js';

/**
 * مكوّن عرض رسائل الدردشة
 */
class ChatMessage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._content = '';
  }

  connectedCallback() {
    const sender = this.getAttribute('sender') || 'bot';
    const avatar = this.getAttribute('avatar') || 'docs/profile.png';
    const messageId = this.getAttribute('message-id') || '';

    // قراءة محتوى Markdown الخام
    this._content = this.getAttribute('data-md') || this.textContent || '';

    // إعداد CSS جديد يتضمن تنسيقات للقوائم والروابط
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; width: 115%; margin-bottom: 16px; }

      .message {
        display: flex;
        flex-direction: column;
        max-width: 80%;
        animation: fadeIn 0.3s ease-in-out, slideIn 0.2s ease-out;
      }

      .message-user {
        align-self: flex-end;
        align-items: flex-end;
      }

      .message-bot {
        align-self: flex-start;
        align-items: flex-start;
      }

      .message-header {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
      }

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-right: 8px;
        background-color: var(--primary-color);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
      }

      .message-content {
        padding: 5px 10px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.6;
        position: relative;
        overflow-wrap: break-word;
        word-break: break-word;
      }

      .message-user .message-content {
        background: linear-gradient(135deg, #007BFF, #0056b3);
        color: #fff;
        border-bottom-right-radius: 4px;
      }

      .message-bot .message-content {
        background: linear-gradient(135deg, #F8F9FA, #FFFFFF);
        color: #333;
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }

      .message-time {
        font-size: 11px;
        color: var(--text-secondary);
        margin-top: 4px;
        opacity: 0.8;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from { transform: translateY(10px); }
        to { transform: translateY(0); }
      }

      /* تنسيقات العناصر في الرسالة */
      .message-content h1, .message-content h2, .message-content h3 {
        margin: 12px 0 8px 0;
        font-weight: 600;
      }

      .message-content h1 { font-size: 16px; }
      .message-content h2 { font-size: 14px; }
      .message-content h3 { font-size: 13px; }

      /* تنسيقات القوائم */
      .message-content ul, .message-content ol {
        padding-left: 20px;
        margin: 8px 0;
      }

      .message-content li {
        margin-bottom: 4px;
      }

      .message-content li.nested {
        margin-left: 16px;
      }

      /* تنسيقات الروابط - معدّلة لتشبه الأزرار */
      .message-content a {
        color: inherit;
        text-decoration: none;
        display: inline-block;
        padding: 6px 12px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 16px;
        transition: background 0.2s ease;
      }

      .message-user .message-content a {
        color: #fff;
        background: rgba(255, 255, 255, 0.2);
      }

      .message-bot .message-content a {
        color: #007BFF;
        background: rgba(0, 123, 255, 0.1);
      }

      .message-content a::after {
        content: " ↗";
        font-size: 0.8em;
        opacity: 0.8;
      }

      /* تنسيقات الكود */
      .message-content code {
        background: rgba(0,0,0,0.1);
        border-radius: 3px;
        padding: 2px 4px;
        font-family: monospace;
      }

      .message-user .message-content code {
        background: rgba(255,255,255,0.2);
      }

      /* أزرار التفاعل */
      .message-actions {
        display: none;
        position: absolute;
        top: -16px;
        right: 0;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .message:hover .message-actions {
        display: flex;
      }

      .action-button {
        padding: 4px 8px;
        background: #fff;
        color: #666;
        border: none;
        cursor: pointer;
        font-size: 12px;
        border-radius: 4px;
      }

      .action-button:hover {
        background: #f1f1f1;
      }
    `;

    // إنشاء عنصر الرسالة
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${sender}`;
    messageEl.setAttribute('data-message-id', messageId);

    // تحويل Markdown إلى HTML آمن
    const html = renderMarkdown(this._content);

    messageEl.innerHTML = `
      <div class="message-header">
        ${sender === 'bot'
          ? (avatar
              ? `<img class="avatar" src="${avatar}" alt="Bot Avatar">`
              : `<div class="avatar">B</div>`)
          : ''}
      </div>
      <div class="message-content">${html}</div>
      <div class="message-time">${this._formatTime(new Date())}</div>
      ${sender === 'bot' ? `
        <div class="message-actions">
          <button class="action-button copy-btn">نسخ</button>
        </div>
      ` : ''}
    `;

    this.shadowRoot.append(style, messageEl);
    this._activateControls();
    this._setupLinkTargets();
  }

  // دالة لتحديث محتوى الرسالة (للاستجابة المتدفقة)
  updateContent(newContent) {
    if (newContent === this._content) return;
    this._content = newContent;

    const contentEl = this.shadowRoot.querySelector('.message-content');
    if (contentEl) {
      contentEl.innerHTML = renderMarkdown(newContent);
      this._activateControls();
      this._setupLinkTargets();
    }
  }

  _activateControls() {
    // تفعيل زر النسخ
    const copyBtn = this.shadowRoot.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this._content)
        .then(() => {
          copyBtn.textContent = 'تم النسخ';
          setTimeout(() => {
            copyBtn.textContent = 'نسخ';
          }, 2000);
        })
        .catch(err => {
          console.error('فشل النسخ:', err);
        });
      });
    }
  }

  // دالة جديدة لتعيين target="_blank" للروابط
  _setupLinkTargets() {
    const links = this.shadowRoot.querySelectorAll('.message-content a');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  _formatTime(date) {
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }
}

customElements.define('chat-message', ChatMessage);