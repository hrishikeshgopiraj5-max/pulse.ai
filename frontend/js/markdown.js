/**
 * Pulse AI — Lightweight Markdown Renderer
 *
 * Converts a subset of markdown to HTML for chat message rendering.
 * Supports: headers, bold, italic, inline code, code blocks, lists, links, line breaks.
 * No external dependencies.
 */
const Markdown = (() => {
  'use strict';

  // Escape HTML entities to prevent XSS
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Render inline markdown (bold, italic, code, links)
  function renderInline(text) {
    let result = escapeHtml(text);

    // Inline code (must be before bold/italic to avoid conflicts)
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold + italic
    result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

    // Bold
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
    result = result.replace(/_(.+?)_/g, '<em>$1</em>');

    // Strikethrough
    result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Links [text](url)
    result = result.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    return result;
  }

  // Main render function
  function render(text) {
    if (!text) return '';

    const lines = text.split('\n');
    const html = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Fenced code block (```)
      if (line.trimStart().startsWith('```')) {
        const lang = line.trimStart().slice(3).trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
          codeLines.push(escapeHtml(lines[i]));
          i++;
        }
        i++; // skip closing ```
        const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : '';
        html.push(`<pre><code${langAttr}>${codeLines.join('\n')}</code></pre>`);
        continue;
      }

      // Blank line
      if (line.trim() === '') {
        html.push('');
        i++;
        continue;
      }

      // Headers (### / ## / #)
      const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        html.push(`<h${level}>${renderInline(headerMatch[2])}</h${level}>`);
        i++;
        continue;
      }

      // Horizontal rule
      if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
        html.push('<hr>');
        i++;
        continue;
      }

      // Unordered list
      if (/^\s*[-*+]\s+/.test(line)) {
        const listItems = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          const itemText = lines[i].replace(/^\s*[-*+]\s+/, '');
          listItems.push(`<li>${renderInline(itemText)}</li>`);
          i++;
        }
        html.push(`<ul>${listItems.join('')}</ul>`);
        continue;
      }

      // Ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        const listItems = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          const itemText = lines[i].replace(/^\s*\d+\.\s+/, '');
          listItems.push(`<li>${renderInline(itemText)}</li>`);
          i++;
        }
        html.push(`<ol>${listItems.join('')}</ol>`);
        continue;
      }

      // Blockquote
      if (line.trimStart().startsWith('>')) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trimStart().startsWith('>')) {
          quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        html.push(`<blockquote>${renderInline(quoteLines.join('\n'))}</blockquote>`);
        continue;
      }

      // Regular paragraph — collect consecutive non-empty lines
      const paraLines = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].trimStart().startsWith('```') &&
        !lines[i].trimStart().startsWith('#') &&
        !lines[i].trimStart().startsWith('>') &&
        !/^\s*[-*+]\s+/.test(lines[i]) &&
        !/^\s*\d+\.\s+/.test(lines[i]) &&
        !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        html.push(`<p>${renderInline(paraLines.join('\n'))}</p>`);
      }
    }

    // Collapse multiple blank lines
    return html.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  return { render };
})();
