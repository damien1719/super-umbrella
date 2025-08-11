import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
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
    <div className="sticky top-0 z-10 flex space-x-2 bg-wood-50 border-b border-wood-200 p-2 items-center">
      {/* Heading selector */}
   {/*    <Select onValueChange={(v: 'paragraph'|'h1'|'h2'|'h3') => setBlock(v)} defaultValue="paragraph">
        <SelectTrigger className="w-36 border-none">
          <SelectValue placeholder="Paragraphe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraphe</SelectItem>
          <SelectItem value="h1">Titre H1</SelectItem>
          <SelectItem value="h2">Titre H2</SelectItem>
          <SelectItem value="h3">Titre H3</SelectItem>
        </SelectContent>
      </Select> */}
    
      <Button type="button" onClick={() => format('bold')} variant="editor">
        B
      </Button>
      <Button
        type="button"
        onClick={() => format('italic')}
        variant="editor"
      >
        I
      </Button>
      <Button
        type="button"
        onClick={() => format('underline')}
        variant="editor"
      >
        U
      </Button>
      <Button
        type="button"
        onClick={() => insertList(false)}
        variant="editor"
      >
        •
      </Button>
      <Button
        type="button"
        onClick={() => insertList(true)}
        variant="editor"
      >
        1.
      </Button>

      {onSave && (
        <Button
          type="button"
          onClick={onSave}
          variant="editor"
          aria-label="Save"
        >
          <Save className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
