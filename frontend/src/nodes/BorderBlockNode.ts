import {
  ElementNode,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
} from 'lexical';

export type BorderPreset = 'none' | 'thin' | 'medium' | 'thick' | 'dashed';

export type SerializedBorderBlockNode = {
  type: 'border-block';
  version: 1;
  preset: BorderPreset;
};

export class BorderBlockNode extends ElementNode {
  __preset: BorderPreset;

  static getType(): string {
    return 'border-block';
  }

  static clone(node: BorderBlockNode): BorderBlockNode {
    const n = new BorderBlockNode(node.__preset, node.__key);
    return n;
  }

  constructor(preset: BorderPreset = 'thin', key?: NodeKey) {
    super(key);
    this.__preset = preset ?? 'thin';
  }

  /** Apply the visual style corresponding to the preset */
  private applyStyle(el: HTMLElement) {
    const map: Record<Exclude<BorderPreset, 'none'>, string> = {
      thin: '1px solid',
      medium: '2px solid',
      thick: '3px solid',
      dashed: '1px dashed',
    } as const;
    if (this.__preset === 'none') {
      el.removeAttribute('style');
      return;
    }
    const rule =
      map[this.__preset as Exclude<BorderPreset, 'none'>] || map.thin;
    el.style.cssText = `border: ${rule} #000; padding: 6px 8px; box-sizing: border-box; width: 100%`;
  }

  createDOM(): HTMLElement {
    const el = document.createElement('div');
    this.applyStyle(el);
    el.setAttribute('data-border-preset', this.__preset);
    return el;
  }

  updateDOM(prevNode: BorderBlockNode, dom: HTMLElement): boolean {
    if (prevNode.__preset !== this.__preset) {
      this.applyStyle(dom);
      dom.setAttribute('data-border-preset', this.__preset);
    }
    // Returning false means Lexical won't re-create the DOM element
    return false;
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('div');
    this.applyStyle(el);
    el.setAttribute('data-border-preset', this.__preset);
    return { element: el };
  }

  static importJSON(json: SerializedBorderBlockNode): BorderBlockNode {
    return new BorderBlockNode(json.preset ?? 'thin');
  }

  exportJSON(): SerializedBorderBlockNode {
    return {
      type: 'border-block',
      version: 1,
      preset: this.__preset,
    };
  }

  // Lexical mutation helper to change preset inside editor.update()
  setPreset(preset: BorderPreset) {
    const writable = this.getWritable() as BorderBlockNode;
    writable.__preset = preset;
  }
}

export function $createBorderBlockNode(preset: BorderPreset): BorderBlockNode {
  return new BorderBlockNode(preset);
}

export function $isBorderBlockNode(
  node: LexicalNode | null | undefined,
): node is BorderBlockNode {
  return node instanceof BorderBlockNode;
}
