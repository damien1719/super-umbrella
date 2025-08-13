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
import { useVirtualSelection } from '../hooks/useVirtualSelection';

export interface RichTextEditorHandle {
  insertHtml: (html: string) => void;
}

interface Props {
  initialHtml: string;
  readOnly?: boolean;
  onChange?: (html: string) => void;
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
    }),
    [editor],
  );

  return null;
});

function EditorCore(
  { initialHtml = '', readOnly = false, onChange = () => {}, onSave, exportFileName }: Props = {
    initialHtml: '',
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
    nodes: [ListNode, ListItemNode, LinkNode, HeadingNode, QuoteNode],
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
              <OnChangePlugin
                onChange={(state, editor) => {
                  state.read(() => {
                    const html = DOMPurify.sanitize(
                      $generateHtmlFromNodes(editor),
                    );
                    onChange?.(html);
                  });
                }}
              />
              <HtmlPlugin html={initialHtml} />
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
