// src/services/chat-service.js

/**
 * خدمة الاتصال بالخادم للدردشة باستخدام SSE
 */
export class ChatService {
  /**
   * إرسال رسالة إلى الخادم والحصول على دفق SSE للردود
   * @param {string} url - عنوان URL للخادم
   * @param {Object} data - بيانات الرسالة للإرسال
   * @returns {EventSource} - موجّه أحداث SSE
   */
  async sendMessage(url, data) {
    try {
      console.log("Sending message to:", url, data);

      // استخدام fetch مع POST بدلاً من EventSource
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

      // إنشاء قارئ دفق لمعالجة استجابة SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // إنشاء كائن مماثل لـ EventSource للتوافق مع بقية الكود
      const eventSourceMock = {
        listeners: {
          message: [],
          chunk: [],
          end: [],
          tool_call: [],
          tool_result: [],
          error: [],
          open: []
        },

        onmessage: null,
        onchunk: null,
        onend: null,
        ontool_call: null,
        ontool_result: null,
        onerror: null,
        onopen: null,
        onclose: null,

        addEventListener(event, callback) {
          if (!this.listeners[event]) {
            this.listeners[event] = [];
          }
          this.listeners[event].push(callback);
        },

        removeEventListener(event, callback) {
          const arr = this.listeners[event] || [];
          const idx = arr.indexOf(callback);
          if (idx !== -1) arr.splice(idx, 1);
        },

        close() {
          reader.cancel().then(() => {
            // تنفيذ حدث الإغلاق
            if (this.onclose) {
              this.onclose({ type: 'close' });
            }
            (this.listeners.close || []).forEach(cb =>
              cb({ type: 'close' })
            );
          });
        }
      };

      // قراءة الدفق وإطلاق الأحداث
      this._processStream(reader, decoder, eventSourceMock);

      // تشغيل حدث open
      setTimeout(() => {
        if (eventSourceMock.onopen) {
          eventSourceMock.onopen({ type: 'open' });
        }
        (eventSourceMock.listeners.open || []).forEach(cb =>
          cb({ type: 'open' })
        );
      }, 0);

      return eventSourceMock;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  /**
   * معالجة دفق SSE
   * @param {ReadableStreamDefaultReader} reader
   * @param {TextDecoder} decoder
   * @param {Object} eventSource
   */
  _processStream(reader, decoder, eventSource) {
    let buffer = '';
    let pendingRead = null;

    const emitEvent = (type, dataStr, eventId) => {
      try {
        // محاولة تحليل JSON إذا كان البيانات بتنسيق JSON
        const jsonData = JSON.parse(dataStr);
        const ev = {
          data: dataStr,
          type,
          lastEventId: eventId,
          json: jsonData // إضافة البيانات المحللة كـ JSON
        };

        // أولاً handler النوعي أو العام
        const handler = eventSource['on' + type] || eventSource.onmessage;
        if (handler) handler(ev);

        // ثم كل المستمعين المسجلين
        (eventSource.listeners[type] || []).forEach(cb => cb(ev));
      } catch (e) {
        // إذا فشل التحليل، نرسل البيانات كما هي نصياً
        const ev = { data: dataStr, type, lastEventId: eventId };

        // نفس الشيء: handler النوعي أو العام
        const handler = eventSource['on' + type] || eventSource.onmessage;
        if (handler) handler(ev);

        // ثم المستمعين
        (eventSource.listeners[type] || []).forEach(cb => cb(ev));
      }
    };

    const processChunk = (chunk) => {
      // تعديل ليعمل مع مختلف أنواع الفواصل السطرية
      buffer += chunk;

      // تقسيم على الفاصل الفارغ بين الأحداث (سطر فارغ)
      const eventBlocks = buffer.split(/\r?\n\r?\n/);

      // آخر كتلة قد تكون غير مكتملة - نحتفظ بها للقراءة التالية
      buffer = eventBlocks.pop() || '';

      eventBlocks.forEach(eventBlock => {
        if (!eventBlock.trim()) return; // تجاوز الكتل الفارغة

        const lines = eventBlock.split(/\r?\n/);
        let eventType = 'message'; // النوع الافتراضي
        let data = '';
        let eventId = '';

        lines.forEach(line => {
          if (line.startsWith('event:')) {
            eventType = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            data += (data ? '\n' : '') + line.substring(5).trim();
          } else if (line.startsWith('id:')) {
            eventId = line.substring(3).trim();
          } else if (line.startsWith(':')) {
            // تعليق - نتجاهله
          }
        });

        if (data) {
          emitEvent(eventType, data, eventId);
        }
      });
    };

    // دالة تكرارية لقراءة الدفق
    const readNext = () => {
      pendingRead = reader.read().then(({ value, done }) => {
        if (done) {
          // عند انتهاء الدفق، نرسل حدث "end" للتنبيه
          emitEvent('end', '', '');
          return;
        }

        // فك ترميز المحتوى
        const chunk = decoder.decode(value, { stream: true });
        processChunk(chunk);

        // استمر بالقراءة
        return readNext();
      }).catch(err => {
        console.error('Error reading stream:', err);
        emitEvent('error', JSON.stringify({
          message: err.message || 'Error reading stream'
        }), '');
      });

      return pendingRead;
    };

    // ابدأ القراءة
    readNext();
  }
}