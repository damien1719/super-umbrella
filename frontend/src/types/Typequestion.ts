export type NotesQuestion = {
  id: string;
  type: 'notes';
  titre: string;
  contenu: string;
};

export type MultiChoiceQuestion = {
  id: string;
  type: 'choix-multiple';
  titre: string;
  options: string[];
  commentaire?: boolean;
};

export type SingleChoiceQuestion = {
  id: string;
  type: 'choix-unique';
  titre: string;
  options: string[];
  commentaire?: boolean;
};

export type ScaleQuestion = {
  id: string;
  type: 'echelle';
  titre: string;
  echelle: { min: number; max: number; labels?: { min: string; max: string } };
};

export type ValueType =
  | 'bool'
  | 'number'
  | 'text'
  | 'choice'
  | 'multi-choice'
  | 'multi-choice-row'
  | 'image';

export type ColumnDef = {
  id: string;
  label: string;
  valueType: ValueType;
  /** Facultatif: enum pour 'choice' */
  options?: string[];
  rowOptions?: Record<string, string[]>;
};

export type Row = {
  id: string;
  /** Libellé principal (Markdown ou texte simple) */
  label: string;
  /** S’il y a une image plutôt qu’un texte */
  media?: { src: string; alt?: string };
  /** Pour les étiquettes coupées : ["La balle", "la plus grosse"] */
  labelParts?: string[];
};

export type Footer = {
  /** ex. "countTrue" ou "sum" */
  formula: string;
  columnId?: string; // si formule liée à une colonne (Oui / Non)
  label?: string; // "/5"
};

export type RowsGroup = {
  id: string;
  title: string; // 1. PROFIL HYPOREACTIF
  rows: Row[];
  footer?: Footer;
  showIndex?: boolean; // numérotation automatique
};

export type SurveyTable = {
  columns: ColumnDef[];
  rowsGroups: RowsGroup[];
  commentaire?: boolean;
  crInsert?: boolean;
  crTableId?: string;
  crAstId?: string;
};

export type TableQuestion = {
  id: string;
  type: 'tableau';
  titre: string;
  tableau: SurveyTable;
};

export type TitleQuestion = {
  id: string;
  type: 'titre';
  titre: string;
};

export type Question =
  | NotesQuestion
  | MultiChoiceQuestion
  | SingleChoiceQuestion
  | ScaleQuestion
  | TableQuestion
  | TitleQuestion;

export type Answers = Record<
  string,
  string | string[] | number | boolean | Record<string, unknown>
>;
