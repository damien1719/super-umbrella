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
import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useVirtualSelection } from '../hooks/useVirtualSelection';
import { SlotNode, $createSlotNode } from '../nodes/SlotNode';
import type { SlotType } from '../types/template';

export interface RichTextEditorHandle {
  insertHtml: (html: string) => void;
  setEditorStateJson: (state: unknown) => void;
  insertSlot?: (slotId: string, slotLabel: string, slotType: SlotType) => void;
}

interface Props {
  initialHtml?: string;
  initialStateJson?: unknown;
  readOnly?: boolean;
  onChange?: (html: string) => void;
  onChangeStateJson?: (stateJson: unknown) => void;
  onSave?: () => void;
  exportFileName?: string;
}

function HtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return; // on ne ré‑injecte jamais deux fois
    hasLoaded.current = true;

    editor.update(() => {
      const dom = new DOMParser().parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.append(...nodes);
    });
  }, [editor, html]);
  return null;
}

function StateJsonPlugin({ stateJson }: { stateJson: unknown }) {
  const [editor] = useLexicalComposerContext();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current || !stateJson) return;
    hasLoaded.current = true;

    editor.update(() => {
      try {
        const serialized =
          typeof stateJson === 'string' ? stateJson.trim() : JSON.stringify(stateJson);
        if (typeof serialized === 'string' && serialized.startsWith('<')) {
          // HTML fallback
          const dom = new DOMParser().parseFromString(`<div>${serialized}</div>`, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          const root = $getRoot();
          root.clear();
          root.append(...nodes);
          return;
        }
        const state = editor.parseEditorState(serialized);
        let isEmpty = true;
        state.read(() => {
          const root = $getRoot();
          isEmpty = root.getChildrenSize() === 0 && root.getTextContentSize() === 0;
        });
        if (isEmpty) {
          console.warn('[Lexical] Ignored empty editor state');
          return;
        }
        editor.setEditorState(state);
      } catch (error) {
        console.error('Failed to parse editor state JSON:', error);
      }
    });
  }, [editor, stateJson]);
  return null;
}

const ImperativeHandlePlugin = forwardRef<
  RichTextEditorHandle,
  object
>(function ImperativeHandlePlugin(_, ref) {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(
    ref,
    () => ({
      insertHtml(html: string) {
        editor.update(() => {
          const parser = new DOMParser();
          const mdHtml = marked.parse(html);
          const dom = parser.parseFromString(
            `<div>${mdHtml}</div>`,
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
          /*        const firstNode = nodes[0];
          const lastNode = nodes[nodes.length - 1];
          if (firstNode && lastNode) {
            const range = $createRangeSelection();
            range.anchor.set(firstNode.getKey(), 0, 'element');
            const length = lastNode.getTextContentSize
              ? lastNode.getTextContentSize()
              : lastNode.getTextContent().length;
            range.focus.set(lastNode.getKey(), length, 'element');
            $setSelection(range);
          } */
        });
      },
      setEditorStateJson(state: unknown) {
        console.log('[Lexical] setEditorStateJson called with:', state);
        editor.update(() => {
          try {
            const stateString = typeof state === 'string' ? state.trim() : JSON.stringify(state);
            console.log('[Lexical] State stringified (first 200):', stateString.slice(0, 200));
            if (typeof stateString === 'string' && stateString.startsWith('<')) {
              // HTML fallback
              console.log('[Lexical] Detected HTML string, importing as HTML');
              const dom = new DOMParser().parseFromString(`<div>${stateString}</div>`, 'text/html');
              const nodes = $generateNodesFromDOM(editor, dom);
              const root = $getRoot();
              root.clear();
              root.append(...nodes);
              editor.focus();
              return;
            }
            const editorState = editor.parseEditorState(stateString);
            let isEmpty = true;
            let childrenSize = 0;
            let textContentSize = 0;
            editorState.read(() => {
              const root = $getRoot();
              childrenSize = root.getChildrenSize();
              textContentSize = root.getTextContentSize();
              isEmpty = childrenSize === 0 && textContentSize === 0;
              console.log('[Lexical] Root analysis:', {
                childrenSize,
                textContentSize,
                isEmpty,
                rootChildrenCount: root.getChildren().length,
                rootTextContent: root.getTextContent()
              });
            });
            if (isEmpty) {
              // eslint-disable-next-line no-console
              console.warn('[Lexical] Ignored empty editor state - no content to insert');
              return;
            }
            console.log('[Lexical] Setting editor state with content');
            editor.setEditorState(editorState);
          } catch (error) {
            console.error('[Lexical] Failed to set editor state JSON:', error);
          }
        });
      },
      insertSlot(slotId: string, slotLabel: string, slotType: SlotType) {
        editor.update(() => {
          const node = $createSlotNode(slotId, slotLabel, slotType, false, '…');
          const selection = $getSelection();
          if (selection) {
            $insertNodes([node]);
          } else {
            $getRoot().append(node);
          }
          editor.focus();
        });
      },
    }),
    [editor],
  );

  return null;
});

function EditorCore(
  { initialHtml, initialStateJson, readOnly = false, onChange = () => {}, onChangeStateJson, onSave, exportFileName }: Props = {
    initialHtml: undefined,
    initialStateJson: undefined,
    readOnly: false,
    onChange: () => {},
    onChangeStateJson: undefined,
    onSave: undefined,
  },
  ref: React.ForwardedRef<RichTextEditorHandle>,
) {
  const editorRef = useRef<HTMLElement>(null as unknown as HTMLElement);
  useVirtualSelection(editorRef);

  // --- DEBUG: vérifie chaque Node enregistré
  const CANDIDATE_NODES = [
    ListNode,
    ListItemNode,
    LinkNode,
    HeadingNode,
    QuoteNode,
    TableNode,
    TableRowNode,
    TableCellNode,
  ];

  CANDIDATE_NODES.forEach((N, i) => {
    const name = (N as any)?.name ?? `index:${i}`;
    const hasGetType = typeof (N as any)?.getType === 'function';
    if (!N) {
      // eslint-disable-next-line no-console
      console.error('[Lexical nodes] Import undefined ->', name, N);
    } else if (!hasGetType) {
      console.error('[Lexical nodes] Missing static getType() ->', name, N);
    } else {
      console.log('[Lexical nodes] OK ->', name);
    }
  });


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
  return (
    <LexicalComposer initialConfig={initialConfig}>
      {!readOnly && <ToolbarPlugin onSave={onSave} exportFileName={exportFileName} />}
      <div className="relative h-full">
        <div ref={editorRef as unknown as React.RefObject<HTMLDivElement>} className="h-full bg-wood-100 p-8 overflow-auto">
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
                    // eslint-disable-next-line no-console
                    console.warn('[Lexical] Failed to serialize editor state to JSON', e);
                  }
                }}
              />
              {initialStateJson ? (
                <StateJsonPlugin stateJson={initialStateJson} />
              ) : (
                initialHtml && <HtmlPlugin html={initialHtml} />
              )}
              <ImperativeHandlePlugin ref={ref as any} />
            </div>
          </div>
        </div>
        {/* <SelectionOverlay editorRef={editorRef} /> */}
      </div>
    </LexicalComposer>
  );
}

const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(EditorCore);

export default RichTextEditor;
