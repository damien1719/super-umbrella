import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
  $createParagraphNode,
  $isRootOrShadowRoot,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { $insertNodes } from 'lexical';
import { Save } from 'lucide-react';
import { INSERT_TABLE_COMMAND, $createTableCellNode, $createTableNode, $createTableRowNode } from '@lexical/table';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useEditorUi } from '@/store/editorUi';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text';

export function setFontSize(editor: LexicalEditor, size: string) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Utilise des unités en points pour se rapprocher de Word
      $patchStyleText(selection, { 'font-size': `${size}pt` });
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
  // Tailles "Word-like" en points
  const WORD_FONT_SIZES = [
    '8',
    '9',
    '10',
    '11',
    '12',
    '14',
    '16',
    '18',
    '20',
    '22',
    '24',
    '26',
    '28',
    '36',
    '48',
    '72',
  ];

  // Familles proches de Word avec fallbacks web-safe
  const FONT_FAMILIES: { label: string; value: string }[] = [
    { label: 'Calibri', value: "Calibri, 'Helvetica Neue', Arial, sans-serif" },
    { label: 'Cambria', value: "Cambria, Georgia, 'Times New Roman', serif" },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Georgia', value: "Georgia, 'Times New Roman', Times, serif" },
    { label: 'Garamond', value: "Garamond, 'Apple Garamond', 'URW Garamond', serif" },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, Tahoma, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, Verdana, Segoe, sans-serif' },
    {
      label: 'Trebuchet MS',
      value:
        "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif",
    },
    { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  ];

  const [fontSize, setFontSizeState] = useState('11');
  const [fontFamily, setFontFamilyState] = useState(
    "Calibri, 'Helvetica Neue', Arial, sans-serif",
  );
  // Appliquer le style par défaut au focus initial (caret)
  // pour démarrer en Calibri 11pt
  useEffect(() => {
    // au premier rendu, applique la police/taile si caret actif
    setTimeout(() => {
      try {
        setFontFamily(editor, fontFamily);
        setFontSize(editor, fontSize);
      } catch {}
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const selectionSnapshot = useEditorUi((s) => s.selection);

  // État actif des formats
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<'paragraph' | 'h1' | 'h2' | 'h3' | 'quote'>('paragraph');

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
          const anchor = selection.anchor.getNode();
          const topLevel = anchor.getTopLevelElement();
          if (!topLevel || $isRootOrShadowRoot(topLevel)) {
            setBlockType('paragraph');
            return;
          }
          const type = topLevel.getType();
          if (type === 'paragraph') setBlockType('paragraph');
          else if ($isHeadingNode(topLevel)) {
            const tag = topLevel.getTag();
            if (tag === 'h1' || tag === 'h2' || tag === 'h3') setBlockType(tag);
            else setBlockType('paragraph');
          } else if (type === 'quote') setBlockType('quote');
        } else {
          // caret ou autre sélection → tente une lecture via formats actifs du point courant
          setIsBold(false);
          setIsItalic(false);
          setIsUnderline(false);
          setBlockType('paragraph');
        }
      });
    });
    return () => unregister();
  }, [editor]);

  const applyBlockType = useCallback(
    (next: 'paragraph' | 'h1' | 'h2' | 'h3' | 'quote') => {
      setBlockType(next);
      // restaure selection/focus après la déclaration de restoreSelectionAndFocus
      setTimeout(() => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            if (next === 'paragraph')
              $setBlocksType(selection, () => $createParagraphNode());
            else if (next === 'quote')
              $setBlocksType(selection, () => $createQuoteNode());
            else
              $setBlocksType(selection, () => $createHeadingNode(next));
          }
        });
      }, 0);
    },
    [editor],
  );

  const restoreSelectionAndFocus = () => {
    try {
      // Toujours restaurer pour que la saisie suivante hérite des styles
      selectionSnapshot?.restore?.();
    } catch {}
    // Laisser le temps au DOM de rétablir la sélection avant d'appliquer le style
    editor.focus();
  };

  const changeFontSize = useCallback(
    (size: string) => {
      setFontSizeState(size);
      restoreSelectionAndFocus();
      // Appliquer juste après focus/restauration
      setTimeout(() => setFontSize(editor, size), 0);
    },
    [editor, selectionSnapshot],
  );

  const changeFontFamily = useCallback(
    (family: string) => {
      setFontFamilyState(family);
      restoreSelectionAndFocus();
      setTimeout(() => setFontFamily(editor, family), 0);
    },
    [editor, selectionSnapshot],
  );

  const format = useCallback(
    (fmt: 'bold' | 'italic' | 'underline') => {
      // Restaure la sélection avant d'appliquer le format
      restoreSelectionAndFocus();
      setTimeout(() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, fmt), 0);
    },
    [editor, selectionSnapshot],
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

  const insertTable = useCallback(() => {
    restoreSelectionAndFocus();
    setTimeout(() => {
      // Utilise la commande officielle pour insérer un tableau 3x3
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        columns: '3',
        rows: '3',
        includeHeaders: false,
      } as unknown as any);
    }, 0);
  }, [editor]);

  return (
    <div className="sticky top-0 z-10 flex space-x-2 bg-wood-50 border-b border-wood-200 p-2">
      <Select value={blockType} onValueChange={(v) => applyBlockType(v as any)}>
        <SelectTrigger data-testid="block-type" className="w-40">
          <SelectValue placeholder="Style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraphe</SelectItem>
          <SelectItem value="h1">Titre 1</SelectItem>
          <SelectItem value="h2">Titre 2</SelectItem>
          <SelectItem value="h3">Titre 3</SelectItem>
          <SelectItem value="quote">Citation</SelectItem>
        </SelectContent>
      </Select>
      <Select value={fontSize} onValueChange={changeFontSize}>
        <SelectTrigger data-testid="font-size" className="w-24">
          <SelectValue placeholder="Taille" />
        </SelectTrigger>
        <SelectContent>
          {WORD_FONT_SIZES.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={fontFamily} onValueChange={changeFontFamily}>
        <SelectTrigger data-testid="font-family" className="w-44">
          <SelectValue placeholder="Police" />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((f) => (
            <SelectItem key={f.label} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => format('bold')}
        variant="editor"
        active={isBold}
      >
        B
      </Button>
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => format('italic')}
        variant="editor"
        active={isItalic}
      >
        I
      </Button>
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => format('underline')}
        variant="editor"
        active={isUnderline}
      >
        <span style={{ textDecoration: 'underline' }}>U</span>
      </Button>
      <div className="w-px self-stretch bg-wood-200 mx-1" />
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={insertTable}
        variant="editor"
      >
        Tableau 3×3
      </Button>
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => insertList(false)}
        variant="editor"
      >
        •
      </Button>
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => insertList(true)}
        variant="editor"
      >
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
