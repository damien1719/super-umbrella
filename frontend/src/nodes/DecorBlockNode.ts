import {
  ElementNode,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedElementNode,
  type Spread,
} from 'lexical';

export type BorderWeight = 'none' | 'thin' | 'medium' | 'thick' | 'dashed';

export type DecorFillMode = 'none' | 'token' | 'custom';

export type DecorFillToken =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'gray';

export type SerializedDecorBlockNode = Spread<
  {
    type: 'border-block';
    version: 3;
    weight: BorderWeight;
    color: string;
    fill: DecorFillMode;
    fillToken?: DecorFillToken | null;
    fillColor?: string | null;
  },
  SerializedElementNode
>;

export class DecorBlockNode extends ElementNode {
  __weight: BorderWeight;
  __color: string;
  __fill: DecorFillMode;
  __fillToken: DecorFillToken | null;
  __fillColor: string | null;

  static getType(): string {
    return 'border-block';
  }

  static clone(node: DecorBlockNode): DecorBlockNode {
    return new DecorBlockNode(
      node.__weight,
      node.__color,
      node.__fill,
      node.__fillToken,
      node.__fillColor,
      node.__key,
    );
  }

  constructor(
    weight: BorderWeight = 'thin',
    color: string = 'black',
    fill: DecorFillMode = 'none',
    fillToken: DecorFillToken | null = null,
    fillColor: string | null = null,
    key?: NodeKey,
  ) {
    super(key);
    this.__weight = weight ?? 'thin';
    this.__color = color ?? 'black';
    this.__fill = fill ?? 'none';
    this.__fillToken = this.__fill === 'token' ? (fillToken ?? null) : null;
    this.__fillColor =
      this.__fill === 'custom' ? normalizeHex(fillColor) : null;
  }

  /** Apply attributes (no inline style) */
  private applyAttributes(el: HTMLElement) {
    if (this.__weight !== 'none') {
      el.classList.add('bp-border');
      el.setAttribute('data-bp-weight', this.__weight);
      el.setAttribute('data-bp-color', this.__color);
    } else {
      el.classList.remove('bp-border');
      el.removeAttribute('data-bp-weight');
      el.removeAttribute('data-bp-color');
    }

    if (this.__fill === 'none') {
      el.classList.remove('bp-decor');
      el.removeAttribute('data-bp-fill');
      el.removeAttribute('data-bp-fill-token');
      el.style.removeProperty('--bp-fill-color');
      return;
    }

    el.classList.add('bp-decor');
    el.setAttribute('data-bp-fill', this.__fill);

    if (this.__fill === 'token') {
      if (this.__fillToken) {
        el.setAttribute('data-bp-fill-token', this.__fillToken);
      } else {
        el.removeAttribute('data-bp-fill-token');
      }
      el.style.removeProperty('--bp-fill-color');
    } else if (this.__fill === 'custom') {
      el.removeAttribute('data-bp-fill-token');
      const color = normalizeHex(this.__fillColor);
      if (color) {
        el.style.setProperty('--bp-fill-color', color);
      } else {
        el.style.removeProperty('--bp-fill-color');
      }
    }
  }

  createDOM(): HTMLElement {
    const el = document.createElement('div');
    this.applyAttributes(el);
    return el;
  }

  updateDOM(prevNode: DecorBlockNode, dom: HTMLElement): boolean {
    if (
      prevNode.__weight !== this.__weight ||
      prevNode.__color !== this.__color ||
      prevNode.__fill !== this.__fill ||
      prevNode.__fillToken !== this.__fillToken ||
      prevNode.__fillColor !== this.__fillColor
    ) {
      this.applyAttributes(dom);
    }
    // Returning false means Lexical won't re-create the DOM element
    return false;
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('div');
    this.applyAttributes(el);
    return { element: el };
  }

  static importJSON(json: SerializedDecorBlockNode): DecorBlockNode {
    return new DecorBlockNode(
      json.weight ?? 'thin',
      json.color ?? 'black',
      json.fill ?? 'none',
      (json.fillToken as DecorFillToken | null) ?? null,
      json.fillColor ?? null,
    );
  }

  exportJSON(): SerializedDecorBlockNode {
    const base = super.exportJSON();
    return {
      ...base,
      type: 'border-block',
      version: 3,
      weight: this.__weight,
      color: this.__color,
      fill: this.__fill,
      fillToken: this.__fillToken,
      fillColor: this.__fillColor,
    };
  }

  // Lexical mutation helpers
  setWeight(weight: BorderWeight) {
    const writable = this.getWritable<DecorBlockNode>();
    writable.__weight = weight;
  }

  setColor(color: string) {
    const writable = this.getWritable<DecorBlockNode>();
    writable.__color = color;
  }

  setFill(fill: DecorFillMode) {
    const writable = this.getWritable<DecorBlockNode>();
    writable.__fill = fill;
    if (fill !== 'token') writable.__fillToken = null;
    if (fill !== 'custom') writable.__fillColor = null;
  }

  setFillToken(token: DecorFillToken | null) {
    const writable = this.getWritable<DecorBlockNode>();
    writable.__fillToken = token;
  }

  setFillColor(color: string | null) {
    const writable = this.getWritable<DecorBlockNode>();
    writable.__fillColor = normalizeHex(color);
  }

  getWeight(): BorderWeight {
    return this.__weight;
  }

  getColor(): string {
    return this.__color;
  }

  getFill(): DecorFillMode {
    return this.__fill;
  }

  getFillToken(): DecorFillToken | null {
    return this.__fillToken;
  }

  getFillColor(): string | null {
    return this.__fillColor;
  }
}

export function $createDecorBlockNode(
  weight: BorderWeight,
  color: string = 'black',
  fill: DecorFillMode = 'none',
  fillToken: DecorFillToken | null = null,
  fillColor: string | null = null,
): DecorBlockNode {
  return new DecorBlockNode(weight, color, fill, fillToken, fillColor);
}

export function $isDecorBlockNode(
  node: LexicalNode | null | undefined,
): node is DecorBlockNode {
  return node instanceof DecorBlockNode;
}

function normalizeHex(input: string | null): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;
  const hex = value.startsWith('#') ? value.slice(1) : value;
  if (!/^([0-9a-fA-F]{6})$/.test(hex)) return null;
  return `#${hex.toUpperCase()}`;
}

export type SerializedBorderBlockNode = SerializedDecorBlockNode;
export { DecorBlockNode as BorderBlockNode };
export {
  $createDecorBlockNode as $createBorderBlockNode,
  $isDecorBlockNode as $isBorderBlockNode,
};
