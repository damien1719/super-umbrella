import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window as unknown as Window;
const DOMPurify = createDOMPurify(
  window as unknown as createDOMPurify.WindowLike,
);

export const sanitizeHtml = (html: string): string => DOMPurify.sanitize(html);
