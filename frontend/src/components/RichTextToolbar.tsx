import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useCallback, useState } from 'react';
import { $patchStyleText } from '@lexical/selection';
import { Save } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function setFontSize(editor: LexicalEditor, size: string) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $patchStyleText(selection, { 'font-size': `${size}px` });
    }
  });
}

export function setFontFamily(editor: LexicalEditor, family: string) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $patchStyleText(selection, { 'font-family': family || null });
    }
  });
}

interface Props {
  onSave?: () => void;
}

export function ToolbarPlugin({ onSave }: Props) {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSizeState] = useState('16');
  const [fontFamily, setFontFamilyState] = useState('default');

  const changeFontSize = useCallback(
    (size: string) => {
      setFontSizeState(size);
      setFontSize(editor, size);
    },
    [editor],
  );

  const changeFontFamily = useCallback(
    (family: string) => {
      setFontFamilyState(family);
      setFontFamily(editor, family === 'default' ? '' : family);
    },
    [editor],
  );

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
    <div className="sticky top-0 z-10 flex space-x-2 bg-wood-50 border-b border-wood-200 p-2">
      <Select value={fontSize} onValueChange={changeFontSize}>
        <SelectTrigger data-testid="font-size">
          <SelectValue placeholder="Taille" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="12">12</SelectItem>
          <SelectItem value="14">14</SelectItem>
          <SelectItem value="16">16</SelectItem>
          <SelectItem value="18">18</SelectItem>
          <SelectItem value="24">24</SelectItem>
          <SelectItem value="32">32</SelectItem>
        </SelectContent>
      </Select>
      <Select value={fontFamily} onValueChange={changeFontFamily}>
        <SelectTrigger data-testid="font-family">
          <SelectValue placeholder="Police" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Défaut</SelectItem>
          <SelectItem value="'Times New Roman'">Times New Roman</SelectItem>
          <SelectItem value="Calibri">Calibri</SelectItem>
          <SelectItem value="Arial">Arial</SelectItem>
        </SelectContent>
      </Select>
      <Button type="button" onClick={() => format('bold')} variant="editor">
        B
      </Button>
      <Button type="button" onClick={() => format('italic')} variant="editor">
        I
      </Button>
      {/*       <Button
        type="button"
        onClick={() => format('underline')}
        variant="editor"
      >
        U
      </Button> */}
      <div className="w-px self-stretch bg-wood-200 mx-1" />
      <Button type="button" onClick={() => insertList(false)} variant="editor">
        •
      </Button>
      <Button type="button" onClick={() => insertList(true)} variant="editor">
        1.
      </Button>
      <div className="w-px self-stretch bg-wood-200 mx-1" />
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
