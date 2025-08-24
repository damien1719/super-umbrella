import * as React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RichTextEditor, { type RichTextEditorHandle } from './RichTextEditor';
import { setFontFamily, setFontSize } from './RichTextToolbar';
import { $getRoot, TextNode, type LexicalEditor } from 'lexical';
import { $createTableNodeWithDimensions } from '@lexical/table';

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
    render(
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

  it('applies Calibri 11 as default font', async () => {
    const { container } = render(<RichTextEditor onChange={() => {}} />);
    const textbox = container.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement;
    await waitFor(() => expect(textbox).toBeTruthy());
    expect(textbox.style.fontFamily).toContain('Calibri');
    expect(textbox.style.fontSize).toBe('11pt');
  });

  it('inserts a table with chosen dimensions', async () => {
    const { container } = render(<RichTextEditor onChange={() => {}} />);

    fireEvent.click(screen.getByText('+Insert'));
    fireEvent.click(screen.getByText('Tableau'));

    const rowsInput = screen.getByLabelText('Lignes');
    const colsInput = screen.getByLabelText('Colonnes');
    fireEvent.change(rowsInput, { target: { value: '2' } });
    fireEvent.change(colsInput, { target: { value: '3' } });

    fireEvent.click(screen.getByText('Insérer'));

    await waitFor(() => {
      const table = container.querySelector('table');
      expect(table).not.toBeNull();
      const rows = table!.querySelectorAll('tr');
      expect(rows.length).toBe(2);
      expect(rows[0].querySelectorAll('td').length).toBe(3);
    });
  });

  it.skip('manipulates table via context menu', async () => {
    const { container } = render(<RichTextEditor onChange={() => {}} />);
    const textbox = container.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement & { __lexicalEditor: LexicalEditor };
    const editor = textbox.__lexicalEditor;
    await waitFor(() => expect(editor).toBeTruthy());

    editor.update(() => {
      const tableNode = $createTableNodeWithDimensions(2, 2);
      $getRoot().append(tableNode);
    });

    await waitFor(() => {
      const table = container.querySelector('table');
      expect(table).not.toBeNull();
    });

    const getCounts = () => {
      const table = container.querySelector('table')!;
      const rows = table.querySelectorAll('tr').length;
      const cols = table.querySelector('tr')!.querySelectorAll('td').length;
      return { table, rows, cols };
    };

    let { table } = getCounts();
    let cell = table.querySelector('td') as HTMLElement;

    fireEvent.contextMenu(cell);
    fireEvent.click(await screen.findByText('Ajouter ligne'));
    await waitFor(() => expect(getCounts().rows).toBe(3));

    table = getCounts().table;
    cell = table.querySelector('td') as HTMLElement;
    fireEvent.contextMenu(cell);
    fireEvent.click(await screen.findByText('Ajouter colonne'));
    await waitFor(() => expect(getCounts().cols).toBe(3));

    table = getCounts().table;
    cell = table.querySelector('td') as HTMLElement;
    fireEvent.contextMenu(cell);
    fireEvent.click(await screen.findByText('Supprimer ligne'));
    await waitFor(() => expect(getCounts().rows).toBe(2));

    table = getCounts().table;
    cell = table.querySelector('td') as HTMLElement;
    fireEvent.contextMenu(cell);
    fireEvent.click(await screen.findByText('Supprimer colonne'));
    await waitFor(() => expect(getCounts().cols).toBe(2));
  });
});
