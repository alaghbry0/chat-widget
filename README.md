# واجهة دردشة قابلة للتضمين (Embeddable Chat Widget)

مكتبة واجهة دردشة قابلة للتضمين بسهولة في أي موقع ويب، مبنية باستخدام Web Components مع دعم كامل للغة العربية (RTL).

## المميزات

- ✅ قابلة للتضمين في أي موقع ويب بغض النظر عن إطار العمل المستخدم
- ✅ دعم كامل للغة العربية والتوجيه من اليمين إلى اليسار (RTL)
- ✅ تصميم متجاوب ومتوافق مع الهواتف المحمولة
- ✅ دعم SSE (Server-Sent Events) للردود الحية
- ✅ إمكانية تخصيص المظهر والسمات
- ✅ دعم الوضع المظلم (Dark Mode)
- ✅ عزل الأنماط عن طريق Shadow DOM
- ✅ سهولة التكامل مع أي API للدردشة

## التركيب

### الطريقة 1: استخدام CDN (الأسهل)

أضف هذا الكود في نهاية صفحة HTML الخاصة بك قبل إغلاق وسم `</body>`:

```html
<script>
  (function(){
    const script = document.createElement('script');
    script.src = 'https://cdn.yourdomain.com/widget.min.js';
    script.onload = () => {
      window.ChatWidget.init({
        projectId: 'YOUR_PROJECT_ID',
        theme: 'light',
        position: 'bottom-right',
        direction: 'rtl'
      });
    };
    document.body.appendChild(script);
  })();
</script>#   c h a t - w i d g e t  
 