import type { ChatCompletionCreateParams, ChatCompletionMessageParam } from 'openai/resources/index';
import { prisma } from '../prisma';
import { openaiProvider } from '../services/ai/providers/openai.provider';
import { refineSelection } from './ai/refineSelection.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type ChatMessageDTO = {
  id: string;
  conversationId: string;
  body: string;
  role?: 'USER' | 'ASSISTANT' | 'SYSTEM';
  authorId: string;
  createdAt: string;
};

export const ChatService = {
  async ensureOwnership(userId: string, bilanId: string) {
    const ok = await db.bilan.findFirst({
      where: { id: bilanId, patient: { profile: { userId } } },
      select: { id: true },
    });
    return Boolean(ok);
  },

  async getOrCreateConversation(userId: string, bilanId: string) {
    const owns = await this.ensureOwnership(userId, bilanId);
    if (!owns) throw new Error('Forbidden');
    let conv = await db.conversation.findUnique({ where: { bilanId } });
    if (!conv) {
      conv = await db.conversation.create({ data: { bilanId } });
    }
    return conv as { id: string; bilanId: string };
  },

  async listMessages(userId: string, bilanId: string): Promise<ChatMessageDTO[]> {
    const conv = await this.getOrCreateConversation(userId, bilanId);
    const rows = (await db.message.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        conversationId: true,
        body: true,
        role: true,
        authorId: true,
        createdAt: true,
      },
    })) as Array<{
      id: string;
      conversationId: string;
      body: string;
      role?: 'USER' | 'ASSISTANT' | 'SYSTEM';
      authorId: string;
      createdAt: Date;
    }>;
    return rows.map((r) => ({
      ...r,
      role: (r as any).role,
      createdAt: r.createdAt.toISOString(),
    }));
  },

  async sendMessage(userId: string, bilanId: string, content: string) {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Invalid content');
    }

    const conv = await this.getOrCreateConversation(userId, bilanId);

    // Current user profile
    const profile = await db.profile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new Error('Profile not found');

    // Persist user message
    const userMsg = (await db.message.create({
      data: {
        conversationId: conv.id,
        authorId: profile.id,
        body: content.trim(),
        role: 'USER',
      },
    })) as { id: string; conversationId: string; body: string; authorId: string; createdAt: Date };

    // Build chat history (last 20)
    const history = (await db.message.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: 'asc' },
      take: 40,
      select: { body: true, role: true, createdAt: true },
    })) as Array<{ body: string; role?: 'USER' | 'ASSISTANT' | 'SYSTEM'; createdAt: Date }>;

    const toOpenAi: ChatCompletionMessageParam[] = [];
    // Optional system context to guide the assistant
    toOpenAi.push({
      role: 'system',
      content:
        "Tu es un assistant clinique francophone spécialisé dans l'aide à la rédaction de bilans. Réponds de façon concise, structurée et neutre. N'inclus jamais d'informations personnelles patients.",
    });
    for (const m of history) {
      const role = (m.role || 'USER').toLowerCase();
      const mapped: 'system' | 'user' | 'assistant' =
        role === 'assistant' ? 'assistant' : role === 'system' ? 'system' : 'user';
      toOpenAi.push({ role: mapped, content: m.body });
    }

    const opts = { messages: toOpenAi } as ChatCompletionCreateParams;
    const assistantContent = await openaiProvider.chat(opts);
    const safe = (assistantContent || '').trim();

    // Persist assistant message. We reuse authorId = profile.id to satisfy FK (role disambiguates visual side)
    const assistantMsg = (await db.message.create({
      data: {
        conversationId: conv.id,
        authorId: profile.id,
        body: safe,
        role: 'ASSISTANT',
      },
    })) as { id: string; conversationId: string; body: string; authorId: string; createdAt: Date };

    return {
      userMessage: {
        ...userMsg,
        createdAt: (userMsg.createdAt as any as Date).toISOString(),
        role: 'USER' as const,
      },
      assistantMessage: {
        ...assistantMsg,
        createdAt: (assistantMsg.createdAt as any as Date).toISOString(),
        role: 'ASSISTANT' as const,
      },
    };
  },

  async sendRefineMessage(
    userId: string,
    bilanId: string,
    params: { selectedText: string; refineInstruction: string },
  ) {
    const { selectedText, refineInstruction } = params;
    if (
      !selectedText ||
      typeof selectedText !== 'string' ||
      !refineInstruction ||
      typeof refineInstruction !== 'string'
    ) {
      throw new Error('Invalid refine payload');
    }

    const conv = await this.getOrCreateConversation(userId, bilanId);
    const profile = (await db.profile.findFirst({
      where: { userId },
      select: { id: true, job: true },
    })) as { id: string; job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | null } | null;
    if (!profile) throw new Error('Profile not found');

    // Persist a clear user message capturing intent and selection
    const userBody = `# Refine\n\n### Instructions\n${refineInstruction}\n\n### Sélection\n${selectedText}`;
    const userMsg = (await db.message.create({
      data: {
        conversationId: conv.id,
        authorId: profile.id,
        body: userBody,
        role: 'USER',
      },
    })) as { id: string; conversationId: string; body: string; authorId: string; createdAt: Date };

    // Call refine LLM using existing prompt/service
    const refined = await refineSelection({
      selectedText,
      refineInstruction,
      job: (profile?.job ?? undefined) as any,
    });

    const assistantMsg = (await db.message.create({
      data: {
        conversationId: conv.id,
        authorId: profile.id,
        body: refined || '',
        role: 'ASSISTANT',
      },
    })) as { id: string; conversationId: string; body: string; authorId: string; createdAt: Date };

    return {
      userMessage: {
        ...userMsg,
        createdAt: (userMsg.createdAt as any as Date).toISOString(),
        role: 'USER' as const,
      },
      assistantMessage: {
        ...assistantMsg,
        createdAt: (assistantMsg.createdAt as any as Date).toISOString(),
        role: 'ASSISTANT' as const,
      },
    };
  },
};
