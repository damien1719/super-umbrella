import React, {
  useMemo,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
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
import { $getRoot, $getSelection, $insertNodes } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ToolbarPlugin } from './RichTextToolbar';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useVirtualSelection } from '../hooks/useVirtualSelection';
import { SlotNode, $createSlotNode } from '../nodes/SlotNode';
import type { SlotType } from '../types/template';

export interface RichTextEditorHandle {
  importHtml: (html: string) => void;
  insertHtml: (html: string) => void;
  setEditorStateJson: (state: unknown) => void;
  getEditorStateJson?: () => unknown;
  insertSlot?: (slotId: string, slotLabel: string, slotType: SlotType) => void;
  updateSlot?: (slotId: string, slotLabel: string) => void;
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
            const visit = (node: any): boolean => {
              if (
                typeof node?.getSlotId === 'function' &&
                node.getSlotId() === slotId
              ) {
                // Safe mutation using node API
                node.setLabel?.(slotLabel);
                return true;
              }
              if (typeof node?.getChildren === 'function') {
                for (const child of node.getChildren()) {
                  if (visit(child)) return true;
                }
              }
              return false;
            };
            visit(root);
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
      }),
      [editor],
    );

    return null;
  },
);

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

    // helper: valide (très simple) pour un état Lexical sérialisé
    function isLexicalStateLike(obj: any): boolean {
      return (
        !!obj && typeof obj === 'object' && obj.root && obj.root.type === 'root'
      );
    }

    const serialized = useMemo(() => {
      if (!initialStateJson) return null;
      try {
        // prends la version string si déjà string, sinon stringify
        const str =
          typeof initialStateJson === 'string'
            ? initialStateJson
            : JSON.stringify(initialStateJson);

        // on valide la forme (si c'est un string on parse juste pour checker)
        const probe =
          typeof initialStateJson === 'string'
            ? JSON.parse(str)
            : initialStateJson;

        return isLexicalStateLike(probe) ? str : null;
      } catch {
        return null;
      }
    }, [initialStateJson]);

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
        root: 'Calibri',
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
        return (initialStateJson as any)?.root?.type === 'root'
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
                    <ContentEditable className="outline-none flex-1 editor-content" />
                  }
                  placeholder={<div className="text-gray-400">…</div>}
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <ListPlugin />
                <LinkPlugin />
                <TablePlugin hasCellMerge hasCellBackgroundColor />
                <OnChangePlugin
                  onChange={(state, editor) => {
                    state.read(() => {
                      const html = DOMPurify.sanitize(
                        $generateHtmlFromNodes(editor),
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
                <ImperativeHandlePlugin ref={ref as any} />
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
