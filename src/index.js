// نقطة الدخول الرئيسية للمكتبة
import './chat-widget.js';

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