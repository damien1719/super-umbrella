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
import { useEffect } from 'react';
import DOMPurify from 'dompurify';

interface Props {
  initialHtml: string;
  readOnly?: boolean;
  onChange?: (html: string) => void;
}

function HtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
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
  initialHtml,
  readOnly,
  onChange,
}: Props) {
  const initialConfig = {
    namespace: 'rte',
    editable: !readOnly,
    onError: console.error,
    theme: {
      paragraph: 'mb-2',
    },
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      {!readOnly && <ToolbarPlugin />}
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="border p-2 min-h-[150px] rounded" />
        }
        placeholder={<div>...</div>}
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
    </LexicalComposer>
  );
}
