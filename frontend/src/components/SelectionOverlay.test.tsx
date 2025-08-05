import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SelectionOverlay from './SelectionOverlay';
import { useEditorUi, type SelectionSnapshot } from '@/store/editorUi';

function setupSelection() {
  const snap: SelectionSnapshot = {
    rects: [new DOMRect(10, 20, 30, 40)],
    text: 'demo',
    htmlFragment: '<p>demo</p>',
    restore: vi.fn(),
    clear: vi.fn(),
  };
  useEditorUi.setState({ mode: 'idle', selection: snap, aiBlockId: null });
}

describe('SelectionOverlay', () => {
  it('displays button and switches to refine mode', () => {
    setupSelection();
    render(<SelectionOverlay />);
    const btn = screen.getByText('Refine');
    fireEvent.click(btn);
    expect(useEditorUi.getState().mode).toBe('refine');
  });

  it('hides button when already in refine mode', () => {
    const snap: SelectionSnapshot = {
      rects: [new DOMRect(10, 20, 30, 40)],
      text: 'demo',
      htmlFragment: '<p>demo</p>',
      restore: vi.fn(),
      clear: vi.fn(),
    };
    useEditorUi.setState({ mode: 'refine', selection: snap, aiBlockId: null });
    render(<SelectionOverlay />);
    expect(screen.queryByText('Refine')).toBeNull();
  });
});
