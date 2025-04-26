
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
    --header-bg: #467df2;
    --text-color: #333;
    --text-secondary: #666;
    --message-bg-user: linear-gradient(180deg, #007BFF, #0056B3);
    --message-color-user: #fff;
    --message-bg-bot: linear-gradient(180deg, #F8F9FA, #FFFFFF);
    --message-color-bot: #666;
    --border-color: #f7eded;
    --footer-bg: rgba(249, 250, 251, 0.8);
    --bubble-size: 56px;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    --header-dark: #1F2937;

    font-family: Roboto, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    position: fixed;
    z-index: 9999;
    box-sizing: border-box;
  }

  :host([theme="dark"]) {
    --primary-color: #375FFF;
    --primary-hover: #2D4ECC;
    --bg-color: #F0F0F0;
    --header-bg: #2D2D2D;
    --header-dark: #0F172A;
    --text-color: #fff;
    --text-secondary: #B0B0B0;
    --message-bg-user: linear-gradient(180deg, #375FFF, #2D4ECC);
    --message-color-user: #fff;
    --message-bg-bot: linear-gradient(180deg, #2D2D2D, #1E1E1E);
    --message-color-bot: #E0E0E0;
    --border-color: #3D3D3D;
    --footer-bg: rgba(30, 30, 30, 0.85);
  }

  :host([position="bottom-right"]) .chat-container {
    bottom: calc(var(--bubble-size) + 17px);
    right: 24px;
    left: auto;
  }

  :host([position="bottom-left"]) .chat-container {
    bottom: calc(var(--bubble-size) + 16px);
    left: 24px;
    right: auto;
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
    width: 400px;
    max-width: 90vw;
    height: 85vh;
    background-color: var(--bg-color);
    border-radius: 15px;
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: transform 0.3s ease, opacity 0.3s ease;
    transform: translateY(16px);
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
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  transition: height 0.3s ease;
  transform: translateZ(0); /* تحسين الأداء */
}



/* حساب ارتفاع messages-container مع أخذ الهيدر في الاعتبار */
.messages-container {
  padding-top: 12px;
  height: 100%;
}

  .top-bar {
    height: 55px;
    background-color: var(--header-dark);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
  }

  .top-bar-title {
    color: white;
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }

  .top-bar-actions {
    display: flex;
    gap: 8px;
  }

  .top-bar-button {
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: white;
    opacity: 0.8;
  }

  .top-bar-button:hover {
    opacity: 1;
  }

  .profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    padding: 16px 0;
    transition: transform 0.3s ease, opacity 0.3s ease, max-height 0.3s ease;
    max-height: 150px;
    overflow: hidden;
  }

  .profile-header.hidden {
    max-height: 0;
    padding: 0;
    opacity: 0;
    transform: translateY(-100%);
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
  }

  .header-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color);
    margin: 8px 0 0 0;
  }

  .header-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 8px 0 0 0;
  }

  .messages-container {
    flex: 1;
    padding: 12px 16px;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: var(--bg-color);
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
    border-top-left-radius: 16px;
    border-top-right-radius: 12px;
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
  padding: 12px 16px; /* تقليل padding العلوي والسفلي قليلاً */
  background-color: var(--footer-bg);
  border-top: 1px solid var(--border-color);
  }
    .input-area {
  margin-bottom: 8px; /* إضافة مسافة بين حقل الإدخال والنص السفلي */
}


  .chat-input-wrapper {
  flex: 1;
  display: flex; /* <<< تعديل: استخدام flex لتوزيع العناصر الداخلية */
  align-items: center; /* <<< تعديل: محاذاة العناصر عموديًا في المنتصف */
  position: relative;
  background-color: var(--bg-color); /* أو #F0F0F0 لخلفية رمادية فاتحة */
  border: 2px solid var(--border-color);
  border-radius: 15px;
  padding: 4px 8px 4px 16px; /* <<< تعديل: ضبط الحشو الداخلي */
  gap: 8px; /* مسافة بين العناصر الداخلية */
}


.chat-input {
    width: 100%;
    min-height: 11px;
    max-height: 150px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-color);
    font-size: 14px;
    line-height: 1.4;
    resize: none;
    overflow-y: hidden;
  }

  .chat-input::placeholder {
    color: var(--text-secondary);
  }

  .chat-input::-webkit-scrollbar {
    width: 4px;
  }

  .chat-input::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 4px;
  }


/* --- نمط جديد لزر الميكروفون --- */
.mic-button {
  width: 32px; /* حجم مناسب */
  height: 32px;
  border-radius: 50%;
  background: none; /* بدون خلفية */
  color: var(--text-secondary); /* لون الأيقونة */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.mic-button:hover {
  color: var(--text-color); /* تغيير اللون عند المرور */
}

.mic-button svg {
    width: 18px; /* حجم الأيقونة */
    height: 18px;
}


.send-button {
  width: 36px; /* <<< تعديل: حجم الزر الدائري */
  height: 36px;
  border-radius: 50%;
  /* <<< تعديل: تغيير لون الخلفية ليتناسب مع التصميم الجديد */
  background-color: #E0E0E0; /* لون رمادي فاتح كالمثال */
  /* أو يمكن استخدام متغير CSS إذا كان لديك واحد مناسب */
  /* background-color: var(--border-color); */
  color: var(--text-secondary); /* <<< تعديل: لون الأيقونة الافتراضي */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.send-button:not(:disabled) { /* نمط زر الإرسال عندما يكون فعالاً */
    background-color: var(--primary-color); /* <<< تعديل: العودة للون الأساسي عند التفعيل */
    color: white; /* <<< تعديل: لون الأيقونة عند التفعيل */
}

.send-button:not(:disabled):hover {
  background-color: var(--primary-hover); /* <<< تعديل: لون عند المرور وهو فعال */
}

.send-button:disabled {
  background-color: #E9ECEF; /* لون رمادي فاتح جداً عند التعطيل */
  color: #ADB5BD; /* لون أيقونة باهت */
  opacity: 1; /* لا نحتاج لـ opacity هنا لأننا نغير الألوان */
  cursor: not-allowed;
}

.send-button svg {
  width: 18px;
  height: 18px;
}

/* تمت إعادة تسمية الكلاس وتعديل النمط */
.footer-powered-by {
  text-align: center; /* <<< تعديل: توسيط النص */
  margin-top: 8px; /* مسافة أعلى النص */
  width: 100%; /* يأخذ العرض كامل للتوسيط */
}

/* تعديل نمط النص إذا لزم الأمر */
.powered-by {
  font-size: 12px;
  color: var(--text-secondary);
}

  .typing-bubble {
    background: transparent;
    padding: 0;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: var(--text-secondary);
    border-radius: 50%;
    animation: bounce 1.2s infinite;
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }

  /* Mobile responsive styles */
  @media (max-width: 576px) {
    .chat-container {
      width: 100vw !important;
      max-width: 100vw !important;
      height: 100vh !important;
      right: 0 !important;
      left: 0 !important;
      bottom: 0 !important;
      border-radius: 0;
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    }

    .chat-header, .chat-footer {
      border-radius: 0;
    }

    :host([position="bottom-right"]) .chat-container,
    :host([position="bottom-left"]) .chat-container {
      bottom: 0;
      right: 0;
    }

    .header-title {
      font-size: 16px;
    }

    .header-subtitle {
      font-size: 12px;
    }
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
    this.headerCollapsed = false;
    this.lastScrollPosition = 0;

    // استدعاء التهيئة
    this._initialize();
  }

  static get observedAttributes() {
    return [
      'project-id', 'theme', 'position', 'welcome-message',
      'api-url', 'direction', 'avatar', 'title', 'subtitle', 'powered-by'
    ];
  }

    _resetChat() {
   console.log('🔄 Resetting chat to initial state...');

   // 1. مسح مصفوفة الرسائل
   this.messages = [];

   // 2. إنشاء معرف جلسة جديد
   this.sessionId = this._generateSessionId(true);

   // 3. إعادة بناء الواجهة بالكامل
   this._render(); // يعيد بناء العناصر الداخلية

   // 4. استعادة حالة الرؤية
   if (this.isOpen) {
     if (this.chatContainer) {
       this.chatContainer.classList.add('open');
       console.log('Restored .open class after reset.');
     } else {
       console.error("Chat container not found immediately after render in _resetChat.");
     }
   }

   // --- 5. إعادة ربط المستمعات الداخلية بالعناصر الجديدة ---
   this._setupInternalListeners();

   // 6. إعادة إضافة رسالة الترحيب النصية والاقتراحات
   this._setupInitialChatState();

   console.log("Chat reset complete.");
 }
  // تعديل دالة _render في class ChatWidget

  _initialize() {
   // إنشاء خدمة الدردشة
   this.chatService = new ChatService();
   this.suggestionsElement = null;

   // التهيئة الأساسية للمكون
   this._render(); // 1. بناء الواجهة الأولية
   this._setupComponentListeners(); // 2. ربط المستمعات الخارجية (مرة واحدة)
   this._setupInternalListeners(); // 3. ربط المستمعات الداخلية (لأول مرة)
   this._setupInitialChatState(); // 4. إضافة رسالة الترحيب والاقتراحات

   console.log("Chat widget initialized.");
 }


_render() {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles; // الأنماط المعدلة أدناه

  const template = document.createElement('template');
  template.innerHTML = `
    <div class="chat-container">
      <div class="chat-header">
         <div class="top-bar">
           <chat-avatar
             size="24px"
             src="${this.getAttribute('avatar') || 'src/profile.png'}"
             fallback="${(this.getAttribute('title') || 'Bot').charAt(0)}"
             bg-color="var(--primary-color)">
           </chat-avatar>
           <h4 class="top-bar-title">${this.getAttribute('title') || 'Exaado Assistant'}</h4>
           <div class="top-bar-actions">
             <button class="top-bar-button refresh-btn">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
               </svg>
             </button>
             <button class="top-bar-button close-btn">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M18 6 6 18M6 6l12 12"/>
               </svg>
             </button>
           </div>
         </div>
         </div>

       <div class="messages-container" id="messages" aria-live="polite">
         <div class="welcome-message">
           <chat-avatar
             class="welcome-avatar"
             size="75px"
             src="${this.getAttribute('avatar') || 'src/profile.png'}"
             fallback="${(this.getAttribute('title') || 'Bot').charAt(0)}"
             bg-color="var(--primary-color)">
           </chat-avatar>
           <h3 class="welcome-title">${this.getAttribute('title') || 'Exaado Assistant'}</h3>
           <p class="welcome-subtitle">${this.getAttribute('subtitle') || 'Our virtual agent is here to help you'}</p>
         </div>
         </div>
      <div class="chat-footer">
        <div class="input-area">
          <div class="chat-input-wrapper">
            <textarea class="chat-input" placeholder="Message..." rows="1"></textarea>
            <button class="mic-button" aria-label="Voice input">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
            <button class="send-button" disabled aria-label="Send message">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
        </div>
        <div class="footer-powered-by">
          <span class="powered-by">${this.getAttribute("powered-by") || 'Powered by AI'}</span>
        </div>
      </div>
      </div>

    <chat-button></chat-button>
  `;

  this.shadowRoot.innerHTML = ''; // Clear previous content
  this.shadowRoot.appendChild(styleEl);
  this.shadowRoot.appendChild(template.content.cloneNode(true));

  // إعادة تخزين المراجع للعناصر المهمة بعد التعديل
  this.chatContainer = this.shadowRoot.querySelector('.chat-container');
  this.messagesContainer = this.shadowRoot.querySelector('#messages');
  this.chatInput = this.shadowRoot.querySelector('.chat-input');
  this.sendButton = this.shadowRoot.querySelector('.send-button');
  this.chatButton = this.shadowRoot.querySelector('chat-button');
  this.micButton = this.shadowRoot.querySelector('.mic-button'); // Reference for mic button if needed

  // ... (باقي الكود في _render كما هو، مثل إضافة additionalStyles للترحيب)
    // إضافة الأنماط اللازمة للترحيب (تم تعديل التباعد العلوي)
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
      /* === بداية تعديل الأنماط === */
      .welcome-message {
        display: flex;
        flex-direction: column;
        align-items: center;

        /* --- التعديل هنا: تقليل التباعد العلوي --- */
        padding: 80px 0 10px 0; /* مثال: 30px للأعلى، 20px للأسفل */
        gap: 8px;
        animation: fadeIn 0.5s ease;
      }

      .welcome-avatar {
      margin-bottom: 10px;
         /* لا توجد أنماط خاصة مطلوبة هنا الآن */
      }

      .welcome-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-color);
        margin: 0;
        text-align: center;
      }

      .welcome-subtitle {
        font-size: 14px;
        font-weight: 400;
        color: var(--text-secondary);
        margin: 0;
        text-align: center;
      }
      /* === نهاية تعديل الأنماط === */

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    this.shadowRoot.appendChild(additionalStyles);
}

  _setupComponentListeners() { // تم تغيير الاسم
   console.log('🔗 Setting up component listeners (run once)...'); // للتأكد

   // زر فتح الدردشة الرئيسي (خارج الجزء المعاد رسمه)
   // تأكد من أن chatButton موجود (يجب أن يكون موجودًا بعد أول _render)
   if (this.chatButton) {
       // --- هام: تأكد من عدم إضافة المستمع أكثر من مرة ---
       // طريقة بسيطة: استخدام خاصية للإشارة إلى أنه تم الربط
       if (!this.chatButton._listenerAttached) {
            this.chatButton.addEventListener('click', () => {
                this.toggleChat();
            });
            this.chatButton._listenerAttached = true; // وضع علامة
       }
   } else {
       console.error("Chat button not found for component listener setup.");
   }

   // اختصارات لوحة المفاتيح (على مستوى المستند)
   // --- هام: تأكد من عدم إضافة المستمع أكثر من مرة ---
   if (!document._chatWidgetKeyListenerAttached) {
        document.addEventListener('keydown', (e) => {
            // / لتركيز حقل الإدخال
            // تأكد من أن chatInput موجود ومرئي قبل محاولة التركيز
            if (e.key === '/' && this.isOpen && this.chatInput && document.activeElement !== this.chatInput) {
                e.preventDefault();
                this.chatInput.focus();
            }
            // Esc لإغلاق الدردشة
            if (e.key === 'Escape' && this.isOpen) {
                this.toggleChat();
            }
        });
        document._chatWidgetKeyListenerAttached = true; // وضع علامة
    }

   // --- إزالة الكود الذي تم نقله إلى _setupInternalListeners ---
 }

  // دالة للتعامل مع حدث التمرير
  _handleScroll(event) {
    const currentScrollPosition = this.messagesContainer.scrollTop;

    // إخفاء الهيدر عند التمرير للأسفل
    if (currentScrollPosition > this.lastScrollPosition && currentScrollPosition > 50 && !this.headerCollapsed) {
      this.profileHeader.classList.add('hidden');
      this.headerCollapsed = true;
    }
    // إظهار الهيدر عند التمرير للأعلى
    else if (currentScrollPosition < this.lastScrollPosition && currentScrollPosition < 50 && this.headerCollapsed) {
      this.profileHeader.classList.remove('hidden');
      this.headerCollapsed = false;
    }

    this.lastScrollPosition = currentScrollPosition;
  }

  // دالة التكبير التلقائي لحقل الإدخال
  _autoResizeTextarea() {
    this.chatInput.style.height = 'auto';
    this.chatInput.style.height = (this.chatInput.scrollHeight) + 'px';

    // التأكد من عدم تجاوز الارتفاع الأقصى
    if (this.chatInput.scrollHeight > 150) {
      this.chatInput.style.overflowY = 'auto';
    } else {
      this.chatInput.style.overflowY = 'hidden';
    }
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

  // إنشاء مكون رسالة جديد باستخدام الـ Markdown
  const messageEl = document.createElement('chat-message');
  messageEl.setAttribute('sender', message.sender);
  messageEl.setAttribute('message-id', id);
  messageEl.setAttribute('data-md', message.content); // استخدام سمة data-md للمحتوى

  // دائماً إضافة صورة الـ avatar مع رسائل البوت
  if (message.sender === 'bot') {
    messageEl.setAttribute('avatar', this.getAttribute('avatar') || '');
    messageEl.setAttribute('show-avatar', 'true');  // سمة جديدة للتحكم في إظهار الصورة
  }

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

    // مسح حقل الإدخال وتعطيل الزر
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto'; // إعادة ضبط ارتفاع الحقل
    this.sendButton.disabled = true;

    // إظهار مؤشر الكتابة الأولي
    this._showTypingIndicator();

    // إرسال الرسالة إلى الخادم
    const apiUrl = this.getAttribute('api-url');
    const projectId = this.getAttribute('project-id');

    console.log(`Sending message to ${apiUrl} with projectId: ${projectId}, sessionId: ${this.sessionId}`);

    this.chatService.sendMessage(apiUrl, {
      message,
      session_id: this.sessionId,
      project_id: projectId
    })
    .then(stream => {
      console.log("Stream connection established", stream);
      let fullResponse = '';
      let liveMessageElement = null; // متغير لتخزين مرجع للرسالة الحية

      stream.onmessage = (event) => {
        // --- التعامل مع قطع البيانات فقط ---
        if (event.type === 'chunk') {
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (err) {
            console.error('Invalid JSON in chunk:', err, event.data);
            return;
          }

          if (data.content) {
            // إخفاء مؤشر الكتابة الأولي عند استلام أول قطعة بيانات
            if (!liveMessageElement) {
              this._hideTypingIndicator(); // إخفاء النقاط ...
              // إنشاء عنصر الرسالة الحية مرة واحدة فقط
              liveMessageElement = this._createLiveMessageElement();
            }

            // بناء الرسالة الحية تدريجياً
            fullResponse += data.content;
            if (liveMessageElement && typeof liveMessageElement.updateContent === 'function') {
              liveMessageElement.updateContent(fullResponse);
            } else if (liveMessageElement) {
              console.warn('liveMessageElement.updateContent is not a function. Falling back to textContent.');
              liveMessageElement.textContent = fullResponse;
            }
            this._scrollToBottom();
          }
        }
        // --- معالجة نهاية البث ---
        else if (event.type === 'end') {
          console.log("Stream ended.");

          // استبدال الرسالة الحية بالنهائية أو إضافتها مباشرة
          if (liveMessageElement) {
            this._hideTypingIndicator(); // تأكد من إخفاء المؤشر هنا أيضاً
          } else if (fullResponse) {
            // حالة نادرة: حدث 'end' بدون 'chunk' ولكن مع استجابة
            this._hideTypingIndicator(); // تأكد من إخفاء المؤشر هنا أيضاً
            this._addMessage({
              content: fullResponse,
              sender: 'bot'
            });
          } else {
            this._hideTypingIndicator();
          }

          // إعادة تهيئة المتغيرات وتمكين الإدخال
          liveMessageElement = null;
          fullResponse = '';
          this.sendButton.disabled = false;
        }
        // --- معالجة الأخطاء المرسلة من الخادم ---
        else if (event.type === 'error') {
          // يمكن أن نستفيد هنا من بيانات JSON أيضاً إذا كانت موجودة
          let errMsg = 'عذراً، حدث خطأ في الخادم.';
          try {
            const parsed = JSON.parse(event.data);
            errMsg = parsed.message || errMsg;
          } catch {
            // إذا لم تكن JSON، نستخدم النص كما هو
            errMsg = event.data || errMsg;
          }
          console.error('Error message from stream:', errMsg);
          this._handleStreamError(errMsg, liveMessageElement);
          liveMessageElement = null;
          fullResponse = '';
          this.sendButton.disabled = false;
        }
        // --- تجاهل أنواع أحداث أخرى مثل tool_call, debug، إلخ. ---
        else {
          console.log(`Ignoring event type: ${event.type}`);
        }
      };

      stream.onerror = (err) => {
        console.error('SSE Connection Error:', err);
        this._handleStreamError('عذراً، حدث خطأ في الاتصال بالبث المباشر.', liveMessageElement);
        liveMessageElement = null; // Reset on error
        fullResponse = '';
        this.sendButton.disabled = false;
      };

      stream.onclose = () => {
        console.log("SSE Stream closed");
        // التعامل مع حالة إغلاق البث قبل وصول حدث 'end'
        if (liveMessageElement) {
          console.warn("Stream closed unexpectedly before 'end'. Finalizing message.");
          // نحول الرسالة الحية إلى رسالة نهائية بإزالتها وإضافة النسخة النهائية
          liveMessageElement.remove();
          this._addMessage({ content: fullResponse, sender: 'bot' });
        }
        this._hideTypingIndicator(); // التأكد من إخفاء المؤشر
        liveMessageElement = null;
        this.sendButton.disabled = false;
      };
    })
    .catch(err => {
      console.error('Failed to initiate stream connection:', err);
      this._hideTypingIndicator();
      this._addMessage({
        content: 'عذراً، تعذر الاتصال بالخادم. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
        sender: 'bot',
        isError: true
      });
      this.sendButton.disabled = false;
    });
  }

  // دالة مساعدة لإنشاء عنصر الرسالة الحية
  _createLiveMessageElement() {
    this.isTyping = true;

    const liveMessage = document.createElement('chat-message');
    liveMessage.setAttribute('sender', 'bot');
    liveMessage.setAttribute('id', 'live-message');
    liveMessage.setAttribute('data-md', ''); // بداية بمحتوى فارغ للماركداون
    if (this.getAttribute('avatar')) {
      liveMessage.setAttribute('avatar', this.getAttribute('avatar'));
    }
    this.messagesContainer.appendChild(liveMessage);
    this._scrollToBottom();
    return liveMessage;
  }

  // دالة مساعدة موحدة لمعالجة أخطاء البث
  _handleStreamError(errorMessage, liveElement) {
    this._hideTypingIndicator();
    if (liveElement) {
      liveElement.remove();
    }
    this._addMessage({
      content: errorMessage,
      sender: 'bot',
      isError: true
    });
    this.sendButton.disabled = false;
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
        'كيف يمكنني التواصل مع الدعم؟',
      'كيف يمكنني الاشتراك في كورس الزمني؟'
      ];
      this.messagesContainer.appendChild(suggestionsEl);
    }, 300);
  }

   _setupInitialChatState() {
   // إضافة رسالة الترحيب والاقتراحات بعد تأخير بسيط
   setTimeout(() => {
     // التأكد من أن حاوية الرسائل موجودة بعد إعادة الرسم المحتملة
     if (!this.messagesContainer) {
       console.error("Messages container not found after reset.");
       return;
     }

     // إزالة أي رسالة ترحيب نصية قديمة أو اقتراحات إذا وجدت (احتياطي)
     const existingWelcomeMsg = this.messagesContainer.querySelector('chat-message[sender="bot"]');
     const existingSuggestions = this.messagesContainer.querySelector('chat-suggestions');
     if (existingWelcomeMsg && this.messages.length === 0) existingWelcomeMsg.remove(); // فقط إذا كانت الرسائل فارغة
     if (existingSuggestions) existingSuggestions.remove();


     // --- الجزء المنقول من _initialize ---
     // إضافة رسالة الترحيب أولاً (كنص)
     this._addMessage({
       content: this.getAttribute('welcome-message') || 'مرحبًا بك! كيف يمكنني مساعدتك اليوم؟',
       sender: 'bot'
     });

     // --- إضافة الاقتراحات هنا ---
     const suggestionsEl = document.createElement('chat-suggestions');
     suggestionsEl.suggestions = [
       'ما هي خدماتكم؟',
       'كيف يمكنني التواصل معكم؟',
       'هل لديكم خدمة توصيل؟'
       // يمكنك تحديث هذه الاقتراحات أو جعلها ديناميكية إذا أردت
     ];
     // تأكد من أن الرسالة الترحيبية تم إضافتها قبل إضافة الاقتراحات
     // قد تحتاج لتأخير بسيط آخر أو استخدام Promise إذا كانت _addMessage غير متزامنة تمامًا
     // لكن بما أنها متزامنة هنا، يمكن إضافتها مباشرة
     this.messagesContainer.appendChild(suggestionsEl);
     this.suggestionsElement = suggestionsEl; // --- تخزين المرجع ---
     this._scrollToBottom(); // التمرير للأسفل بعد إضافة الاقتراحات
     // --- نهاية الجزء المنقول ---

   }, 300); // نفس التأخير المستخدم سابقاً
 }

  toggleChat() {
    console.log('🔘 toggleChat fired! isOpen=', this.isOpen);
    this.isOpen = !this.isOpen;
    if (this.isOpen)  {
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

  _generateSessionId(forceNew = false) {
   // محاولة الحصول على معرف جلسة محفوظ
   const savedSessionId = localStorage.getItem('chatWidgetSessionId');
   if (savedSessionId && !forceNew) { // التحقق من forceNew
     return savedSessionId;
   }

   // إنشاء معرف جديد
   const newSessionId = 'session_' + Math.random().toString(36).substring(2, 15);
   localStorage.setItem('chatWidgetSessionId', newSessionId);
   console.log('Generated new session ID:', newSessionId); // للتصحيح
   return newSessionId;
 }


  connectedCallback() {
    // التحقق من حالة النافذة المحفوظة
    const savedState = localStorage.getItem('chatWidgetOpen');
    if (savedState === 'true') {
      setTimeout(() => this.toggleChat(), 300);
    }
  }



 // ===== دالة جديدة لربط الأحداث الداخلية =====
 _setupInternalListeners() {
   console.log('🔗 Setting up internal listeners...'); // للتأكد

   // التأكد من وجود العناصر قبل ربط الأحداث (هام بعد إعادة الرسم)
   if (!this.sendButton || !this.chatInput || !this.messagesContainer || !this.shadowRoot) {
     console.error("One or more internal elements not found for listener setup.");
     return;
   }

   // --- الكود المنقول من _setupEventListeners ---

   // زر إرسال الرسالة
   this.sendButton.addEventListener('click', () => {
     this._sendMessage();
   });

   // الإرسال عند الضغط على Enter (بدون Shift)
   this.chatInput.addEventListener('keydown', (e) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       this._sendMessage();
     }
   });

   // التكبير التلقائي لحقل الإدخال وتمكين/تعطيل زر الإرسال
   this.chatInput.addEventListener('input', () => {
     this._autoResizeTextarea();
     // تأكد من أن sendButton موجود قبل تعديل حالته
     if(this.sendButton) {
        this.sendButton.disabled = !this.chatInput.value.trim();
     }
   });

   // زر الإغلاق (داخل النافذة)
   const closeButtons = this.shadowRoot.querySelectorAll('.close-btn');
   closeButtons.forEach(btn => {
     btn.addEventListener('click', () => {
       this.toggleChat();
     });
   });

   // زر التحديث (داخل النافذة)
   const refreshButton = this.shadowRoot.querySelector('.refresh-btn');
   if (refreshButton) {
     refreshButton.addEventListener('click', () => {
       this._resetChat();
     });
   } else {
     console.warn("Refresh button (.refresh-btn) not found during internal listener setup.");
   }

   // الاستماع لأحداث اقتراحات الدردشة
   this.shadowRoot.addEventListener('suggestion-clicked', (e) => {
     // تأكد من أن chatInput موجود
     if(this.chatInput) {
       const { suggestion } = e.detail;
       this.chatInput.value = suggestion;
       this._autoResizeTextarea();
       this.sendButton.disabled = false; // يجب تفعيل الزر عند اختيار اقتراح
       this._sendMessage();
     }
   });

   // إضافة مستمع للتمرير لإخفاء الهيدر (إذا كنت تستخدمه)
   // لاحظ أن profileHeader قد يحتاج لإعادة الاستعلام عنه إذا كان داخل الجزء المعاد رسمه
   // إذا كان profileHeader خارج messagesContainer في الـ DOM، قد لا تحتاج لإعادة ربط هذا
   // ولكن إذا كان يتم إعادة إنشائه، ستحتاج لإعادة ربط مستمع التمرير.
   // في الكود الحالي، messagesContainer يتم إعادة الاستعلام عنه، لذا المستمع يجب إعادة ربطه.
   this.messagesContainer.addEventListener('scroll', this._handleScroll.bind(this));


   // --- نهاية الكود المنقول ---

    // قم بتعطيل زر الإرسال مبدئيًا بعد إعادة الربط (لأن حقل الإدخال فارغ)
    if (this.sendButton) {
        this.sendButton.disabled = true;
    }
    // أعد ضبط ارتفاع حقل الإدخال
    if (this.chatInput) {
        this.chatInput.style.height = 'auto';
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