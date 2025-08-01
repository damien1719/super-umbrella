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
  $createParagraphNode,
  $createRangeSelection,
  $setSelection,
  LexicalNode,
  TextNode,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ToolbarPlugin } from './RichTextToolbar';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useLayoutEffect,
} from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { useVirtualSelection } from '../hooks/useVirtualSelection';
import { useEditorUi } from '../store/editorUi';

export interface RichTextEditorHandle {
  insertHtml: (html: string) => void;
}

interface Props {
  initialHtml: string;
  readOnly?: boolean;
  onChange?: (html: string) => void;
  onSave?: () => void;
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
          const mdHtml = marked.parse(html);
          const dom = parser.parseFromString(
            `<div>${mdHtml}</div>`,
            'text/html',
          );

          let nodes = $generateNodesFromDOM(editor, dom);

          // 3. Nettoyer et wrap TextNode en ParagraphNode
          nodes = nodes
            .map((node) => {
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
          if (selection) {
            $insertNodes(nodes);
          } else {
            $getRoot().append(...nodes);
          }

          editor.focus();

          const allTextNodes = nodes
            .flatMap((node) => node.getChildren()) // on ne descend que d’un niveau
            .filter((n): n is TextNode => n.getType() === 'text');
          const firstText = allTextNodes[0];
          const lastText = allTextNodes[allTextNodes.length - 1];

          if (firstText && lastText) {
            // 6) créer une RangeSelection sur ces text nodes
            const range = $createRangeSelection();
            range.anchor.set(firstText.getKey(), 0, 'text');
            range.focus.set(
              lastText.getKey(),
              lastText.getTextContent().length,
              'text',
            );

            setTimeout(() => {
              editor.update(() => {
                $setSelection(range);
              });
            }, 0);
          }
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

function SelectionOverlay({
  editorRef,
}: {
  editorRef: React.RefObject<HTMLElement>;
}) {
  const snap = useEditorUi((s) => s.selection);
  const [offsets, setOffsets] = useState({
    left: 0,
    top: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  useLayoutEffect(() => {
    const update = () => {
      const el = editorRef.current;
      if (!el) return;
      const b = el.getBoundingClientRect();
      setOffsets({
        left: b.left,
        top: b.top,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
      });
    };
    update();
    window.addEventListener('resize', update);
    editorRef.current?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      editorRef.current?.removeEventListener('scroll', update);
    };
  }, [editorRef]);

  if (!snap) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {snap.rects.map((r, i) => (
        <div
          key={i}
          className="absolute rounded bg-blue-300/60"
          style={{
            left: r.left - offsets.left + offsets.scrollLeft,
            top: r.top - offsets.top + offsets.scrollTop,
            width: r.width,
            height: r.height,
          }}
        />
      ))}
    </div>
  );
}

function EditorCore(
  { initialHtml = '', readOnly = false, onChange = () => {}, onSave }: Props = {
    initialHtml: '',
    readOnly: false,
    onChange: () => {},
    onSave: undefined,
  },
  ref: React.ForwardedRef<RichTextEditorHandle>,
) {
  const editorRef = useRef<HTMLDivElement>(null);
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
    },
    nodes: [ListNode, ListItemNode, LinkNode, HeadingNode, QuoteNode],
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      {!readOnly && <ToolbarPlugin onSave={onSave} />}
      <div className="relative h-full">
        <div ref={editorRef} className="h-full bg-gray-100 p-8 overflow-auto">
          <div className="flex justify-center">
            <div className="bg-white border border-gray-300 rounded shadow p-16 w-full max-w-prose min-h-[100vh] flex flex-col">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="outline-none flex-1" />
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
        {/* <SelectionOverlay editorRef={editorRef} /> */}
      </div>
    </LexicalComposer>
  );
}

const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(EditorCore);

export default RichTextEditor;
