import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RichTextEditor, { type RichTextEditorHandle } from './RichTextEditor';
import { setFontFamily, setFontSize } from './RichTextToolbar';
import { $getRoot, TextNode, type LexicalEditor } from 'lexical';

describe('RichTextEditor', () => {
  it('loads and exposes JSON editor state', async () => {
    const ref = React.createRef<RichTextEditorHandle>();
    const initialState = {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Hello',
                type: 'text',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };
    const { container } = render(
      <RichTextEditor
        ref={ref}
        initialStateJson={initialState}
        onChange={() => {}}
      />,
    );
    await waitFor(() => expect(ref.current).not.toBeNull());
    const state = ref.current!.getEditorStateJson();
    expect(state).toBeTruthy();
  });

  it('changes font size and family on selection', async () => {
    const initialState = {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Hello',
                type: 'text',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };
    const { container } = render(
      <RichTextEditor initialStateJson={initialState} onChange={() => {}} />,
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
