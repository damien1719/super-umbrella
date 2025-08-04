import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { useEditorUi } from '@/store/editorUi';

export default function SelectionOverlay() {
  const selection = useEditorUi((s) => s.selection);
  const setMode = useEditorUi((s) => s.setMode);

  if (!selection || selection.rects.length === 0) return null;
  const rect = selection.rects[0];
  const style: React.CSSProperties = {
    position: 'absolute',
    top: rect.top + window.scrollY - 36,
    left: rect.left + window.scrollX,
    zIndex: 50,
  };

  return createPortal(
    <Button size="sm" style={style} onClick={() => setMode('refine')}>
      Refine
    </Button>,
    document.body,
  );
}
