export interface Question {
  id: string;
  type: 'notes' | 'choix-multiple' | 'echelle' | 'tableau' | 'titre';
  titre: string;
  contenu?: string;
  options?: string[];
  echelle?: { min: number; max: number; labels?: { min: string; max: string } };
  tableau?: {
    lignes: string[];
    colonnes?: string[];
    valeurType?: 'texte' | 'score' | 'choix-multiple' | 'case-a-cocher';
    options?: string[];
    commentaire?: boolean;
  };
}

export type Answers = Record<
  string,
  string | string[] | number | boolean | Record<string, unknown>
>;
