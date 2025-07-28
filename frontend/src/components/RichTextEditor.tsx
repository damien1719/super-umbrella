import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $getSelection, $insertNodes, $createParagraphNode, LexicalNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ToolbarPlugin } from './RichTextToolbar';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import DOMPurify from 'dompurify';

export interface RichTextEditorHandle {
  insertHtml: (html: string) => void;
}

interface Props {
  initialHtml: string;
  readOnly?: boolean;
  onChange?: (html: string) => void;
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
  Record<string, never>
>(function ImperativeHandlePlugin(_, ref) {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(
    ref,
    () => ({
      insertHtml(html: string) {
        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(
            `<div>${html}</div>`,
            'text/html'
          );

          let nodes = $generateNodesFromDOM(editor, dom);

          // 3. Nettoyer et wrap TextNode en ParagraphNode
          nodes = nodes
          .map(node => {
            const type = node.getType();
            if (type === 'text') {
              // si vide, on jette
              if (node.getTextContent().trim() === '') {
                return null;
              }
              // sinon on wrappe dans un paragraphe
              return $createParagraphNode().append(node);
            }
            if (type === 'linebreak') {
              return null;
            }
            return node;
          })
          .filter((n): n is LexicalNode => n !== null);

          // 4. Insérer au curseur ou à la fin
          const selection = $getSelection();
          if (selection && !selection.isCollapsed()) {
            $insertNodes(nodes);
          } else {
            $getRoot().append(...nodes);
          }
        });
      },
    }),
    [editor],
  );

  return null;
});

function EditorCore(
  { initialHtml = '', readOnly = false, onChange = () => {} }: Props = {
    initialHtml: '',
    readOnly: false,
    onChange: () => {},
  },
  ref: React.ForwardedRef<RichTextEditorHandle>,
) {
  const initialConfig = {
    namespace: 'rte',
    editable: !readOnly,
    onError: console.error,
    theme: {
      paragraph: 'mb-2',
    },
    nodes: [ListNode, ListItemNode, LinkNode],
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      {!readOnly && (
        <ToolbarPlugin className="bg-white shadow-sm px-4 py-2 rounded-t" />
      )}
      <div className="flex flex-col h-screen bg-gray-100 border border-gray-300 p-8">
        <div className="flex-1 overflow-auto">
          <div className="h-full w-full bg-white border border-gray-300 rounded shadow p-4">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="h-full outline-none w-full" />
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
            <ImperativeHandlePlugin ref={ref} />
          </div>
        </div>
      </div>
    </LexicalComposer>
  );
}

const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(EditorCore);

export default RichTextEditor;
