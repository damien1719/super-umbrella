import { render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import RichTextEditor, { type RichTextEditorHandle } from './RichTextEditor';

describe('RichTextEditor', () => {
  it('converts markdown to HTML when inserting', async () => {
    const ref = React.createRef<RichTextEditorHandle>();
    const { container } = render(
      <RichTextEditor ref={ref} initialHtml="" onChange={() => {}} />,
    );
    await waitFor(() => expect(ref.current).not.toBeNull());
    ref.current!.insertHtml('**bold**');
    await waitFor(() => {
      const textbox = container.querySelector('[contenteditable="true"]');
      expect(textbox?.innerHTML).toMatch(/<strong[^>]*>bold<\/strong>/);
    });
  });
});
