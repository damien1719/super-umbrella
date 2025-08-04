export type CategoryId =
  | 'anamnese'
  | 'tests_standards'
  | 'observations'
  | 'profil_sensoriel'
  | 'conclusion';

export interface Category {
  id: CategoryId;
  title: string;
}

export const categories: Category[] = [
  { id: 'anamnese', title: 'Anamnèse' },
  { id: 'tests_standards', title: 'Tests standards' },
  { id: 'observations', title: 'Observations' },
  { id: 'profil_sensoriel', title: 'Profil sensoriel' },
  { id: 'conclusion', title: 'Conclusion' },
];
