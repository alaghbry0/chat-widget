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
        throw new Error(HTTP error! status: ${response.status});
      }

      // إنشاء قارئ دفق لمعالجة استجابة SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // إنشاء كائن مماثل لـ EventSource للتوافق مع بقية الكود
      const eventSourceMock = {
        listeners: {
          message: [],
          error: [],
          open: []
        },

        onmessage: null,
        onerror: null,
        onopen: null,

        addEventListener(event, callback) {
          this.listeners[event].push(callback);
        },

        removeEventListener(event, callback) {
          const index = this.listeners[event].indexOf(callback);
          if (index !== -1) {
            this.listeners[event].splice(index, 1);
          }
        },

        close() {
          reader.cancel();
        }
      };

      // قراءة الدفق وإطلاق الأحداث
      this._processStream(reader, decoder, eventSourceMock);

      // تشغيل حدث open
      setTimeout(() => {
        if (eventSourceMock.onopen) {
          eventSourceMock.onopen();
        }
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
  async _processStream(reader, decoder, eventSource) {
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          console.log("Stream ended");
          break;
        }

        // إضافة البيانات الجديدة إلى المخزن المؤقت
        buffer += decoder.decode(value, { stream: true });

        // معالجة الأحداث المكتملة من المخزن المؤقت
        const lines = buffer.split('\n');
        buffer = this._processEventLines(lines, buffer, eventSource);
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      if (eventSource.onerror) {
        eventSource.onerror(error);
      }
    }
  }

  /**
   * معالجة سطور الأحداث وإطلاق أحداث المستمع
   */
  _processEventLines(lines, buffer, eventSource) {
    let eventType = 'message';
    let data = '';
    let eventIdBuffer = '';
    let remainingBuffer = '';

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];

      // تجاوز السطور الفارغة
      if (line === '') {
        // نهاية الحدث، إطلاق حدث
        if (data) {
          // إنشاء كائن الحدث
          const event = {
            data,
            type: eventType,
            lastEventId: eventIdBuffer
          };

          // استدعاء معالج الحدث المقابل
          if (eventSource.onmessage && eventType === 'message') {
            eventSource.onmessage(event);
          } else if (eventSource['on' + eventType]) {
            eventSource['on' + eventType](event);
          }

          // إعادة ضبط للحدث التالي
          eventType = 'message';
          data = '';
        }
        continue;
      }

      // تحليل سطر الحدث
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data = line.slice(5).trim();
      } else if (line.startsWith('id:')) {
        eventIdBuffer = line.slice(3).trim();
      } else if (line.startsWith(':')) {
        // تعليق، تجاهل
      } else {
        // حفظ السطور غير المكتملة
        remainingBuffer += line + '\n';
      }
    }

    // إرجاع أي سطور متبقية للمعالجة اللاحقة
    return remainingBuffer + lines[lines.length - 1];
  }
}
