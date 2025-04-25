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