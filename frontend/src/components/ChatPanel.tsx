import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/utils/api';
import { useEditorUi } from '@/store/editorUi';
import { useToastStore } from '@/store/toast';
import { Copy, CornerDownLeft } from 'lucide-react';

type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | undefined;

type ChatMessage = {
  id: string;
  conversationId: string;
  body: string;
  role?: ChatRole;
  authorId: string;
  createdAt: string;
};

export function ChatPanel({
  bilanId,
  onInsertText,
}: {
  bilanId: string;
  onInsertText?: (text: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const selection = useEditorUi((s) => s.selection);
  const mode = useEditorUi((s) => s.mode);
  const setMode = useEditorUi((s) => s.setMode);
  const showToast = useToastStore((s) => s.show);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch<{ messages: ChatMessage[] }>(
      `/api/v1/chat/conversations/${bilanId}/messages`,
    )
      .then((res) => {
        if (!mounted) return;
        setMessages(res.messages || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
        setTimeout(scrollToBottom, 50);
      });
    return () => {
      mounted = false;
    };
  }, [bilanId]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);

    // optimistic user message
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      conversationId: '',
      body: content,
      role: 'USER',
      authorId: '',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setTimeout(scrollToBottom, 20);

    try {
      const isRefine = mode === 'refine' && !!selection?.text?.trim();
      const payload: Record<string, unknown> = isRefine
        ? { bilanId, content, mode: 'refine', selectedText: selection?.text }
        : { bilanId, content };
      const res = await apiFetch<{
        userMessage: ChatMessage;
        assistantMessage: ChatMessage;
      }>(`/api/v1/chat/messages`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Replace optimistic user (optional) and append assistant
      setMessages((prev) => {
        const withoutTmp = prev.filter((m) => m.id !== optimistic.id);
        return [...withoutTmp, res.userMessage, res.assistantMessage];
      });
      setTimeout(scrollToBottom, 20);
      if (isRefine) {
        try {
          selection?.clear();
        } catch {}
        setMode('idle');
      }
    } catch (e) {
      // rollback optimistic if failed
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Message copié dans le presse-papier', { type: 'success' });
    } catch (e) {
      showToast('Impossible de copier le message', { type: 'error' });
    }
  };

  const handleInsert = (text: string) => {
    try {
      onInsertText?.(text);
      showToast("Inséré dans l'éditeur", { type: 'info' });
    } catch (e) {
      showToast("Échec de l'insertion dans l'éditeur", { type: 'error' });
    }
  };

  const renderBubble = (m: ChatMessage) => {
    const isAssistant = (m.role || 'USER') === 'ASSISTANT';
    return (
      <div
        key={m.id}
        className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} my-1`}
      >
        <div className="flex flex-col max-w-[80%]">
          <div
            className={`rounded-md px-3 py-2 text-sm whitespace-pre-wrap ${
              isAssistant
                ? 'bg-gray-100 text-gray-800'
                : 'bg-primary-600 text-white'
            }`}
          >
            {m.body}
          </div>
          {/* Action buttons below each assistant message only */}
          {isAssistant && (
            <div className="flex gap-1 mt-1 justify-start">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleCopy(m.body)}
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleInsert(m.body)}
              >
                <CornerDownLeft className="h-3.5 w-3.5 mr-1" />
                Insérer
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scrollable messages + selection highlight area */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white">
        <div className="px-4 py-3">
          {loading ? (
            <div className="text-gray-500 text-sm">Chargement…</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-500">
              Astuce: sélectionner du texte pour poser une question sur ce
              texte, par exemple pour rédiger une conclusion.
            </div>
          ) : (
            messages.map((m) => renderBubble(m))
          )}
        </div>
        {/*           <div ref={bottomRef} className="h-0" />
         */}{' '}
      </div>
      {selection?.text ? (
        <div className="mb-3 rounded-md bg-amber-300 px-3 py-2 text-sm">
          <div className="text-coral-600 mb-1">Texte sélectionné :</div>
          <div className="italic truncate">"{selection.text}"</div>
        </div>
      ) : null}
      {/* Sticky footer composer */}
      <div className="shrink-0 border-t border-wood-200 bg-white p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            mode === 'refine' && selection?.text
              ? 'Précisez les modifications à appliquer…'
              : 'Écrivez votre message…'
          }
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !input.trim()}>
          {sending ? 'Envoi…' : 'Envoyer'}
        </Button>
      </div>
    </div>
  );
}

export default ChatPanel;
