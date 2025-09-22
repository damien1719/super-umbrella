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
}

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
}

export type Answers = Record<
  string,
  string | string[] | number | boolean | Record<string, unknown>
>;
