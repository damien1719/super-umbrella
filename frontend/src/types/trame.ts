import { FileText, ClipboardList, Eye, Brain } from "lucide-react";

export type CategoryId =
  | 'anamnese'
  | 'tests_standards'
  | 'observations'
  | 'profil_sensoriel'
  | 'bilan_complet'
  | 'conclusion';

export interface Category {
  id: CategoryId; 
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const categories: Category[] = [
  { id: 'anamnese', title: 'Anamnèse', icon: FileText },
  { id: 'tests_standards', title: 'Tests standards', icon: ClipboardList },
  { id: 'observations', title: 'Observations', icon: Eye },
  { id: 'profil_sensoriel', title: 'Profil sensoriel', icon: Brain },
  { id: 'bilan_complet', title: 'Bilan complet', icon: Brain },
  { id: 'conclusion', title: 'Conclusion', icon: Brain },
];
