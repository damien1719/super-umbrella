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
};

export type ScaleQuestion = {
  id: string;
  type: 'echelle';
  titre: string;
  echelle: { min: number; max: number; labels?: { min: string; max: string } };
};

export type TableQuestion = {
  id: string;
  type: 'tableau';
  titre: string;
  tableau: {
    lignes: string[];
    colonnes?: string[];
    valeurType?: 'texte' | 'score' | 'choix-multiple' | 'case-a-cocher';
    options?: string[];
    commentaire?: boolean;
  };
};

export type TitleQuestion = {
  id: string;
  type: 'titre';
  titre: string;
};

export type Question =
  | NotesQuestion
  | MultiChoiceQuestion
  | ScaleQuestion
  | TableQuestion
  | TitleQuestion;

export type Answers = Record<
  string,
  string | string[] | number | boolean | Record<string, unknown>
>;
