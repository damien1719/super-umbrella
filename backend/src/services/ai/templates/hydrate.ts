export type SlotSpec = {
  mode: 'user' | 'computed' | 'llm';
  type: 'text' | 'number' | 'list' | 'table';
  pattern?: string;
  deps?: string[];
  prompt?: string;
};

export function hydrate(ast: unknown, slots: Record<string, unknown>, spec: Record<string, SlotSpec>): unknown {
  if (Array.isArray(ast)) {
    return ast.map((n) => hydrate(n, slots, spec));
  }
  if (ast && typeof ast === 'object') {
    const node = ast as { type?: string; slotId?: string; id?: string; children?: unknown; root?: unknown } & Record<string, unknown>;

    // Editor state wrapper
    if (Object.prototype.hasOwnProperty.call(node, 'root')) {
      const out: Record<string, unknown> = { ...node };
      out.root = hydrate(node.root, slots, spec);
      return out;
    }

    // Slot node from frontend can be { type: 'slot', slotId } or legacy { type:'slot', id }
    if (node.type === 'slot' && (typeof node.slotId === 'string' || typeof (node as any).id === 'string')) {
      const slotId = (typeof node.slotId === 'string' ? node.slotId : (node as any).id) as string;

      // 1) Direct lookup
      let value: unknown = slots[slotId];

      // 2) Fallback for templated or repeated ids (e.g., includes {{item.key}} or extra segments)
      if (value === undefined) {
        const keys = Object.keys(spec || {});
        const firstSeg = slotId.split('.')[0];
        const lastSeg = slotId.split('.').pop() || slotId;

        // a) Try regex replacing templated parts
        try {
          const regexText = slotId
            .replace(/\./g, '\\.')
            .replace(/\{\{[^}]+\}\}/g, '[^.]+');
          const regex = new RegExp(`^${regexText}$`);
          const key = keys.find((k) => regex.test(k));
          if (key && slots[key] !== undefined) value = slots[key];
        } catch {}

        // b) Try heuristic: startsWith first segment and endsWith last segment
        if (value === undefined) {
          const key = keys.find((k) => k.startsWith(firstSeg) && k.endsWith(lastSeg));
          if (key && slots[key] !== undefined) value = slots[key];
        }
      }

      const text = Array.isArray(value) ? (value as unknown[]).join(', ') : String(value ?? '');
      return {
        type: 'text',
        text,
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        version: 1,
      };
    }

    const out: Record<string, unknown> = { ...node };
    if (node.children !== undefined) {
      out.children = hydrate(node.children, slots, spec);
    }
    return out;
  }
  return ast;
}

export const _test = { hydrate };


