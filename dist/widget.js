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
       this.bubbleElement.addEventListener('click', () => {
     // فقط إزالة النبضة عند الضغط

     // لا حاجة الآن لإعادة dispatch لحدث "click" لأنّه يخرج تلقائياً للـ host
   });

    }  // ← قوس يغلق connectedCallback هنا

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
      // --- بداية التعديل ---
      style.textContent = `
      :host {
        display: block;
        width: 100%;
      }

      .message {
        display: flex;
        flex-direction: column;
        max-width: 85%;
        margin-bottom: 12px; /* إضافة هامش سفلي بين الرسائل */
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
        flex-shrink: 0; /* منع الصورة الرمزية من التقلص */
      }

      .message-header {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        /* فقط عرض الهيدر إذا كان المرسل هو البوت ولديه صورة رمزية */
        ${sender === 'bot' ? '' : 'display: none;'}
      }

      .message-content {
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
        position: relative;
        word-wrap: break-word; /* لضمان التفاف النص الطويل */
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

      /* وضع الصورة الرمزية بجانب المحتوى للـ bot */
       .message-bot {
           flex-direction: row; /* تغيير الاتجاه إلى صف */
           align-items: flex-start; /* محاذاة العناصر في بداية المحور العمودي */
       }
       .message-bot .message-header {
           margin-bottom: 0; /* إزالة الهامش السفلي من الهيدر */
           margin-right: 8px; /* إضافة هامش يمين للصورة الرمزية */
       }
        /* إخفاء الصورة الرمزية من الهيدر لأننا سنضعها مباشرة في .message-bot */
       .message-bot .message-header .avatar {
           display: none;
       }

       .message-bot > .message-content {
           /* لا حاجة لتغييرات هنا حاليًا */
       }

       .message-bot > .message-time {
         margin-left: 36px; /* تحريك الوقت ليتناسب مع محتوى الرسالة (28px avatar + 8px margin) */
         text-align: left;
       }

       .message-user > .message-time {
         text-align: right;
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
        /* استخدام لون مميز للروابط داخل رسائل البوت */
        color: ${sender === 'bot' ? 'var(--primary-color, #007BFF)' : 'inherit'};
        text-decoration: underline;
      }

      .message-content a:hover {
        opacity: 0.8;
      }

      /* تنسيق الأكواد البرمجية في الرسائل */
      .message-content pre {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 10px; /* زيادة الحشو */
        border-radius: 4px;
        overflow-x: auto;
        margin: 8px 0;
        border: 1px solid rgba(0,0,0,0.1); /* إضافة حدود بسيطة */
      }

      .message-content code:not(pre > code) { /* تنسيق الكود المضمن فقط */
         background-color: rgba(0,0,0,0.05);
         padding: 2px 4px;
         border-radius: 3px;
         font-family: monospace;
         font-size: 13px;
       }
      .message-content pre code { /* تنسيق الكود داخل <pre> */
         background-color: transparent; /* بدون خلفية إضافية */
         padding: 0;
         border-radius: 0;
         font-family: monospace;
         font-size: 13px;
         display: block; /* تأكد من أنه كتلة */
         white-space: pre; /* الحفاظ على المسافات والأسطر */
      }


      /* تنسيق القوائم */
      .message-content ul, .message-content ol {
        padding-left: 24px;
        margin: 8px 0;
      }

      /* تنسيق أزرار الإجراءات */
      .action-button {
        background-color: var(--primary-color, #007BFF);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 15px; /* جعلها أكثر دائرية */
        cursor: pointer;
        font-size: 13px;
        margin: 5px 5px 5px 0; /* إضافة هوامش */
        transition: background-color 0.2s ease;
        display: inline-block; /* جعلها تظهر بجانب بعضها البعض */
      }

      .action-button:hover {
        background-color: var(--primary-color-dark, #0056b3); /* لون أغمق عند المرور */
      }
    `;
      // --- نهاية التعديل ---

      // معالجة محتوى الرسالة (تحويل الماركداون الأساسي)
      const processedContent = this._processMessageContent(content);

      // إنشاء هيكل المكون
      const messageElement = document.createElement('div');
      // التأكد من وجود مسافة بين أسماء الفئات
      messageElement.className = `message message-${sender}`;
      messageElement.setAttribute('data-message-id', messageId);

      // تحديد HTML للصورة الرمزية
      let avatarHTML = '';
      if (sender === 'bot') {
        if (avatar) {
          avatarHTML = `<img class="avatar" src="${avatar}" alt="Bot Avatar">`;
        } else {
          // يمكنك استخدام حرف أو أيقونة افتراضية
          avatarHTML = `<div class="avatar">🤖</div>`; // تغيير إلى رمز تعبيري أو SVG
        }
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // بناء HTML الداخلي للمكون
      // ملاحظة: تم نقل الصورة الرمزية خارج الهيدر ليتم عرضها بجانب المحتوى للـ bot
      messageElement.innerHTML = `
      ${sender === 'bot' ? avatarHTML : ''}
      <div class="message-body"> <div class="message-content">${processedContent}</div>
          <div class="message-time">${timeStr}</div>
      </div>
    `;

       // تعديل طفيف في بناء الـ HTML لترتيب أفضل (خاصة للـ bot)
       if (sender === 'bot') {
           messageElement.innerHTML = `
             ${avatarHTML}
             <div style="display: flex; flex-direction: column; align-items: flex-start;">
                 <div class="message-content">${processedContent}</div>
                 <div class="message-time">${timeStr}</div>
             </div>
         `;
       } else { // رسالة المستخدم
           messageElement.innerHTML = `
             <div class="message-content">${processedContent}</div>
             <div class="message-time">${timeStr}</div>
         `;
       }


      // إضافة الأنماط والمحتوى للظل
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(messageElement);

      // تفعيل الروابط وأزرار الإجراءات بعد إضافة المحتوى
      this._activateLinks();
    }

    /**
     * معالجة محتوى الرسالة لتحويل الروابط والماركداون البسيط
     */
    _processMessageContent(content) {
      // الحماية من حقن HTML بسيط (هذه ليست حماية كاملة!)
      let processed = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // تحويل أكواد الماركداون متعددة الأسطر ```code```
      processed = processed.replace(
          /```([\s\S]*?)```/g, // استخدام [\s\S] لمطابقة أي حرف بما في ذلك الأسطر الجديدة
          (match, code) => `<pre><code>${code.trim()}</code></pre>` // استخدام الدالة لإزالة المسافات الزائدة
      );

      // تحويل أكواد الماركداون المضمنة `code` (بعد معالجة الكتل لتجنب التداخل)
       processed = processed.replace(
           /`([^`]+)`/g,
           '<code>$1</code>'
       );

      // تحويل الروابط العادية إلى روابط قابلة للنقر (يجب أن يتم بعد معالجة الكود لتجنب تحويل الروابط داخل الكود)
      // تأكد من أن هذا لا يطبق داخل <pre> أو <code>
       processed = processed.replace(
           /(?<!<code[^>]*?>)(?<!<pre[^>]*?>)(https?:\/\/[^\s<]+)/g, // استخدام Negative Lookbehind للتأكد أنه ليس داخل code أو pre
           '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
       );


      // تحويل زر الإجراء (مثال: [زر الإجراء](action:do_something))
      processed = processed.replace(
        /\[([^\]]+)\]\(action:([^)]+)\)/g,
        '<button class="action-button" data-action="$2">$1</button>'
      );

       // تحويل نهايات الأسطر إلى <br> (اختياري، حسب الرغبة في عرض النص)
       // قد ترغب في تطبيقه فقط خارج <pre>
       // processed = processed.replace(/\n/g, '<br>');


      return processed;
    }

    /**
     * تفعيل الروابط وأزرار الإجراءات في الرسالة
     */
    _activateLinks() {
      const actionButtons = this.shadowRoot.querySelectorAll('.action-button');
      actionButtons.forEach(button => {
        // التأكد من عدم إضافة المستمع أكثر من مرة (احتياطي)
        if (!button.hasAttribute('data-listener-added')) {
            button.addEventListener('click', () => {
              const action = button.getAttribute('data-action');
              this.dispatchEvent(new CustomEvent('action-clicked', {
                detail: { action },
                bubbles: true, // السماح للحدث بالصعود في شجرة DOM
                composed: true // السماح للحدث بالخروج من Shadow DOM
              }));
            });
            button.setAttribute('data-listener-added', 'true');
        }
      });

      // ملاحظة: الروابط العادية <a> تعمل تلقائياً، لا حاجة لتفعيلها هنا.
    }
  }

  // تسجيل المكون المخصص
  // تأكد من أن هذا الاسم لم يتم استخدامه من قبل
  if (!customElements.get('chat-message')) {
    customElements.define('chat-message', ChatMessage);
  }

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

  // إزالة استيراد ChatService:
  // import { ChatService } from './services/chat-service.js';

  // استيراد الأنماط (تبقى كما هي)
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
 :host([direction="rtl"]) .header-info {
    margin-left: auto; /* لنقل المعلومات إلى اليمين في وضع RTL */
    margin-right: 12px;
 }
 :host([direction="rtl"]) .send-button svg {
    transform: scaleX(-1); /* لعكس أيقونة الإرسال */
 }
 :host([direction="rtl"]) .footer-actions {
    flex-direction: row-reverse; /* لعكس ترتيب الأزرار في الأسفل */
 }

 .chat-container {
   z-index: 9999;
   position: fixed;
   display: flex;
   flex-direction: column;
   width: 350px;
   height: calc(95vh - 32px);
   max-height: 600px;
   background-color: transparent; /* تم تغييرها لتكون شفافة */
   border-radius: 24px; /* زيادة الانحناء */
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
   border-top-left-radius: 16px; /* تعديل للانحناء الجديد */
   border-top-right-radius: 16px; /* تعديل للانحناء الجديد */
   border-bottom: 1px solid var(--border-color);
 }

 .header-info {
   margin-left: 12px; /* تعديل المسافة */
   margin-right: 12px; /* تعديل المسافة */
   flex-grow: 1; /* للسماح بالنمو وأخذ المساحة المتاحة */
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
   gap: 16px; /* زيادة المسافة بين الرسائل */
 }

 /* تخصيص شريط التمرير */
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
   border-bottom-left-radius: 16px; /* تعديل للانحناء الجديد */
   border-bottom-right-radius: 16px; /* تعديل للانحناء الجديد */
   backdrop-filter: blur(10px); /* إضافة تأثير الضبابية */
 }

 .input-group {
   display: flex;
   align-items: center;
   gap: 8px; /* إضافة مسافة بين الحقل والزر */
   margin-bottom: 8px; /* مسافة سفلية قبل الأزرار الإضافية */
 }

 .chat-input {
   flex: 1;
   padding: 10px 16px; /* زيادة الحشو الداخلي */
   font-size: 14px;
   background-color: var(--bg-color);
   color: var(--text-color);
   border: 1px solid var(--border-color);
   border-radius: 9999px; /* جعله دائريًا تمامًا */
   outline: none;
 }

 .chat-input::placeholder {
   color: var(--text-secondary);
 }

 .send-button {
   width: 40px; /* حجم الزر */
   height: 40px; /* حجم الزر */
   border-radius: 50%; /* دائري */
   background-color: var(--primary-color);
   color: white;
   border: none;
   display: flex;
   align-items: center;
   justify-content: center;
   cursor: pointer;
   transition: background-color 0.2s;
   flex-shrink: 0; /* منع الزر من الانكماش */
 }

 .send-button:hover {
   background-color: var(--primary-hover);
 }

 .send-button:disabled {
   opacity: 0.5;
   cursor: not-allowed;
 }

 .send-button svg {
   width: 18px; /* حجم الأيقونة */
   height: 18px; /* حجم الأيقونة */
 }

 .footer-actions {
   display: flex;
   justify-content: space-between;
   align-items: center;
   /* تم حذف margin-top */
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

 /* إضافة عنصر لعرض زمن الاستجابة ومعرف الجلسة (اختياري) */
 .session-info {
   font-size: 10px;
   color: var(--text-secondary);
   text-align: center; /* توسيط النص */
   margin-top: 5px;
   display: none; /* إخفاءه مبدئياً */
 }
 :host([debug="true"]) .session-info {
    display: block; /* إظهاره في وضع التصحيح */
 }
`;

  class ChatWidget extends HTMLElement {
   constructor() {
     super();
     this.attachShadow({ mode: 'open' });
     this.isOpen = false;
     this.messages = [];
     this.isTyping = false; // لا يزال مفيدًا لمؤشر الكتابة العام
     this.sessionId = this._loadSessionId(); // تحميل أو إنشاء معرف الجلسة

     // متغيرات الحالة الجديدة لـ SSE
     this.currentBotMessageContainer = null;
     this.responseStartTime = null;

     // إزالة التهيئة الخاصة بـ ChatService
     // this.chatService = new ChatService(); // --- محذوف ---

     this._initialize();
   }

   static get observedAttributes() {
     return [
       'project-id', 'theme', 'position', 'welcome-message',
       'api-url', 'direction', 'avatar', 'title', 'subtitle', 'powered-by', 'debug' // إضافة debug
     ];
   }

   _initialize() {
     // التهيئة الأساسية للمكون
     this._render();
     this._setupEventListeners();

     // إضافة رسالة الترحيب
     setTimeout(() => {
       // لا نستخدم _addMessage هنا مباشرة للترحيب إذا أردنا تصميمًا مختلفًا له
       const welcomeMsg = this.getAttribute('welcome-message') || 'مرحبًا بك! كيف يمكنني مساعدتك اليوم؟';
       this._createBotMessageContainer(welcomeMsg); // إنشاء حاوية رسالة البوت مباشرة
       // لا نحتاج إلى إضافة رسالة الترحيب إلى مصفوفة messages إذا كانت ثابتة
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
          <div class="session-info">
           <span id="session-id-display">معرف الجلسة: ${this.sessionId}</span>
           <span id="last-response-time"></span>
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

     // إضافة اقتراحات مبدئية (إذا لم تكن هناك رسائل ترحيب أولاً)
     if (this.messagesContainer.children.length === 0) {
          this._addInitialSuggestions();
     }
   }

   _addInitialSuggestions() {
      const suggestionsEl = document.createElement('chat-suggestions');
      // يمكن جعل الاقتراحات قابلة للتخصيص عبر سمة
      suggestionsEl.suggestions = [
        'ما هي خدماتكم؟',
        'كيف يمكنني التواصل معكم؟',
        'هل لديكم خدمة توصيل؟'
      ];
      this.messagesContainer.appendChild(suggestionsEl);
      this._scrollToBottom();
   }

   _setupEventListeners() {
     this.chatButton.addEventListener('click', () => this.toggleChat());
     this.sendButton.addEventListener('click', () => this._sendMessage());
     this.chatInput.addEventListener('keypress', (e) => {
       if (e.key === 'Enter' && !this.sendButton.disabled) {
         this._sendMessage();
       }
     });
     this.chatInput.addEventListener('input', () => {
       this.sendButton.disabled = !this.chatInput.value.trim();
     });
     this.shadowRoot.querySelector('.new-chat-btn').addEventListener('click', () => this._clearChat());
     this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.toggleChat());
     this.shadowRoot.addEventListener('suggestion-clicked', (e) => {
       const { suggestion } = e.detail;
       this.chatInput.value = suggestion;
       this.sendButton.disabled = false; // تفعيل الزر
       this._sendMessage();
     });
   }

   // --- دالة إضافة رسالة المستخدم (تبقى كما هي تقريباً) ---
   _addUserMessage(content) {
     const messageEl = document.createElement('chat-message');
     messageEl.setAttribute('sender', 'user');
     messageEl.setAttribute('message-id', `user-${Date.now()}`);
     messageEl.textContent = content; // تعيين المحتوى مباشرة

     // إضافة الوقت للرسالة
     const timeEl = document.createElement('span');
     timeEl.className = 'timestamp';
     timeEl.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
     messageEl.shadowRoot.querySelector('.message-content').appendChild(timeEl);


     this.messagesContainer.appendChild(messageEl);
     this._scrollToBottom();

     // إخفاء الاقتراحات إذا كانت موجودة
     const suggestions = this.shadowRoot.querySelector('chat-suggestions');
     if (suggestions) {
       suggestions.style.display = 'none';
     }
   }

   // --- دالة إنشاء حاوية رسالة البوت (معدلة / جديدة) ---
   _createBotMessageContainer(initialContent = '...') {
       const messageEl = document.createElement('chat-message');
       messageEl.setAttribute('sender', 'bot');
       messageEl.setAttribute('message-id', `bot-${Date.now()}`);
       messageEl.setAttribute('avatar', this.getAttribute('avatar') || '');
       messageEl.textContent = initialContent; // تعيين المحتوى المبدئي (أو placeholder)

       this.messagesContainer.appendChild(messageEl);
       this._scrollToBottom();
       return messageEl; // إرجاع العنصر للتعامل معه لاحقاً
   }

   // --- الدالة الرئيسية لإرسال الرسالة (معدلة بشكل كبير) ---
   _sendMessage() {
     const message = this.chatInput.value.trim();
     if (!message) return;

     // 1. إضافة رسالة المستخدم إلى الواجهة
     this._addUserMessage(message);

     // 2. مسح حقل الإدخال وتعطيل الزر
     this.chatInput.value = '';
     this.sendButton.disabled = true;
     this.chatInput.disabled = true; // تعطيل الإدخال أثناء انتظار الرد

     // 3. إظهار مؤشر الكتابة العام (اختياري إذا كان التصميم يتطلب ذلك)
     // this._showTypingIndicator(); // --- يمكن إزالته إذا لم يكن مرغوبًا مع الـ streaming ---

     // 4. إعداد حاوية رسالة البوت الجديدة للرد القادم
     this.currentBotMessageContainer = this._createBotMessageContainer(); // استخدام placeholder الافتراضي '...'
     this.responseStartTime = performance.now(); // بدء قياس الوقت

     // 5. استدعاء دالة الـ Streaming مباشرة
     this._streamChatResponse(message, this.sessionId)
       .catch(err => {
          console.error('Streaming Error:', err);
          // التعامل مع الخطأ على مستوى أعلى (مثل فشل الاتصال الأولي)
          this._handleStreamError(err.message || 'فشل الاتصال بالخادم.');
       });
   }

   // --- دالة جديدة: التعامل مع تدفق استجابة الدردشة (SSE) ---
   async _streamChatResponse(message, sessionId) {
     const url = this.getAttribute('api-url');
     if (!url) {
       throw new Error("Chat API URL is not set.");
     }
     // تضمين project_id إذا كان الـ API يتطلبه
     const projectId = this.getAttribute('project-id');
     const requestData = {
         message,
         session_id: sessionId,
         debug: this.hasAttribute('debug') // إرسال حالة التصحيح
     };
     // إضافة projectId إذا كان موجودًا
     if (projectId) {
       requestData.project_id = projectId;
     }


     const response = await fetch(url, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Accept': 'text/event-stream' // مهم لـ SSE
       },
       body: JSON.stringify(requestData),
     });

     if (!response.ok) {
       // محاولة قراءة رسالة الخطأ من الخادم
       let errorText = `HTTP error ${response.status}`;
       try {
         const errorData = await response.json(); // محاولة قراءة JSON
         errorText = errorData.detail || errorData.message || JSON.stringify(errorData);
       } catch (e) {
         errorText = await response.text(); // قراءة كنص إذا فشل JSON
       }
       throw new Error(errorText);
     }
     if (!response.body) {
       throw new Error('No response body received from server.');
     }

     const reader = response.body.getReader();
     const decoder = new TextDecoder('utf-8');
     let buffer = '';

     // حلقة لقراءة الـ stream
     while (true) {
       const { done, value } = await reader.read();
       if (done) {
         console.log("Stream finished.");
         // قد تحتاج إلى التحقق هنا إذا لم يتم استلام حدث 'end'
         if (!this.currentBotMessageContainer.classList.contains('finished')) {
              console.warn("Stream ended without an 'end' event. Finalizing message.");
              // التأكد من إخفاء المؤشر وإعادة تفعيل الإدخال حتى لو لم يصل حدث end
              this._finishBotMessage(this.sessionId); // استخدام sessionId الحالي
         }
         break;
       }

       buffer += decoder.decode(value, { stream: true });
       // تقسيم الأحداث بناءً على السطرين الفارغين
       const parts = buffer.split('\n\n');
       buffer = parts.pop() || ''; // الجزء الأخير قد يكون غير مكتمل، يتم الاحتفاظ به

       for (const chunk of parts) {
         this._processSseEvent(chunk);
       }
     }
   }

   // --- دالة جديدة: معالجة حدث SSE واحد ---
   _processSseEvent(eventData) {
     console.log("Raw SSE Event:", eventData);
     const lines = eventData.split('\n');
     let eventType = 'message'; // النوع الافتراضي
     let payload = '';

     for (const line of lines) {
       if (line.startsWith('event:')) {
         eventType = line.slice(6).trim();
       } else if (line.startsWith('data:')) {
         // التعامل مع البيانات التي قد تمتد على عدة أسطر data:
         payload += line.slice(5).trim();
       }
       // يمكن تجاهل الأسطر الأخرى مثل id:, retry: حاليًا
     }

     if (!payload) return; // لا يوجد بيانات لمعالجتها

     let data;
     try {
       data = JSON.parse(payload);
       console.log(`Parsed SSE Event (${eventType}):`, data);
     } catch (err) {
       console.error('JSON parse error in SSE data:', err, payload);
       this._handleStreamError(`خطأ في تنسيق بيانات الخادم: ${payload}`);
       return;
     }

     switch (eventType) {
       case 'chunk':
         if (data.content !== undefined && data.content !== null) {
           this._appendToBotMessage(data.content);
         }
         break;
       case 'end':
         // الخادم يشير إلى نهاية الاستجابة
         this._finishBotMessage(data.session_id); // تمرير معرف الجلسة الجديد إن وجد
         break;
       case 'error':
         // الخادم أرسل رسالة خطأ واضحة
         this._handleStreamError(data.error || data.message || 'حدث خطأ غير معروف من الخادم.');
         break;
       case 'debug':
          console.log("Debug Info:", data);
          // يمكنك عرض معلومات التصحيح في الواجهة إذا أردت
          break;
       // يمكنك إضافة حالات أخرى مثل 'tool_call', 'tool_result' إذا كانت API تدعمها
       default:
         console.warn(`Unhandled SSE event type: ${eventType}`);
         // قد ترغب في التعامل مع النوع الافتراضي 'message' إذا كان الخادم لا يرسل 'event:'
         if(eventType === 'message' && data.content) {
             this._appendToBotMessage(data.content);
         }
     }
   }

   // --- دالة مساعدة جديدة: إضافة نص إلى رسالة البوت الحالية ---
   _appendToBotMessage(text) {
     if (!this.currentBotMessageContainer) {
       console.error("Attempted to append text but no currentBotMessageContainer exists.");
       // ربما إنشاء حاوية جديدة كحل بديل؟
       this.currentBotMessageContainer = this._createBotMessageContainer('');
     }

     const contentEl = this.currentBotMessageContainer.shadowRoot.querySelector('.message-content');
     if (!contentEl) {
         console.error("Could not find .message-content in currentBotMessageContainer.");
         return;
     }

     // إزالة الـ placeholder ('...') عند وصول أول جزء
     if (contentEl.textContent === '...') {
       contentEl.textContent = '';
     }

     contentEl.textContent += text; // إضافة النص الجديد
     this._scrollToBottom(); // التمرير لأسفل مع كل إضافة
   }

   // --- دالة مساعدة جديدة: إنهاء رسالة البوت ---
   _finishBotMessage(newSessionId) {
     if (!this.currentBotMessageContainer) {
         console.warn("finishBotMessage called but no currentBotMessageContainer");
         // تأكد من إعادة تفعيل الإدخال حتى لو لم تكن هناك رسالة
         this.chatInput.disabled = false;
         this.sendButton.disabled = !this.chatInput.value.trim(); // تفعيل زر الإرسال إذا كان هناك نص
         return;
     }

     this.currentBotMessageContainer.classList.add('finished'); // علامة لتمييز الرسالة المكتملة

     // إخفاء مؤشر الكتابة العام (إذا كان مستخدماً)
     // this._hideTypingIndicator(); // --- إزالة إذا لم يعد المؤشر العام مستخدماً ---

     const end = performance.now();
     const duration = ((end - (this.responseStartTime || end)) / 1000).toFixed(2); // حساب المدة

     // إضافة الطابع الزمني إلى الرسالة
     const contentEl = this.currentBotMessageContainer.shadowRoot.querySelector('.message-content');
     if (contentEl) {
       const timeEl = document.createElement('span');
       timeEl.className = 'timestamp';
       timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
       contentEl.appendChild(timeEl); // إضافة الطابع الزمني داخل فقاعة الرسالة
     }

     // تحديث معلومات الجلسة وزمن الاستجابة (إذا كانت العناصر موجودة)
     const responseTimeEl = this.shadowRoot.querySelector('#last-response-time');
     if (responseTimeEl) {
       responseTimeEl.textContent = ` | آخر زمن استجابة: ${duration} ث`;
     }

     // التحقق من تغيير معرف الجلسة وتحديثه
     if (newSessionId && newSessionId !== this.sessionId) {
       console.log(`Session ID changed from ${this.sessionId} to ${newSessionId}`);
       this.sessionId = newSessionId;
       localStorage.setItem('chatWidgetSessionId', newSessionId); // حفظ المعرف الجديد
       const sessionIdDisplay = this.shadowRoot.querySelector('#session-id-display');
       if (sessionIdDisplay) {
         sessionIdDisplay.textContent = `معرف الجلسة: ${newSessionId}`;
       }
     }

     // إعادة تفعيل حقل الإدخال وزر الإرسال
     this.chatInput.disabled = false;
     this.sendButton.disabled = !this.chatInput.value.trim(); // تفعيل/تعطيل بناءً على المحتوى الحالي

     // إعادة تعيين حاوية الرسالة الحالية
     this.currentBotMessageContainer = null;
     this.responseStartTime = null;
     this._scrollToBottom(); // تأكد من أن الرسالة المكتملة مرئية
   }

   // --- دالة مساعدة جديدة: التعامل مع أخطاء الـ Stream ---
   _handleStreamError(errorMessage) {
     console.error("Stream Error Handler:", errorMessage);

     // إخفاء مؤشر الكتابة العام (إذا كان مستخدماً)
     // this._hideTypingIndicator(); // --- إزالة إذا لم يعد المؤشر العام مستخدماً ---

     const errorContent = `خطأ: ${errorMessage}`;

     if (this.currentBotMessageContainer && !this.currentBotMessageContainer.classList.contains('finished')) {
       // إذا كانت هناك رسالة بوت قيد الإنشاء، اعرض الخطأ فيها
       const contentEl = this.currentBotMessageContainer.shadowRoot.querySelector('.message-content');
       if (contentEl) {
         contentEl.innerHTML = `<div class="error-message" style="color: red;">${errorContent}</div>`;
          // إضافة الطابع الزمني للخطأ أيضاً
          const timeEl = document.createElement('span');
          timeEl.className = 'timestamp';
          timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          contentEl.appendChild(timeEl);
       }
       this.currentBotMessageContainer.classList.add('finished', 'error'); // تمييزها كخطأ
     } else {
       // إذا لم تكن هناك رسالة قيد الإنشاء، أنشئ رسالة خطأ جديدة
       const errorMsgContainer = this._createBotMessageContainer(''); // إنشاء حاوية جديدة
       const contentEl = errorMsgContainer.shadowRoot.querySelector('.message-content');
       contentEl.innerHTML = `<div class="error-message" style="color: red;">${errorContent}</div>`;
        // إضافة الطابع الزمني للخطأ أيضاً
       const timeEl = document.createElement('span');
       timeEl.className = 'timestamp';
       timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
       contentEl.appendChild(timeEl);
       errorMsgContainer.classList.add('finished', 'error'); // تمييزها كخطأ
     }

     // إعادة تفعيل حقل الإدخال وزر الإرسال دائماً عند الخطأ
     this.chatInput.disabled = false;
     this.sendButton.disabled = !this.chatInput.value.trim();

     // إعادة تعيين الحالة
     this.currentBotMessageContainer = null;
     this.responseStartTime = null;
     this._scrollToBottom();
   }


   // --- دوال المؤشر العام (قد لا تكون ضرورية بنفس الشكل الآن) ---
   _showTypingIndicator() {
     // يمكن إبقاء هذه الدالة إذا أردت مؤشرًا عامًا منفصلاً يظهر أسفل المحادثة
     if (this.shadowRoot.querySelector('#typing-indicator')) return; // لا تضف إذا كان موجودًا

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

   // --- دالة مسح المحادثة (تحديث بسيط لمعرف الجلسة) ---
   _clearChat() {
     this.messages = []; // مسح مصفوفة الرسائل (إذا كانت لا تزال مستخدمة)
     while (this.messagesContainer.firstChild) {
       this.messagesContainer.removeChild(this.messagesContainer.firstChild);
     }

     // إنشاء جلسة جديدة وتحديث العرض
     this.sessionId = this._generateSessionId(); // إنشاء معرف جديد
     localStorage.setItem('chatWidgetSessionId', this.sessionId); // حفظه
     const sessionIdDisplay = this.shadowRoot.querySelector('#session-id-display');
      if (sessionIdDisplay) {
        sessionIdDisplay.textContent = `معرف الجلسة: ${this.sessionId}`;
      }
      const responseTimeEl = this.shadowRoot.querySelector('#last-response-time');
      if (responseTimeEl) {
        responseTimeEl.textContent = ''; // مسح زمن الاستجابة
      }


     // إعادة إضافة رسالة الترحيب و/أو الاقتراحات
     setTimeout(() => {
       const welcomeMsg = this.getAttribute('welcome-message') || 'مرحبًا بك مجددًا! كيف يمكنني المساعدة؟';
       this._createBotMessageContainer(welcomeMsg);
       this._addInitialSuggestions(); // إعادة إضافة الاقتراحات
     }, 100); // تأخير بسيط للسماح بمسح الواجهة

     // التأكد من تفعيل حقل الإدخال
     this.chatInput.disabled = false;
     this.sendButton.disabled = true; // تعطيل الإرسال لأن الحقل فارغ
   }

   // --- تبديل حالة النافذة (تبقى كما هي) ---
   toggleChat() {
     console.log('🔘 toggleChat fired! isOpen=', this.isOpen);
     this.isOpen = !this.isOpen;
     if (this.isOpen) {
       this.chatContainer.classList.add('open');
       localStorage.setItem('chatWidgetOpen', 'true');
       // التركيز على حقل الإدخال عند الفتح
       setTimeout(() => this.chatInput.focus(), 300);
     } else {
       this.chatContainer.classList.remove('open');
       localStorage.setItem('chatWidgetOpen', 'false');
     }
   }

   // --- التمرير للأسفل (تبقى كما هي) ---
   _scrollToBottom() {
     // استخدام requestAnimationFrame لتمرير أكثر سلاسة بعد التحديث
     requestAnimationFrame(() => {
          // تأجيل بسيط إضافي للتأكد من اكتمال الـ rendering
         setTimeout(() => {
             this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
         }, 50);
     });
   }

   // --- دوال إدارة معرف الجلسة ---
   _loadSessionId() {
     let id = localStorage.getItem('chatWidgetSessionId');
     if (!id) {
       id = this._generateSessionId();
       localStorage.setItem('chatWidgetSessionId', id);
     }
     console.log("Loaded Session ID:", id);
     return id;
   }

   _generateSessionId() {
     const newId = 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
     console.log("Generated New Session ID:", newId);
     return newId;
   }

   // --- دورة حياة المكون (تحديث بسيط) ---
   connectedCallback() {
     const savedState = localStorage.getItem('chatWidgetOpen');
     if (savedState === 'true') {
       // تأخير بسيط قبل الفتح للسماح بتهيئة كل شيء
       setTimeout(() => this.toggleChat(), 100);
     }
     // تطبيق السمة عند الاتصال
     this._applyDirectionAttribute();
     this._applyDebugAttribute();
   }

   attributeChangedCallback(name, oldValue, newValue) {
     if (oldValue === newValue) return; // لا تفعل شيئًا إذا لم تتغير القيمة

     switch (name) {
       case 'direction':
         this._applyDirectionAttribute();
         break;
      case 'theme':
          // يمكن إضافة تحديثات هنا إذا لزم الأمر عند تغيير الثيم ديناميكيًا
          break;
      case 'title':
          const titleEl = this.shadowRoot.querySelector('.header-title');
          if(titleEl) titleEl.textContent = newValue || 'Chat Assistant';
          break;
      case 'subtitle':
          const subtitleEl = this.shadowRoot.querySelector('.header-subtitle');
          if(subtitleEl) subtitleEl.textContent = newValue || 'Our virtual agent is here to help you';
          break;
      case 'powered-by':
          const poweredByEl = this.shadowRoot.querySelector('.powered-by');
          if(poweredByEl) poweredByEl.textContent = newValue || 'Powered by AI';
          break;
      case 'avatar':
          const avatarEl = this.shadowRoot.querySelector('chat-avatar');
          if(avatarEl) avatarEl.setAttribute('src', newValue || '');
          break;
      case 'debug':
          this._applyDebugAttribute();
          break;
       // يمكن إضافة حالات أخرى للسمات عند الحاجة
     }
   }

   // دالة مساعدة لتطبيق سمة direction
   _applyDirectionAttribute() {
      const dir = this.getAttribute('direction') || 'rtl'; // افتراضي rtl
      // لا حاجة لتطبيقها على this.style.direction مباشرة
      // الأنماط داخل :host([direction="rtl"]) تتعامل معها
      // قد تحتاج لتحديث عناصر أخرى إذا لم تكن تستجيب للـ CSS direction
      const input = this.shadowRoot.querySelector('.chat-input');
      if (input) input.setAttribute('dir', dir);
   }
    // دالة مساعدة لتطبيق سمة debug
   _applyDebugAttribute() {
      const sessionInfo = this.shadowRoot.querySelector('.session-info');
      if (!sessionInfo) return;
      if (this.hasAttribute('debug')) {
          sessionInfo.style.display = 'block';
      } else {
          sessionInfo.style.display = 'none';
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
        apiUrl: 'https://exadoo-rxr9.onrender.com/bot/chat/stream',
        direction: 'rtl',
        avatar: '',
        title: 'Exaado Assistant',
        subtitle: 'Our virtual agent is here to help you',
        poweredBy: 'Powered by EXAADO:exaado.com'
      };

      // دمج الخيارات مع الافتراضية
      const config = { ...defaultOptions, ...options };

      // إنشاء مكون الدردشة
      const chatWidget = document.createElement('chat-widget');

      // تعيين السمات
      Object.entries(config).forEach(([key, value]) => {
      if (value == null || value === '') return;  // نتجنّب السمات الفارغة
      // حوّل camelCase إلى kebab-case
      const attr = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      chatWidget.setAttribute(attr, value);
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
//# sourceMappingURL=widget.js.map
