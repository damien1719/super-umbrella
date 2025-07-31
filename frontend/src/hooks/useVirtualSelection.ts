import { useEffect } from 'react';
import { useEditorUi } from '../store/editorUi';

export function useVirtualSelection(editorRef: React.RefObject<HTMLElement>) {
  const setSelection = useEditorUi((s) => s.setSelection);

  useEffect(() => {
    const onChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const r = sel.getRangeAt(0);
      if (!editorRef.current?.contains(r.commonAncestorContainer)) return;
      if (sel.isCollapsed) return;

      const clone = r.cloneRange();
      const rects = typeof clone.getClientRects === 'function'
        ? Array.from(clone.getClientRects())
        : [];
      const text = sel.toString();

      const htmlFragment = (() => {
        const frag = clone.cloneContents();
        const div = document.createElement('div');
        div.appendChild(frag);
        return div.innerHTML;
      })();

      const restore = () => {
        try {
          const s = window.getSelection();
          s?.removeAllRanges();
          s?.addRange(clone);
          return true;
        } catch {
          return false;
        }
      };

      const clear = () => setSelection(null);

      setSelection({ rects, text, htmlFragment, restore, clear });
    };

    document.addEventListener('selectionchange', onChange);
    return () => document.removeEventListener('selectionchange', onChange);
  }, [editorRef, setSelection]);
}
