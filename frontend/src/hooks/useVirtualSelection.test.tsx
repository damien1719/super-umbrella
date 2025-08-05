import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useRef } from 'react';
import { useVirtualSelection } from './useVirtualSelection';
import { useEditorUi } from '@/store/editorUi';

function Wrapper() {
  const ref = useRef<HTMLDivElement>(null);
  useVirtualSelection(ref);
  return (
    <div>
      <div ref={ref} data-testid="editor">
        <span>hello</span>
        <span>world</span>
      </div>
    </div>
  );
}

function selectText(node: Node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
  document.dispatchEvent(new Event('selectionchange'));
}

describe('useVirtualSelection', () => {
  beforeEach(() => {
    useEditorUi.setState({ mode: 'idle', selection: null, aiBlockId: null });
  });

  afterEach(() => {
    window.getSelection()?.removeAllRanges();
  });

  it('clears selection when clicking away in idle mode', () => {
    const { getByTestId } = render(<Wrapper />);
    const spans = getByTestId('editor').querySelectorAll('span');
    selectText(spans[1]);
    expect(useEditorUi.getState().selection?.text).toBe('world');
    window.getSelection()?.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange'));
    expect(useEditorUi.getState().selection).toBeNull();
  });

  it('keeps and updates selection in refine mode', () => {
    useEditorUi.setState({ mode: 'refine', selection: null, aiBlockId: null });
    const { getByTestId } = render(<Wrapper />);
    const spans = getByTestId('editor').querySelectorAll('span');
    selectText(spans[1]);
    expect(useEditorUi.getState().selection?.text).toBe('world');
    window.getSelection()?.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange'));
    expect(useEditorUi.getState().selection?.text).toBe('world');
    selectText(spans[0]);
    expect(useEditorUi.getState().selection?.text).toBe('hello');
  });
});
