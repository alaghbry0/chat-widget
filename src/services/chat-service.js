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
  sendMessage(url, data) {
    return new Promise((resolve, reject) => {
      // التحقق من دعم المتصفح لـ EventSource
      if (!window.EventSource) {
        reject(new Error('المتصفح الحالي لا يدعم EventSource. يرجى تحديث المتصفح.'));
        return;
      }

      // إنشاء عنوان URL للاتصال مع تضمين المعاملات
      const queryParams = new URLSearchParams();
      for (const key in data) {
        queryParams.append(key, data[key]);
      }

      const fullUrl = `${url}?${queryParams.toString()}`;

      try {
        // إنشاء اتصال SSE
        const eventSource = new EventSource(fullUrl);

        // التحقق من نجاح الاتصال
        eventSource.onopen = () => {
          resolve(eventSource);
        };

        // معالجة أخطاء الاتصال
        eventSource.onerror = (error) => {
          eventSource.close();
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * إرسال رسالة باستخدام طريقة POST (كبديل لـ SSE)
   * عندما لا يتوفر دعم SSE أو عند الحاجة لارسال بيانات POST
   * @param {string} url
   * @param {Object} data
   */
  async postMessage(url, data) {
    try {
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      return this._processStream(reader, decoder);
    } catch (error) {
      console.error('Error in postMessage:', error);
      throw error;
    }
  }

  /**
   * معالجة الدفق
   * @param {ReadableStreamDefaultReader} reader
   * @param {TextDecoder} decoder
   */
  async _processStream(reader, decoder) {
    let buffer = '';

    const processEvents = async () => {
      const { value, done } = await reader.read();
      if (done) return null;

      buffer += decoder.decode(value, { stream: true });

      // معالجة الأحداث
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      return events.map(event => {
        const lines = event.split('\n');
        const parsedEvent = {};

        lines.forEach(line => {
          if (line.startsWith('event: ')) {
            parsedEvent.type = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              parsedEvent.data = JSON.parse(line.slice(6).trim());
            } catch (e) {
              parsedEvent.data = line.slice(6).trim();
            }
          }
        });

        return parsedEvent;
      });
    };

    return {
      async next() {
        return await processEvents();
      },
      close() {
        reader.cancel();
      }
    };
  }
}