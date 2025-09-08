import {
  FileText,
  ClipboardList,
  Eye,
  Brain,
  Target,
  BookOpen,
  Radar,
  Layers,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type CategoryId =
  | 'anamnese'
  | 'tests_standards'
  | 'observations'
  | 'profil_sensoriel'
  | 'conclusion';

export interface Category {
  id: CategoryId;
  title: string;
  icon: LucideIcon;
  // Optional image used in cards/previews for this category
  image?: string;
}

export interface SectionInfo {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

export const categories: Category[] = [
  {
    id: 'anamnese',
    title: 'Anamnèse',
    icon: BookOpen,
    image: '/anamnese.png',
  },
  {
    id: 'tests_standards',
    title: 'Tests standards',
    icon: ClipboardList,
    image: '/tests-standards.png',
  },
  {
    id: 'observations',
    title: 'Observations',
    icon: Eye,
    image: '/observations.png',
  },
  {
    id: 'profil_sensoriel',
    title: 'Profil sensoriel',
    icon: Radar,
    image: '/profil-sensoriel.png',
  },
  /*   { id: 'bilan_complet', title: 'Bilan complet', icon: Layers },
   */ {
    id: 'conclusion',
    title: 'Conclusion',
    icon: Brain,
    image: '/conclusion.png',
  },
];

// Sections avec descriptions pour AiRightPanel
export const sections: SectionInfo[] = [
  {
    id: 'anamnese',
    title: 'Anamnèse',
    icon: BookOpen,
    description: 'Histoire personnelle et familiale',
  },
  {
    id: 'tests-standards',
    title: 'Tests',
    icon: ClipboardList,
    description: 'Résultats des tests standardisés',
  },
  {
    id: 'observations',
    title: 'Observations',
    icon: Eye,
    description: 'Observations comportementales et motrices',
  },
  {
    id: 'profil-sensoriel',
    title: 'Profil sensoriel',
    icon: Radar,
    description: 'Évaluation des capacités sensorielles',
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    icon: Brain,
    description: 'Résultats des tests standardisés',
  },
];

// Mapping des IDs d'interface vers CategoryId
export const kindMap: Record<string, CategoryId> = {
  anamnese: 'anamnese',
  'profil-sensoriel': 'profil_sensoriel',
  observations: 'observations',
  'tests-standards': 'tests_standards',
  conclusion: 'conclusion',
};
