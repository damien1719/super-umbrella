export type ValueType =
  | 'bool'
  | 'number'
  | 'text'
  | 'choice'
  | 'multi-choice'
  | 'multi-choice-row'
  | 'image';

export interface ColumnDef {
  id: string;
  label: string;
  valueType: ValueType;
  options?: string[];
  rowOptions?: Record<string, string[]>;
  coloring?: {
    presetId?: string            // optionnel : applique un set de règles connu
    rules?: Rule[] }
}

export type Rule = {
  if:
    | { op: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'neq'; value: number | string }
    | { op: 'between'; min: number; max: number; inclusive?: boolean }
    | { op: 'in' | 'notIn'; values: (string | number)[] }
    | { op: 'isEmpty' | 'isNotEmpty' };
  color: string; // couleur directement utilisée (nom CSS, hex, token…)
};

export interface ColorPreset {
  id: string;
  label: string;
  rules: Rule[];
}

// ---- Presets exportés ----
export const SD_NORMATIVE_PRESET: ColorPreset = {
  id: 'sd-normative',
  label: 'Échelle normative DS -3↔︎+3 (chiffre uniquement)',
  rules: [
    // Très faible  (-∞, -2)
    { if: { op: 'lt', value: -2 }, color: 'red' },

    // Faible      [-2, -1)
    { if: { op: 'eq', value: -2 }, color: 'orange' },
    { if: { op: 'between', min: -2, max: -1, inclusive: false }, color: 'orange' },

    // Moyenne     [-1, +1]
    { if: { op: 'eq', value: -1 }, color: 'green' },
    { if: { op: 'between', min: -1, max: 1, inclusive: true }, color: 'green' },

    // Sup         (1, 2]
    { if: { op: 'between', min: 1, max: 2, inclusive: true }, color: 'lightgreen' },

    // Très sup    (2, +∞)
    { if: { op: 'gt', value: 2 }, color: 'limegreen' },
  ],
};

// Registre global si tu veux les exposer tous
export const COLOR_PRESETS: Record<string, ColorPreset> = {
  [SD_NORMATIVE_PRESET.id]: SD_NORMATIVE_PRESET,
};

export interface Row {
  id: string;
  label: string;
  media?: { src: string; alt?: string };
  labelParts?: string[];
}

export interface Footer {
  formula: string;
  columnId?: string;
  label?: string;
}

export interface RowsGroup {
  id: string;
  title: string;
  rows: Row[];
  footer?: Footer;
  showIndex?: boolean;
}

export interface SurveyTable {
  columns: ColumnDef[];
  rowsGroups: RowsGroup[];
  commentaire?: boolean;
  /**
   * Indique si le rapport final doit contenir un tableau généré côté client
   * identifié par une ancre `[[CR:TBL|id=...]]`.
   */
  crInsert?: boolean;
  /** Identifiant unique de l'ancre, ex: "T1" */
  crTableId?: string;
}

export interface Question {
  id: string;
  type:
    | 'notes'
    | 'choix-multiple'
    | 'choix-unique'
    | 'echelle'
    | 'tableau'
    | 'titre';
  titre: string;
  contenu?: string;
  options?: string[];
  commentaire?: boolean;
  echelle?: { min: number; max: number; labels?: { min: string; max: string } };
  tableau?: SurveyTable;
  titrePresetId?: string;
  titreFormatOverride?: TitleFormatSpec;
}

export type Answers = Record<
  string,
  string | string[] | number | boolean | Record<string, unknown>
>;

export const DEFAULT_TITLE_PRESETS: TitlePresetRegistry = {
  't11-italic': {
    id: 't11-italic',
    label: '11 italique',
    format: { kind: 'paragraph', fontSize: 11, italic: true },
  },
  't12-underline': {
    id: 't12-underline',
    label: '12 souligné',
    format: { kind: 'paragraph', underline: true },
  },
  't12-bold': {
    id: 't12-bold',
    label: '12 gras',
    format: { kind: 'paragraph', fontSize: 12, bold: true },
  },
  't12-italic': {
    id: 't12-italic',
    label: '12 italique',
    format: { kind: 'paragraph', fontSize: 12, italic: true },
  },
  't12-italic-underline': {
    id: 't12-italic-underline',
    label: '12 italique souligné',
    format: { kind: 'paragraph', fontSize: 12, italic: true, underline: true },
  },
  't12-bullet-bold': {
    id: 't12-bullet-bold',
    label: '12 puce gras',
    format: { kind: 'list-item', fontSize: 12, bold: true },
  },
  't12-bullet-underline': {
    id: 't12-bullet-underline',
    label: '12 puce souligné',
    format: { kind: 'list-item', fontSize: 12, underline: true },
  },
  't14-bold-underline': {
    id: 't14-bold-underline',
    label: '14 gras souligné',
    format: { kind: 'paragraph', fontSize: 14, bold: true, underline: true },
  },
  't14-center-bold': {
    id: 't14-center-bold',
    label: '14 centré gras',
    format: { kind: 'paragraph', fontSize: 14, bold: true, align: 'center' },
  },
  't14-center-uppercase': {
    id: 't14-center-uppercase',
    label: '14 centré majuscule',
    format: { kind: 'paragraph', fontSize: 14, align: 'center', case: 'uppercase' },
  },
};

// ---- nouveaux types pour le formatage de titre ----
export type TitleAlign = 'left' | 'center' | 'right' | 'justify';
export type TitleCase = 'none' | 'uppercase' | 'capitalize' | 'lowercase';
export type TitleKind = 'heading' | 'paragraph' | 'list-item';

export interface TitleFormatSpec {
  kind: TitleKind; // ex: 'heading'
  level?: 1 | 2 | 3 | 4 | 5 | 6; // requis si kind === 'heading'
  align?: TitleAlign; // centrage, etc.
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  case?: TitleCase; // transformations de casse
  /**
   * Segments optionnels si tu veux des styles mélangés
   * (ex: "Titre" en gras + "(sous-titre)" en italique).
   * Si non fourni, on applique le style global au texte entier.
   */
  fontSize?: string | number; // ex: '1.5rem' ou 24
  runs?: Array<{
    // Le texte est fourni au runtime; ici on ne stocke que le style.
    // Utiliser 'label' | 'suffix' | 'prefix' comme clefs d’assignation est possible côté UI.
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  }>;
  /** Décorations simples sans toucher au contenu (facile pour les presets) */
  prefix?: string;
  suffix?: string;
}

export interface TitlePreset {
  id: string; // ex: 'h2-centered-strong'
  label: string; // ex: 'H2 centré gras'
  format: TitleFormatSpec; // la recette de style
}

/** Registre typé de presets, libre à toi de le remplir côté app */
export type TitlePresetRegistry = Record<string, TitlePreset>;
