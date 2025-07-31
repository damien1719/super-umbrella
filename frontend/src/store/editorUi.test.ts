import { describe, it, expect, vi } from 'vitest';
import { useEditorUi, type SelectionSnapshot } from './editorUi';

describe('useEditorUi', () => {
  it('updates mode and selection', () => {
    const restore = vi.fn();
    const snap: SelectionSnapshot = {
      rects: [],
      text: 't',
      htmlFragment: '<p>t</p>',
      restore,
      clear: vi.fn(),
    };

    useEditorUi.setState({ mode: 'idle', selection: null, aiBlockId: null });
    useEditorUi.getState().setMode('suggest');
    expect(useEditorUi.getState().mode).toBe('suggest');

    useEditorUi.getState().setSelection(snap);
    expect(useEditorUi.getState().selection).toBe(snap);
  });
});
