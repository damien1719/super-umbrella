import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import {
  $getRoot,
  $getSelection,
  $insertNodes,
  $createParagraphNode,
  $createTextNode,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ToolbarPlugin } from './RichTextToolbar';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
// HTML/Markdown parsing removed: we now work exclusively with Lexical JSON editor state
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { SlotNode, $createSlotNode } from '../nodes/SlotNode';
import { useVirtualSelection } from '../hooks/useVirtualSelection';
import type { SlotType } from '../types/template';

export interface RichTextEditorHandle {
  setEditorStateJson: (state: unknown) => void;
  getEditorStateJson: () => unknown;
  insertPlainText: (text: string) => void;
  insertSlot: (slotId: string, slotLabel: string, slotType: SlotType) => void;
}

interface Props {
  initialStateJson: unknown;
  readOnly?: boolean;
  onChange?: (stateJson: unknown) => void;
  onSave?: () => void;
  exportFileName?: string;
}

function JsonStatePlugin({ state }: { state: unknown }) {
  const [editor] = useLexicalComposerContext();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return; // on ne ré‑injecte jamais deux fois
    hasLoaded.current = true;

    try {
      const parsed = editor.parseEditorState(state as string);
      editor.setEditorState(parsed);
    } catch {
      // fallback: empty document
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const p = $createParagraphNode();
        p.append($createTextNode(''));
        root.append(p);
      });
    }
  }, [editor, state]);
  return null;
}

const ImperativeHandlePlugin = forwardRef<RichTextEditorHandle, object>(
  function ImperativeHandlePlugin(_, ref) {
    const [editor] = useLexicalComposerContext();

    useImperativeHandle(
      ref,
      () => ({
        setEditorStateJson(state: unknown) {
          try {
            if (typeof state === 'string') {
              const parsed = editor.parseEditorState(state);
              editor.setEditorState(parsed);
            } else if (state && typeof state === 'object') {
              // Si c'est un objet, on le convertit en string JSON d'abord
              const jsonString = JSON.stringify(state);
              const parsed = editor.parseEditorState(jsonString);
              editor.setEditorState(parsed);
            }
          } catch (error) {
            console.error('Error setting editor state:', error);
            // ignore invalid state
          }
        },
        getEditorStateJson() {
          try {
            return editor.getEditorState().toJSON();
          } catch {
            return null;
          }
        },
        insertPlainText(text: string) {
          editor.update(() => {
            const lines = (text ?? '').split(/\r?\n/);
            const nodes = lines.map((line) => {
              const p = $createParagraphNode();
              p.append($createTextNode(line));
              return p;
            });
            const selection = $getSelection();
            if (selection) {
              $insertNodes(nodes);
            } else {
              $getRoot().append(...nodes);
            }
            editor.focus();
          });
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
      }),
      [editor],
    );

    return null;
  },
);

function EditorCore(
  {
    initialStateJson = null,
    readOnly = false,
    onChange = () => {},
    onSave,
    exportFileName,
  }: Props = {
    initialStateJson: null,
    readOnly: false,
    onChange: () => {},
    onSave: undefined,
  },
  ref: React.ForwardedRef<RichTextEditorHandle>,
) {
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
    },
    nodes: [ListNode, ListItemNode, LinkNode, HeadingNode, QuoteNode, SlotNode],
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
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
              <OnChangePlugin
                onChange={(state) => {
                  try {
                    const json = state.toJSON();
                    onChange?.(json);
                  } catch {}
                }}
              />
              <JsonStatePlugin state={initialStateJson} />
              <ImperativeHandlePlugin ref={ref} />
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
