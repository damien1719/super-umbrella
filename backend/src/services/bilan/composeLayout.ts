// Utility to compose a Lexical layout JSON by replacing custom
// { type: 'section-placeholder', sectionId } nodes with the
// corresponding section editor states.

type LexicalNode = Record<string, unknown> & { type?: string; children?: LexicalNode[] };
type LexicalState = { root: LexicalNode };
type SectionsMap = Record<string, LexicalState | undefined>;

function deepClone<T>(obj: T): T {
  return obj == null ? obj : JSON.parse(JSON.stringify(obj)) as T;
}

function asArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val == null) return [] as T[];
  return [val as T];
}

export function hydrateLayout(layout: LexicalState, sections: SectionsMap): LexicalState {
  const inLayout = deepClone(layout);
  const root = inLayout?.root ?? { type: 'root', children: [] };

  function replace(node: LexicalNode): LexicalNode[] {
    if (node?.type === 'section-placeholder') {
      const sectionId = (node as unknown as { sectionId?: string }).sectionId;
      const section = sectionId ? sections[sectionId] : undefined;
      const children = asArray<LexicalNode>(section?.root?.children ?? []);
      if (children.length === 0) {
        // If no content available, keep a small marker paragraph (visible hint for missing section)
        return [
          {
            type: 'paragraph',
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'text',
                text: `Section introuvable`,
                detail: 0,
                format: 0,
                style: '',
                version: 1,
              },
            ],
          } as LexicalNode,
        ];
      }
      // Splice-in section children at the placeholder position
      return children.map((c) => deepClone(c));
    }

    const cloned: LexicalNode = { ...node };
    const kids = asArray<LexicalNode>(node?.children ?? []);
    if (kids.length) {
      const out: LexicalNode[] = [];
      for (const k of kids) {
        const rep = replace(k);
        out.push(...rep);
      }
      cloned.children = out;
    }
    return [cloned];
  }

  const outChildren: LexicalNode[] = [];
  for (const c of asArray<LexicalNode>(root.children ?? [])) {
    const rep = replace(c);
    outChildren.push(...rep);
  }

  return { root: { ...(root || {}), children: outChildren } } as LexicalState;
}
