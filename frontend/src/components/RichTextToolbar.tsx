import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
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
import { useCallback, useEffect, useState } from 'react';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { Save, FileDown, AlignCenter } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useEditorUi } from '@/store/editorUi';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { $generateHtmlFromNodes } from '@lexical/html';
import DOMPurify from 'dompurify';
import { normalizeBordersForDocx, wrapHtmlForDocx, downloadDocx } from '@/lib/docxExport';
import OverflowToolbar, { type OverflowItem } from './OverflowToolbar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  $createBorderBlockNode,
  $isBorderBlockNode,
  type BorderPreset,
} from '../nodes/BorderBlockNode';

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

export function setLineHeight(editor: LexicalEditor, value: string) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $patchStyleText(selection, { 'line-height': value || null });
    }
  });
}

export function setTextColor(editor: LexicalEditor, color: string | null) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $patchStyleText(selection, { color: color || null });
    }
  });
}

export function setBackgroundColor(
  editor: LexicalEditor,
  color: string | null,
) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $patchStyleText(selection, { 'background-color': color || null });
    }
  });
}

// Bordure de paragraphe: applique/retire une bordure sur l'élément bloc (p/h1/h2/h3/quote)
function setBlockBorderPreset(editor: LexicalEditor, preset: BorderPreset) {
  editor.update(() => {
    const selection = $getSelection();
    if (!selection || !$isRangeSelection(selection)) return;

    // Collect unique top-level elements affected by selection
    const tops = new Set<any>();
    for (const n of selection.getNodes()) {
      const t = (n as any).getTopLevelElement?.();
      if (t && !(t as any).isRoot?.()) tops.add(t);
    }
    if (tops.size === 0) {
      const t = selection.anchor.getNode().getTopLevelElement();
      if (t && !(t as any).isRoot?.()) tops.add(t);
    }

    for (const top of tops) {
      // If already a BorderBlock, update or unwrap
      if ($isBorderBlockNode(top)) {
        if (preset === 'none') {
          // Unwrap: move children out, then remove wrapper
          let child = (top as any).getFirstChild?.();
          while (child) {
            (top as any).insertBefore?.(child);
            child = (top as any).getFirstChild?.();
          }
          (top as any).remove?.();
        } else {
          (top as any).setPreset?.(preset);
        }
        continue;
      }

      // Not a BorderBlock wrapper
      if (preset === 'none') continue;

      // Wrap the current top-level block with a BorderBlockNode
      const wrapper = $createBorderBlockNode(preset);
      // Replace the top with wrapper, then append the original top inside wrapper
      (top as any).replace?.(wrapper);
      (wrapper as any).append?.(top);
    }
  });
}


interface Props {
  onSave?: () => void;
  exportFileName?: string;
}

export function ToolbarPlugin({ onSave, exportFileName }: Props) {
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
    {
      label: 'Garamond',
      value: "Garamond, 'Apple Garamond', 'URW Garamond', serif",
    },
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
  const [lineHeight, setLineHeightState] = useState('1.15');
  // Appliquer le style par défaut au focus initial (caret)
  // pour démarrer en Calibri 11pt
  useEffect(() => {
    // au premier rendu, applique la police/taile si caret actif
    setTimeout(() => {
      try {
        setFontFamily(editor, fontFamily);
        setFontSize(editor, fontSize);
        setLineHeight(editor, lineHeight);
      } catch {}
    }, 0);
  }, []);
  const selectionSnapshot = useEditorUi((s) => s.selection);

  // État actif des formats
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [blockType, setBlockType] = useState<
    'paragraph' | 'h1' | 'h2' | 'h3' | 'quote'
  >('paragraph');

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
          // If selection is inside a BorderBlock wrapper, introspect its first child for block-type display
          const underlying = $isBorderBlockNode(topLevel)
            ? (topLevel as any).getFirstChild?.() || topLevel
            : topLevel;
          const type = underlying.getType();
          if (type === 'paragraph') setBlockType('paragraph');
          else if ($isHeadingNode(underlying)) {
            const tag = (underlying as any).getTag?.();
            if (tag === 'h1' || tag === 'h2' || tag === 'h3') setBlockType(tag);
            else setBlockType('paragraph');
          } else if (type === 'quote') setBlockType('quote');

          // Track alignment (center) state based on element format
          try {
            const formatType = (topLevel as any)?.getFormatType?.() ?? 'left';
            setIsCentered(formatType === 'center');
          } catch {
            setIsCentered(false);
          }
        } else {
          // caret ou autre sélection → tente une lecture via formats actifs du point courant
          setIsBold(false);
          setIsItalic(false);
          setIsUnderline(false);
          setBlockType('paragraph');
          setIsCentered(false);
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
            else $setBlocksType(selection, () => $createHeadingNode(next));
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

  const handleSelectClosed = useCallback(() => {
    // Quand un Select (Radix) se referme, on restaure le caret/focus immédiatement
    setTimeout(() => restoreSelectionAndFocus(), 0);
  }, [restoreSelectionAndFocus]);

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

  const changeLineHeight = useCallback(
    (lh: string) => {
      setLineHeightState(lh);
      restoreSelectionAndFocus();
      setTimeout(() => setLineHeight(editor, lh), 0);
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

  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState('3');
  const [tableCols, setTableCols] = useState('3');
  const insertTable = useCallback(() => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: parseInt(tableCols, 10),
      rows: parseInt(tableRows, 10),
    });
    setShowTableDialog(false);
  }, [editor, tableCols, tableRows]);

  // Helper to attach a tooltip to an element
  const withTooltip = (label: string, node: React.ReactNode) => (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );

  // Build toolbar items for responsive overflow
  const toolbarItems: OverflowItem[] = [];

  toolbarItems.push({
    key: 'block-type',
    element: (
      <Select
        value={blockType}
        onValueChange={(v) =>
          applyBlockType(v as 'paragraph' | 'h1' | 'h2' | 'h3' | 'quote')
        }
        onOpenChange={(open) => !open && handleSelectClosed()}
      >
        <SelectTrigger
          data-testid="block-type"
          className="w-40"
          title="Style de paragraphe"
          aria-label="Style de paragraphe"
        >
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
    ),
  });

  toolbarItems.push({
    key: 'font-size',
    element: (
      <Select
        value={fontSize}
        onValueChange={changeFontSize}
        onOpenChange={(open) => !open && handleSelectClosed()}
      >
        <SelectTrigger
          data-testid="font-size"
          className="w-24"
          title="Taille de police"
          aria-label="Taille de police"
        >
          <SelectValue placeholder="Taille" />
        </SelectTrigger>
        <SelectContent>
          {WORD_FONT_SIZES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
  });

  toolbarItems.push({
    key: 'font-family',
    element: (
      <Select
        value={fontFamily}
        onValueChange={changeFontFamily}
        onOpenChange={(open) => !open && handleSelectClosed()}
      >
        <SelectTrigger
          data-testid="font-family"
          className="w-44"
          title="Police"
          aria-label="Police"
        >
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
    ),
  });

  toolbarItems.push({
    key: 'line-height',
    element: (
      <Select
        value={lineHeight}
        onValueChange={changeLineHeight}
        onOpenChange={(open) => !open && handleSelectClosed()}
      >
        <SelectTrigger
          data-testid="line-height"
          className="w-40"
          title="Interligne"
          aria-label="Interligne"
        >
          <SelectValue placeholder="Interligne" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Simple (1.0)</SelectItem>
          <SelectItem value="1.15">1.15</SelectItem>
          <SelectItem value="1.5">1.5</SelectItem>
          <SelectItem value="2">Double (2.0)</SelectItem>
        </SelectContent>
      </Select>
    ),
  });

  toolbarItems.push({
    key: 'bold',
    element: withTooltip(
      'Gras',
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => format('bold')}
        variant="editor"
        active={isBold}
        title="Gras"
        aria-label="Gras"
      >
        B
      </Button>,
    ),
  });

  toolbarItems.push({
    key: 'italic',
    element: withTooltip(
      'Italique',
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => format('italic')}
        variant="editor"
        active={isItalic}
        title="Italique"
        aria-label="Italique"
      >
        I
      </Button>,
    ),
  });

  toolbarItems.push({
    key: 'underline',
    element: withTooltip(
      'Souligné',
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => format('underline')}
        variant="editor"
        active={isUnderline}
        title="Souligné"
        aria-label="Souligné"
      >
        <span style={{ textDecoration: 'underline' }}>U</span>
      </Button>,
    ),
  });

  // Align center toggle
  toolbarItems.push({
    key: 'align-center',
    element: withTooltip(
      'Centrer le texte',
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          // Restore selection, then toggle alignment
          restoreSelectionAndFocus();
          setTimeout(() => {
            try {
              editor.dispatchCommand(
                FORMAT_ELEMENT_COMMAND,
                isCentered ? 'left' : 'center',
              );
            } catch {}
          }, 0);
        }}
        variant="editor"
        active={isCentered}
        aria-label="Centrer"
        title="Centrer le texte"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>,
    ),
  });

  toolbarItems.push({
    key: 'sep-1',
    element: <div className="w-px self-stretch bg-wood-200 mx-1" />,
  });

  if (onSave) {
    toolbarItems.push({
      key: 'save',
      element: withTooltip(
        'Enregistrer',
        <Button
          type="button"
          onClick={onSave}
          variant="editor"
          aria-label="Enregistrer"
          title="Enregistrer"
        >
          <Save className="w-4 h-4" />
        </Button>,
      ),
    });
  }

  toolbarItems.push({
    key: 'export',
    element: withTooltip(
      'Exporter Word',
      <Button
        type="button"
        onClick={async () => {
          let html = '';
          try {
            editor.getEditorState().read(() => {
              const SANITIZE_OPTIONS: DOMPurify.Config = {
                ALLOWED_TAGS: [
                  'a',
                  'b',
                  'i',
                  'u',
                  'em',
                  'strong',
                  'span',
                  'p',
                  'br',
                  'blockquote',
                  'h1',
                  'h2',
                  'h3',
                  'ul',
                  'ol',
                  'li',
                  'table',
                  'thead',
                  'tbody',
                  'tr',
                  'th',
                  'td',
                  'div',
                ],
                ALLOWED_ATTR: [
                  'href',
                  'target',
                  'rel',
                  'colspan',
                  'rowspan',
                  'style',
                  'class',
                ],
                ALLOWED_CSS_PROPERTIES: [
                  'color',
                  'background',
                  'background-color',
                  'text-decoration',
                  'font-size',
                  'font-family',
                  'line-height',
                  'font-weight',
                  'font-style',
                  'border',
                  'border-color',
                  'border-width',
                  'border-style',
                  'border-radius',
                  'padding',
                  'padding-left',
                  'padding-right',
                  'padding-top',
                  'padding-bottom',
                  'margin',
                  'margin-left',
                  'margin-right',
                  'margin-top',
                  'margin-bottom',
                  'vertical-align',
                  'text-align',
                  'width',
                  'height',
                ],
              } as unknown as DOMPurify.Config;
              html = DOMPurify.sanitize(
                $generateHtmlFromNodes(editor),
                SANITIZE_OPTIONS,
              );
            });
          } catch {}
          // Normalisation spécifique à Word/DOCX
          html = normalizeBordersForDocx(html);
          const fullHtml = wrapHtmlForDocx(html, {
            fontFamily,
            fontSizePt: fontSize,
            lineHeight,
          });
          try {
            await downloadDocx(fullHtml, `${exportFileName || 'Bilan'}.docx`);
          } catch {
            // ignore for now
          }
        }}
        variant="editor"
        aria-label="Exporter Word"
        title="Exporter en Word (.docx)"
      >
        <FileDown className="w-4 h-4" />
      </Button>,
    ),
  });

  toolbarItems.push({
    key: 'text-color',
    element: (
      <DropdownMenu onOpenChange={(open) => !open && handleSelectClosed()}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="editor"
            aria-label="Couleur du texte"
            title="Couleur du texte"
          >
            Couleur
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {[
            ['Par défaut', null],
            ['Noir', '#000000'],
            ['Gris', '#6B7280'],
            ['Rouge', '#DC2626'],
            ['Orange', '#EA580C'],
            ['Jaune', '#CA8A04'],
            ['Vert', '#16A34A'],
            ['Turquoise', '#14B8A6'],
            ['Bleu', '#2563EB'],
            ['Violet', '#7C3AED'],
          ].map(([label, value]) => (
            <DropdownMenuItem
              key={label as string}
              onClick={() => {
                restoreSelectionAndFocus();
                setTimeout(
                  () => setTextColor(editor, value as string | null),
                  0,
                );
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  backgroundColor: (value as string) || 'transparent',
                  border: '1px solid #e5e7eb',
                  marginRight: 8,
                }}
              />
              {label as string}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  });

  toolbarItems.push({
    key: 'highlight',
    element: (
      <DropdownMenu onOpenChange={(open) => !open && handleSelectClosed()}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="editor"
            aria-label="Surlignage"
            title="Surlignage"
          >
            Surlignage
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {[
            ['Aucun', null],
            ['Jaune', '#FEF08A'],
            ['Vert clair', '#D9F99D'],
            ['Bleu clair', '#BAE6FD'],
            ['Violet clair', '#E9D5FF'],
            ['Rose clair', '#FBCFE8'],
          ].map(([label, value]) => (
            <DropdownMenuItem
              key={label as string}
              onClick={() => {
                restoreSelectionAndFocus();
                setTimeout(
                  () => setBackgroundColor(editor, value as string | null),
                  0,
                );
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  backgroundColor: (value as string) || 'transparent',
                  border: '1px solid #e5e7eb',
                  marginRight: 8,
                }}
              />
              {label as string}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  });

  // Bordure de paragraphe (pleine largeur)
  toolbarItems.push({
    key: 'border',
    element: (
      <DropdownMenu onOpenChange={(open) => !open && handleSelectClosed()}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="editor"
            aria-label="Bordure de paragraphe"
            title="Bordure de paragraphe (pleine largeur)"
          >
            Bordure
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {[
            ['Aucune', 'none'],
            ['Fine', 'thin'],
            ['Moyenne', 'medium'],
            ['Épaisse', 'thick'],
            ['Pointillée', 'dashed'],
          ].map(([label, value]) => (
            <DropdownMenuItem
              key={label as string}
              onClick={() => {
                restoreSelectionAndFocus();
                setTimeout(
                  () =>
                    setBlockBorderPreset(
                      editor,
                      value as 'none' | 'thin' | 'medium' | 'thick' | 'dashed',
                    ),
                  0,
                );
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 36,
                  height: 14,
                  lineHeight: '14px',
                  border:
                    (value as string) === 'none'
                      ? '1px solid transparent'
                      : (value as string) === 'thin'
                        ? '1px solid #000'
                        : (value as string) === 'medium'
                          ? '2px solid #000'
                          : (value as string) === 'thick'
                            ? '3px solid #000'
                            : '1px dashed #000',
                  borderRadius: 2,
                  marginRight: 8,
                }}
              />
              {label as string}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  });

  toolbarItems.push({
    key: 'sep-2',
    element: <div className="w-px self-stretch bg-wood-200 mx-1" />,
  });

  toolbarItems.push({
    key: 'table',
    element: (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="editor"
            title="Insérer un tableau"
            aria-label="Insérer un tableau"
          >
            +Tableau
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowTableDialog(true)}>
            Tableau
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  });

  toolbarItems.push({
    key: 'ul',
    element: withTooltip(
      'Liste à puces',
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => insertList(false)}
        variant="editor"
        title="Liste à puces"
        aria-label="Liste à puces"
      >
        •
      </Button>,
    ),
  });

  toolbarItems.push({
    key: 'ol',
    element: withTooltip(
      'Liste numérotée',
      <Button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => insertList(true)}
        variant="editor"
        title="Liste numérotée"
        aria-label="Liste numérotée"
      >
        1.
      </Button>,
    ),
  });

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <OverflowToolbar
        items={toolbarItems}
        className="sticky top-0 z-10 bg-wood-50 border-b border-wood-200 p-2"
        />
      </TooltipProvider>
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insérer un tableau</DialogTitle>
          </DialogHeader>
          <div className="flex space-x-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="table-rows">Lignes</Label>
              <Input
                id="table-rows"
                type="number"
                min="1"
                value={tableRows}
                onChange={(e) => setTableRows(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="table-cols">Colonnes</Label>
              <Input
                id="table-cols"
                type="number"
                min="1"
                value={tableCols}
                onChange={(e) => setTableCols(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={insertTable}>
              Insérer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
