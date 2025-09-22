import { toDocxBlob } from './htmlDocx';

// Normalise les bordures et certaines propriétés CSS pour une meilleure compatibilité Word/DOCX
export function normalizeBordersForDocx(html: string): string {
  try {
    const container = document.createElement('div');
    container.innerHTML = html;
    // Ensure tables collapse borders so Word won't render doubles
    const tables = container.querySelectorAll<HTMLTableElement>('table');
    tables.forEach((table) => {
      const current = table.getAttribute('style') || '';
      const hasCollapse = /border-collapse\s*:/i.test(current);
      const hasSpacing = /border-spacing\s*:/i.test(current);
      const next = [
        current.trim(),
        !hasCollapse ? 'border-collapse: collapse' : '',
        !hasSpacing ? 'border-spacing: 0' : '',
      ]
        .filter(Boolean)
        .join('; ');
      if (next) table.setAttribute('style', next);
    });
    const nodes = container.querySelectorAll<HTMLElement>('[style*="border"]');
    nodes.forEach((el) => {
      let style = el.getAttribute('style') || '';
      // Remplace currentColor par une vraie couleur
      if (/currentcolor/i.test(style)) {
        const colorMatch = /color\s*:\s*([^;]+)/i.exec(style);
        const color = (colorMatch ? colorMatch[1] : '#000000').trim();
        style = style.replace(/currentcolor/gi, color);
      }
      // Forcer inline-block pour les SPAN avec bordure
      const tag = el.tagName.toUpperCase();
      if (tag === 'SPAN' && !/display\s*:\s*inline-block/i.test(style)) {
        style = `${style.trim()}${style.trim() ? '; ' : ''}display: inline-block`;
      }
      // Convertir px -> pt pour compatibilité Word
      const pxToPt = (px: number) => (px * 0.75).toFixed(2);
      style = style.replace(
        /(border(?:-left|-right|-top|-bottom)?-width\s*:\s*)(\d+(?:\.\d+)?)px/gi,
        (_, p1, px) => `${p1}${pxToPt(parseFloat(px))}pt`,
      );
      style = style.replace(
        /(border\s*:\s*)(\d+(?:\.\d+)?)px/gi,
        (_, p1, px) => `${p1}${pxToPt(parseFloat(px))}pt`,
      );
      style = style.replace(
        /(padding(?:-left|-right|-top|-bottom)?\s*:\s*)(\d+(?:\.\d+)?)px/gi,
        (_, p1, px) => `${p1}${pxToPt(parseFloat(px))}pt`,
      );
      style = style.replace(
        /(padding\s*:\s*)([^;]+)/gi,
        (_, p1, vals) =>
          `${p1}${vals.replace(/(\d+(?:\.\d+)?)px/gi, (_, v) => `${pxToPt(parseFloat(v))}pt`)}`,
      );
      el.setAttribute('style', style);
    });
    return container.innerHTML;
  } catch {
    return html;
  }
}

export function wrapHtmlForDocx(
  html: string,
  opts?: {
    fontFamily?: string;
    fontSizePt?: string | number;
    lineHeight?: string;
  },
): string {
  const fontFamily =
    opts?.fontFamily ?? "Calibri, 'Helvetica Neue', Arial, sans-serif";
  const fontSize = `${opts?.fontSizePt ?? 11}`;
  const lineHeight = opts?.lineHeight ?? '1.5';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta http-equiv="x-ua-compatible" content="ie=edge"/><style>
    body { font-family: ${fontFamily}; font-size: ${fontSize}pt; line-height: ${lineHeight}; }
    p { margin: 0 0 8px 0; }
    h1 { font-size: 16pt; margin: 12pt 0 8pt; font-weight: normal; text-decoration: none; }
    h2 { font-size: 14pt; margin: 10pt 0 6pt; font-weight: bold; text-decoration: underline; }
    h3 { font-size: 12pt; margin: 8pt 0 6pt; font-weight: normal; text-decoration: underline; }
    ul, ol { margin: 0 0 8px 24px; }
    li { margin: 4px 0; }
    /* Ensure Word renders tables with single borders like in Lexical */
    table { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    th, td { border: 0.75pt solid #000; padding: 4pt; vertical-align: top; word-break: break-word; }
    th:empty::before, td:empty::before { content: '\\00a0'; }
  </style></head><body>${html}</body></html>`;
}

export async function downloadDocx(fullHtml: string, fileName: string) {
  const blob = await toDocxBlob(fullHtml);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
