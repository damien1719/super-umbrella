import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ToolbarPlugin } from './RichTextToolbar';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkNode } from '@lexical/link';
import {ListNode,ListItemNode} from '@lexical/list';
import { useRef, useEffect } from 'react'
import DOMPurify from 'dompurify';

interface Props {
  initialHtml: string;
  readOnly?: boolean;
  onChange?: (html: string) => void;
}

function HtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (hasLoaded.current) return   // on ne ré‑injecte jamais deux fois
    hasLoaded.current = true

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

export default function RichTextEditor({
  initialHtml = '',
  readOnly = false,
  onChange = () => {},
}: Props = { initialHtml: '', readOnly: false, onChange: () => {} }
) {
  const initialConfig = {
    namespace: 'rte',
    editable: !readOnly,
    onError: console.error,
    theme: {
      paragraph: 'mb-2',
    },
    nodes: [
      ListNode,
      ListItemNode,
      LinkNode,
    ],
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
                const html = DOMPurify.sanitize($generateHtmlFromNodes(editor));
                onChange?.(html);
              });
            }}
          />
          <HtmlPlugin html={initialHtml} />
        </div>
      </div>
    </div>
  </LexicalComposer>
  );
}
