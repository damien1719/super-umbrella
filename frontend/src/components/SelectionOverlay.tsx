import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { useEditorUi } from '@/store/editorUi';
import { Wand2 } from 'lucide-react';

export default function SelectionOverlay() {
  const selection = useEditorUi((s) => s.selection);
  const mode = useEditorUi((s) => s.mode);
  const setMode = useEditorUi((s) => s.setMode);

  if (
    !selection ||
    selection.rects.length === 0 ||
    selection.isCollapsed ||
    mode === 'refine'
  )
    return null;
  const rect = selection.rects[0];
  const style: React.CSSProperties = {
    position: 'absolute',
    top: rect.top + window.scrollY - 36,
    left: rect.left + window.scrollX,
    zIndex: 50,
  };

  return createPortal(
    <Button
      className="gap-2"
      size="sm"
      style={style}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => setMode('refine')}
    >
      <Wand2 className="h-4 w-4" />
      Parler de ce texte
    </Button>,
    document.body,
  );
}
