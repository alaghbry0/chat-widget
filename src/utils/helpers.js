// src/utils/helpers.js

/**
 * دوال مساعدة عامة للمكتبة
 */

/**
 * توليد معرف فريد
 * @return {string} معرف فريد
 */
export function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * تنقية مدخلات المستخدم لمنع XSS
 * @param {string} input النص المدخل
 * @return {string} النص المنقى
 */
export function sanitizeInput(input) {
  if (!input) return '';

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * اكتشاف اتجاه النص (RTL أو LTR)
 * @param {string} text النص
 * @return {string} الاتجاه ('rtl' أو 'ltr')
 */
export function detectTextDirection(text) {
  // نمط للحروف العربية والفارسية والعبرية
  const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;

  return rtlChars.test(text) ? 'rtl' : 'ltr';
}

/**
 * تنسيق التاريخ والوقت
 * @param {Date} date كائن التاريخ
 * @return {string} التاريخ المنسق
 */
export function formatDateTime(date) {
  if (!date) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // تنسيق الوقت
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  // مقارنة التاريخ
  if (dateOnly.getTime() === today.getTime()) {
    return `اليوم ${timeStr}`;
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return `الأمس ${timeStr}`;
  } else {
    // التاريخ الكامل لأي يوم آخر
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${timeStr}`;
  }
}

/**
 * تحويل النص إلى HTML مع دعم الماركداون البسيط
 * @param {string} text النص المراد تحويله
 * @return {string} النص بصيغة HTML
 */
export function markdownToHtml(text) {
  if (!text) return '';

  // تنقية النص أولاً
  let html = sanitizeInput(text);

  // تحويل الروابط
  html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

  // تحويل **نص غامق**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // تحويل *نص مائل*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // تحويل `كود`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // تحويل كتل الكود ```code```
  html = html.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');

  // تحويل القوائم
  const lines = html.split('\n');
  let inList = false;

  html = lines.map((line) => {
    if (line.trim().startsWith('- ')) {
      if (!inList) {
        inList = true;
        return '<ul><li>' + line.trim().substring(2) + '</li>';
      }
      return '<li>' + line.trim().substring(2) + '</li>';
    } else if (inList) {
      inList = false;
      return '</ul>' + line;
    } else {
      return line;
    }
  }).join('\n');

  if (inList) {
    html += '</ul>';
  }

  // تحويل المسافات البادئة إلى علامات <br>
  html = html.replace(/\n/g, '<br>');

  return html;
}