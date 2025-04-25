import './components/chat-button.js';
import './components/chat-message.js';
import './components/suggestions.js';
import './components/typing-indicator.js';
import './components/avatar.js';
import { ChatService } from './services/chat-service.js';

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
    z-index: 9999;
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
;

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
    template.innerHTML =
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
    ;

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

  console.log('Sending message to ' + apiUrl + ' with projectId: ' + projectId + ', sessionId: ' + this.sessionId);

  this.chatService.sendMessage(apiUrl, {
    message,
    session_id: this.sessionId,
    project_id: projectId
  })
  .then(stream => {
    console.log("Stream connection established", stream);
    let fullResponse = '';

    stream.onmessage = (event) => {
      console.log("Received message event:", event);
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
        console.error('Error parsing SSE message:', err, event.data);
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
  console.log('🔘 toggleChat fired! isOpen=', this.isOpen);
  this.isOpen = !this.isOpen;
  if (this.isOpen) {
    this.chatContainer.classList.add('open');
    localStorage.setItem('chatWidgetOpen', 'true');
  } else {
    this.chatContainer.classList.remove('open');
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

export default ChatWidget;