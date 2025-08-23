import type { SlotSpec, SlotType } from '../../../types/template';

type SlotsDict = Record<string, string | number | null | undefined>;
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
  console.log('[DEBUG] hydrate - STARTED', {
    astType: typeof ast,
    astKeys: typeof ast === 'object' ? Object.keys(ast || {}) : 'N/A',
    slotsCount: Object.keys(slots || {}).length,
    slotsKeys: Object.keys(slots || {}),
    specCount: Object.keys(spec || {}).length,
    specKeys: Object.keys(spec || {}),
  });

  let slotsReplacedCount = 0;
  let nodesVisitedCount = 0;

  const visit = (node: any): any => {
    nodesVisitedCount++;

    if (Array.isArray(node)) {
      console.log(`[DEBUG] hydrate - Processing array with ${node.length} items`);
      return node.map(visit);
    }

    if (node && typeof node === 'object') {
      // Cas slot principal
      if (node.type === 'slot' && typeof node.slotId === 'string') {
        const id = node.slotId;
        const slotValue = slots[id];
        const slotSpec = spec[id];

        console.log(`[DEBUG] hydrate - Replacing slot:`, {
          slotId: id,
          slotValue: slotValue,
          slotValueType: typeof slotValue,
          hasSlotSpec: !!slotSpec,
          slotSpecType: slotSpec?.kind,
          slotSpecFieldType: isFieldSpec(slotSpec) ? slotSpec.type : 'N/A',
        });

        const formattedValue = formatValue(slotValue, slotSpec);
        const textNode = makeTextNode(formattedValue);

        console.log(`[DEBUG] hydrate - Slot replaced:`, {
          slotId: id,
          originalValue: slotValue,
          formattedValue: formattedValue,
          textNode: textNode,
        });

        slotsReplacedCount++;
        return textNode;
      }

      // Descente générique sur tous les champs objets/arrays
      const out: any = {};
      for (const [k, v] of Object.entries(node)) {
        out[k] = (v && typeof v === 'object') ? visit(v) : v;
      }

      console.log(`[DEBUG] hydrate - Processed object node:`, {
        nodeType: node.type || 'unknown',
        originalKeys: Object.keys(node),
        processedKeys: Object.keys(out),
        hasChanges: Object.keys(node).length !== Object.keys(out).length,
      });

      return out;
    }

    return node;
  };

  console.log('[DEBUG] hydrate - Starting AST traversal...');
  const result = visit(ast);

  console.log('[DEBUG] hydrate - COMPLETED', {
    nodesVisitedCount: nodesVisitedCount,
    slotsReplacedCount: slotsReplacedCount,
    resultType: typeof result,
    resultKeys: typeof result === 'object' ? Object.keys(result || {}) : 'N/A',
    resultSize: JSON.stringify(result).length,
    resultPreview: JSON.stringify(result).slice(0, 300) + '...',
  });

  return result;
}
