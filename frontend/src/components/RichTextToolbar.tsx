import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { INSERT_LINK_COMMAND } from '@lexical/link';
import { useCallback } from 'react';
import { Button } from './ui/button';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const format = useCallback(
    (format: 'bold' | 'italic' | 'underline') => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const insertLink = useCallback(() => {
    const url = prompt('URL');
    if (url) editor.dispatchCommand(INSERT_LINK_COMMAND, url);
  }, [editor]);

  const insertList = useCallback(
    (ordered: boolean) => {
      editor.dispatchCommand(
        ordered ? INSERT_ORDERED_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
        undefined,
      );
    },
    [editor],
  );

  return (
    <div className="mb-2 space-x-2">
      <Button type="button" onClick={() => format('bold')}>
        B
      </Button>
      <Button type="button" onClick={() => format('italic')}>
        I
      </Button>
      <Button type="button" onClick={() => format('underline')}>
        U
      </Button>
      <Button type="button" onClick={() => insertList(false)}>
        •
      </Button>
      <Button type="button" onClick={() => insertList(true)}>
        1.
      </Button>
      <Button type="button" onClick={insertLink}>
        Link
      </Button>
    </div>
  );
}
