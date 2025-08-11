import { render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import RichTextEditor, { type RichTextEditorHandle } from './RichTextEditor';
import { setFontFamily, setFontSize } from './RichTextToolbar';
import { $getRoot, TextNode, type LexicalEditor } from 'lexical';

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

  it('changes font size and family on selection', async () => {
    const { container } = render(
      <RichTextEditor initialHtml="<p>Hello</p>" onChange={() => {}} />,
    );
    const textbox = container.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement & {
      __lexicalEditor: LexicalEditor;
    };
    const editor = textbox.__lexicalEditor;
    await waitFor(() => expect(editor).toBeTruthy());

    editor.update(() => {
      const root = $getRoot();
      const paragraph = root.getFirstChild();
      const text = paragraph?.getFirstChild();
      if (text instanceof TextNode) {
        text.select(0, text.getTextContentSize());
      }
    });

    setFontSize(editor, '24');
    setFontFamily(editor, 'Arial');

    await waitFor(() => {
      const span = textbox.querySelector('span');
      expect(span).not.toBeNull();
      expect(span?.getAttribute('style')).toContain('font-size: 24px');
      expect(span?.getAttribute('style')).toContain('font-family: Arial');
    });
  });
});
