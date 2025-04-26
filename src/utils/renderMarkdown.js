// src/utils/renderMarkdown.js
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(mdText) {
  // تعطيل تشويش العناوين وتعطيل IDs التلقائية
  const rawHtml = marked(mdText, {
    mangle: false,
    headerIds: false
  });
  // تنقية الـ HTML من أي سكريبتات أو هجمات XSS
  return DOMPurify.sanitize(rawHtml);
}
