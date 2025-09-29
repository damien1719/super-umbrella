import type { SlotSpec } from '../../../types/template';

type SlotsDict = Record<string, unknown>;
type SpecDict  = Record<string, SlotSpec>;

function makeTextNode(text: string) {
  return { type: 'text', version: 1, text, format: 0, style: '' };
}

function isFieldSpec(spec?: SlotSpec): spec is import('../../../types/template').FieldSpec {
  return spec?.kind === 'field';
}

function formatValue(val: unknown, spec?: SlotSpec): string {
  if (val == null) return '';
  // AVANT: spec?.type (erreur TypeScript car SlotSpec est union)
  // APRÈS: isFieldSpec(spec) && spec.type (TypeScript sait que spec est FieldSpec)
  if (isFieldSpec(spec) && spec.type === 'list' && Array.isArray(val)) return val.join(', ');
  // pour tout le reste (text/number/table), on stringify simplement
  return String(val);
}

/** Remplace uniquement { type:'slot', slotId } par un TextNode. */
export function hydrate(ast: unknown, slots: SlotsDict, spec: SpecDict): unknown {


  let slotsReplacedCount = 0;
  let nodesVisitedCount = 0;

  const visit = (node: any): any => {
    nodesVisitedCount++;

    if (Array.isArray(node)) {
      return node.map(visit);
    }

    if (node && typeof node === 'object') {
      // Cas slot principal
      if (node.type === 'slot' && typeof node.slotId === 'string') {
        const id = node.slotId;
        const slotValue = slots[id];
        const slotSpec = spec[id];

        const formattedValue = formatValue(slotValue, slotSpec);
        const textNode = makeTextNode(formattedValue);

        slotsReplacedCount++;
        return textNode;
      }

      // Descente générique sur tous les champs objets/arrays
      const out: any = {};
      for (const [k, v] of Object.entries(node)) {
        out[k] = (v && typeof v === 'object') ? visit(v) : v;
      }

      return out;
    }

    return node;
  };

  const result = visit(ast);


  return result;
}
