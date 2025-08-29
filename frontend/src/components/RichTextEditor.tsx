/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useMemo,
  useImperativeHandle,
  useRef,
  forwardRef,
  useEffect,
} from 'react';

// Debug React import
console.log('[RichTextEditor] React import:', React);
console.log('[RichTextEditor] useRef function:', useRef);
console.log('[RichTextEditor] React.useRef:', React?.useRef);
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  $getRoot,
  $getSelection,
  $insertNodes,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
  type LexicalNode,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ToolbarPlugin } from './RichTextToolbar';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import {
  TableNode,
  TableRowNode,
  TableCellNode,
  $isTableNode,
  $isTableSelection,
  $findTableNode,
} from '@lexical/table';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useVirtualSelection } from '../hooks/useVirtualSelection';
import { SlotNode, $createSlotNode, $isSlotNode } from '../nodes/SlotNode';
import { SectionPlaceholderNode, $createSectionPlaceholderNode } from '../nodes/SectionPlaceholderNode';
import type { SlotType, FieldSpec } from '../types/template';
import { scanAndInsertSlots as runScanAndInsertSlots } from '../utils/scanAndInsertSlots';
import TableContextMenuPlugin from './TableContextMenuPlugin';

// Sanitize options that preserve safe inline styles (colors, backgrounds, borders)
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
  // Keep default CSS sanitization and allow common text/table styles
  // Note: DOMPurify will still sanitize CSS values for safety.
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

export interface RichTextEditorHandle {
  importHtml: (html: string) => void;
  insertHtml: (html: string) => void;
  setEditorStateJson: (state: unknown) => void;
  getEditorStateJson?: () => unknown;
  getPlainText?: () => string;
  insertSlot?: (slotId: string, slotLabel: string, slotType: SlotType) => void;
  updateSlot?: (slotId: string, slotLabel: string) => void;
  removeSlot?: (slotId: string) => void;
  scanAndInsertSlots?: (onSlotCreated?: (slot: FieldSpec) => void) => void;
  insertSectionPlaceholder?: (sectionId: string, label: string) => void;
}

// Safe default Lexical state with a non-empty root
const DEFAULT_EMPTY_STATE = {
  root: {
    children: [
      {
        children: [],
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

interface Props {
  initialStateJson?: unknown;
  templateKey?: string;
  readOnly?: boolean;
  onChange?: (html: string) => void;
  onChangeStateJson?: (stateJson: unknown) => void;
  onSave?: () => void;
  exportFileName?: string;
}

// Removed HtmlPlugin and StateJsonPlugin: initial AST is provided via initialConfig.editorState and remount key

const ImperativeHandlePlugin = forwardRef<RichTextEditorHandle, object>(
  function ImperativeHandlePlugin(_, ref) {
    const [editor] = useLexicalComposerContext();

    useImperativeHandle(
      ref,
      () => ({
        importHtml(html: string) {
          editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(
              `<div>${html}</div>`,
              'text/html',
            );

            const nodes = $generateNodesFromDOM(editor, dom);

            // 4. Insérer au curseur ou à la fin
            const selection = $getSelection();
            if (selection) {
              $insertNodes(nodes);
            } else {
              $getRoot().append(...nodes);
            }

            editor.focus();
          });
        },
        insertHtml(html: string) {
          // Backward compatibility: accept Markdown and import as HTML
          editor.update(() => {
            const parser = new DOMParser();
            const mdHtml = marked.parse(html);
            const dom = parser.parseFromString(
              `<div>${mdHtml}</div>`,
              'text/html',
            );
            const nodes = $generateNodesFromDOM(editor, dom);
            const selection = $getSelection();
            if (selection) {
              $insertNodes(nodes);
            } else {
              $getRoot().append(...nodes);
            }
            editor.focus();
          });
        },
        setEditorStateJson(state: unknown) {
          try {
            const stateString =
              typeof state === 'string' ? state.trim() : JSON.stringify(state);
            const next = editor.parseEditorState(stateString);
            editor.setEditorState(next); // pas besoin de editor.update()
          } catch (e) {
            console.error('[Lexical] Failed to set editor state JSON:', e);
          }
        },
        insertSlot(slotId: string, slotLabel: string, slotType: SlotType) {
          editor.update(() => {
            const node = $createSlotNode(
              slotId,
              slotLabel,
              slotType,
              false,
              '…',
            );
            const selection = $getSelection();
            if (selection) {
              $insertNodes([node]);
            } else {
              $getRoot().append(node);
            }
            editor.focus();
          });
        },
        updateSlot(slotId: string, slotLabel: string) {
          editor.update(() => {
            const root = $getRoot();
            const visit = (node: LexicalNode): boolean => {
              const slotCandidate = node as unknown as {
                getSlotId?: () => string;
                setLabel?: (label: string) => void;
                getChildren?: () => LexicalNode[];
              };
              if (
                typeof slotCandidate.getSlotId === 'function' &&
                slotCandidate.getSlotId() === slotId
              ) {
                // Safe mutation using node API
                slotCandidate.setLabel?.(slotLabel);
                return true;
              }
              if (typeof slotCandidate.getChildren === 'function') {
                for (const child of slotCandidate.getChildren()) {
                  if (visit(child)) return true;
                }
              }
              return false;
            };
            visit(root);
          });
        },
        removeSlot(slotId: string) {
          editor.update(() => {
            const root = $getRoot();
            const visit = (node: LexicalNode): boolean => {
              const slotCandidate = node as unknown as {
                getSlotId?: () => string;
                remove?: () => void;
                getChildren?: () => LexicalNode[];
              };
              if (
                typeof slotCandidate.getSlotId === 'function' &&
                slotCandidate.getSlotId() === slotId
              ) {
                // Safe mutation using node API
                slotCandidate.remove?.();
                return true;
              }
              if (typeof slotCandidate.getChildren === 'function') {
                for (const child of slotCandidate.getChildren()) {
                  if (visit(child)) return true;
                }
              }
              return false;
            };
            visit(root);
          });
        },
        insertSectionPlaceholder(sectionId: string, label: string) {
          editor.update(() => {
            const node = $createSectionPlaceholderNode(sectionId, label);
            const selection = $getSelection();
            if (selection) {
              $insertNodes([node]);
            } else {
              $getRoot().append(node);
            }
            editor.focus();
          });
        },
        getEditorStateJson() {
          try {
            return editor.getEditorState().toJSON();
          } catch (e) {
            console.error('[Lexical] Failed to get editor state JSON:', e);
            return null;
          }
        },
        getPlainText() {
          try {
            const state = editor.getEditorState();
            return state.read(() => {
              const root = $getRoot();
              const extractText = (node: LexicalNode): string => {
                if ($isSlotNode(node)) {
                  return (node as SlotNode).exportText();
                }
                if (node.getType() === 'text') {
                  return (node as any).getTextContent();
                }
                // For other nodes, recursively extract text from children
                const children = (node as any).getChildren?.() || [];
                return children.map(extractText).join('');
              };
              return extractText(root);
            });
          } catch (e) {
            console.error('[Lexical] Failed to get plain text:', e);
            return '';
          }
        },
        scanAndInsertSlots(onSlotCreated?: (slot: FieldSpec) => void) {
          runScanAndInsertSlots(editor, onSlotCreated);
        },
      }),
      [editor],
    );

    return null;
  },
);

function TableDeletePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const removeTable = () => {
      const selection = $getSelection();
      if ($isTableSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length > 0) {
          const tableNode = $findTableNode(nodes[0]);
          if (tableNode) {
            const totalCells = tableNode
              .getChildren()
              .reduce((sum, row) => sum + row.getChildren().length, 0);
            if (nodes.length === totalCells) {
              tableNode.remove();
              return true;
            }
          }
        }
        return false;
      }
      const nodes = selection ? selection.getNodes() : [];
      let removed = false;
      nodes.forEach((node) => {
        if ($isTableNode(node)) {
          node.remove();
          removed = true;
        }
      });
      return removed;
    };
    const unregisterDelete = editor.registerCommand(
      KEY_DELETE_COMMAND,
      removeTable,
      COMMAND_PRIORITY_LOW,
    );
    const unregisterBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      removeTable,
      COMMAND_PRIORITY_LOW,
    );
    return () => {
      unregisterDelete();
      unregisterBackspace();
    };
  }, [editor]);
  return null;
}

function PasteSanitizePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const normalizeWordHtml = (html: string): string => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Convert <font color="..."> to <span style="color: ...">
        const fontNodes = Array.from(doc.getElementsByTagName('font'));
        for (const font of fontNodes) {
          const span = doc.createElement('span');
          // Merge existing inline style with color attribute
          const colorAttr = font.getAttribute('color');
          const existing = font.getAttribute('style') || '';
          const colorPart = colorAttr ? `color: ${colorAttr};` : '';
          const style = `${existing} ${colorPart}`.trim();
          if (style) span.setAttribute('style', style);
          span.innerHTML = font.innerHTML;
          font.replaceWith(span);
        }

        // Map mso-highlight to background-color if present
        const allWithStyle = Array.from(doc.querySelectorAll('[style*="mso-highlight:"]')) as HTMLElement[];
        for (const el of allWithStyle) {
          const style = el.getAttribute('style') || '';
          const match = /mso-highlight\s*:\s*([^;]+)\s*;?/i.exec(style);
          if (match) {
            const color = match[1].trim();
            const cleaned = style.replace(/mso-highlight\s*:\s*[^;]+;?/gi, '');
            el.setAttribute('style', `${cleaned} background-color: ${color};`);
          }
        }

        return doc.body.innerHTML;
      } catch {
        return html;
      }
    };
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        try {
          if (!event || !event.clipboardData) return false;
          const htmlRaw = event.clipboardData.getData('text/html');
          const html = htmlRaw ? normalizeWordHtml(htmlRaw) : '';
          if (!html) return false; // let default text paste happen
          event.preventDefault();
          const cleaned = DOMPurify.sanitize(html, SANITIZE_OPTIONS);
          editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(`<div>${cleaned}</div>`, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            const selection = $getSelection();
            if (selection) {
              $insertNodes(nodes);
            } else {
              $getRoot().append(...nodes);
            }
            editor.focus();
          });
          return true;
        } catch (e) {
          console.warn('[Lexical] PasteSanitizePlugin failed, falling back', e);
          return false;
        }
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);
  return null;
}

const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(
  function RichTextEditor(rawProps, ref) {
    // 1) props par défaut robustes
    const defaultProps: Required<
      Pick<Props, 'readOnly' | 'onChange' | 'exportFileName'>
    > = {
      readOnly: false,
      onChange: () => {},
      exportFileName: '',
    };

    const props = { ...defaultProps, ...(rawProps || {}) } as Props;

    const {
      initialStateJson,
      templateKey,
      readOnly,
      onChange,
      onChangeStateJson,
      onSave,
      exportFileName,
    } = props;

    const editorRef = useRef<HTMLElement>(null as unknown as HTMLElement);
    useVirtualSelection(editorRef);

    const initialConfig = {
      namespace: 'rte',
      editable: !readOnly,
      onError: console.error,
      theme: {
        paragraph: 'mb-2',
        heading: {
          h1: 'text-2xl font-bold mb-4',
          h2: 'text-xl font-semibold mb-3',
          h3: 'text-lg font-medium mb-2',
        },
        text: {
          underline: 'underline',
          italic: 'italic',
          bold: 'font-bold',
        },
        root: 'editor-content',
      },
      nodes: [
        ListNode,
        ListItemNode,
        LinkNode,
        HeadingNode,
        QuoteNode,
        TableNode,
        TableRowNode,
        TableCellNode,
        SlotNode,
        SectionPlaceholderNode,
      ],
    };

    // stringify propre de l’état initial
    const initialEditorState = useMemo(() => {
      try {
        if (!initialStateJson) return JSON.stringify(DEFAULT_EMPTY_STATE);
        if (typeof initialStateJson === 'string') {
          const probe = JSON.parse(initialStateJson);
          return probe?.root?.type === 'root'
            ? initialStateJson
            : JSON.stringify(DEFAULT_EMPTY_STATE);
        }
        return (initialStateJson as { root?: { type?: string } })?.root
          ?.type === 'root'
          ? JSON.stringify(initialStateJson)
          : JSON.stringify(DEFAULT_EMPTY_STATE);
      } catch {
        return JSON.stringify(DEFAULT_EMPTY_STATE);
      }
    }, [initialStateJson]);

    return (
      <LexicalComposer
        key={templateKey}
        initialConfig={{
          ...initialConfig,
          editorState: initialEditorState, // ← état initial sans plugin ni update()
        }}
      >
        {!readOnly && (
          <ToolbarPlugin onSave={onSave} exportFileName={exportFileName} />
        )}
        <div className="relative h-full">
          <div
            ref={editorRef as unknown as React.RefObject<HTMLDivElement>}
            className="h-full bg-wood-100 p-8 overflow-auto"
          >
            <div className="flex justify-center">
              <div className="bg-paper-50 border border-gray-300 rounded shadow p-16 w-full max-w-3xl min-h-[100vh] flex flex-col">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className="outline-none flex-1 editor-content"
                      style={{
                        fontFamily:
                          "Calibri, 'Helvetica Neue', Arial, sans-serif",
                        fontSize: '11pt',
                      }}
                    />
                  }
                  placeholder={<div className="text-gray-400">…</div>}
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <ListPlugin />
                <LinkPlugin />
                <TablePlugin hasCellMerge hasCellBackgroundColor />
                <TableDeletePlugin />
                <TableContextMenuPlugin />
                <PasteSanitizePlugin />
                <OnChangePlugin
                  onChange={(state, editor) => {
                    state.read(() => {
                      const html = DOMPurify.sanitize(
                        $generateHtmlFromNodes(editor),
                        SANITIZE_OPTIONS,
                      );
                      onChange?.(html);
                    });
                    try {
                      const json = state.toJSON();
                      onChangeStateJson?.(json as unknown);
                    } catch (e) {
                      console.warn(
                        '[Lexical] Failed to serialize editor state to JSON',
                        e,
                      );
                    }
                  }}
                />
                <ImperativeHandlePlugin
                  ref={ref as React.Ref<RichTextEditorHandle>}
                />
              </div>
            </div>
          </div>
          {/* <SelectionOverlay editorRef={editorRef} /> */}
        </div>
      </LexicalComposer>
    );
  },
);

export default RichTextEditor;
