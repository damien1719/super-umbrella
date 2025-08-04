import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useCallback } from 'react';
import { Save } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  onSave?: () => void;
}

export function ToolbarPlugin({ onSave }: Props) {
  const [editor] = useLexicalComposerContext();

  const format = useCallback(
    (format: 'bold' | 'italic' | 'underline') => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const insertLink = useCallback(() => {
    const url = prompt('URL');
    if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
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
    <div className="sticky top-0 z-10 flex space-x-2 bg-wood-50 border-b border-wood-200 p-2">
      <Button type="button" onClick={() => format('bold')} variant="secondary">
        B
      </Button>
      <Button
        type="button"
        onClick={() => format('italic')}
        variant="secondary"
      >
        I
      </Button>
      <Button
        type="button"
        onClick={() => format('underline')}
        variant="secondary"
      >
        U
      </Button>
      <Button
        type="button"
        onClick={() => insertList(false)}
        variant="secondary"
      >
        •
      </Button>
      <Button
        type="button"
        onClick={() => insertList(true)}
        variant="secondary"
      > 
        1.
      </Button>
      <Button type="button" onClick={insertLink} variant="secondary">
        Link
      </Button>
      {onSave && (
        <Button
          type="button"
          onClick={onSave}
          variant="secondary"
          aria-label="Save"
        >
          <Save className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
