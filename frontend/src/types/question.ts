export interface Question {
  id: string;
  type: 'notes' | 'choix-multiple' | 'echelle' | 'tableau';
  titre: string;
  contenu?: string;
  options?: string[];
  echelle?: { min: number; max: number; labels?: { min: string; max: string } };
  tableau?: { lignes: string[] };
}

export type Answers = Record<
  string,
  string | string[] | number | Record<string, string | number>
>;
