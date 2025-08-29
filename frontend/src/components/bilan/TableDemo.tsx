import React from 'react';
import { TableQuestion } from './TableQuestion';
import type { Question } from '@/types/question';

// Exemple de question tableau avec beaucoup de colonnes pour démontrer les améliorations
const demoQuestion: Question = {
  id: 'demo-table',
  type: 'tableau',
  titre: 'Démonstration des améliorations UI',
  tableau: {
    columns: [
      {
        id: 'col1',
        label: 'Colonne de texte très longue pour tester la troncature',
        valueType: 'text',
      },
      {
        id: 'col2',
        label: 'Case à cocher',
        valueType: 'bool',
      },
      {
        id: 'col3',
        label: 'Liste déroulante',
        valueType: 'choice',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
      },
      {
        id: 'col4',
        label: 'Choix multiples',
        valueType: 'multi-choice',
        options: [
          'Chip très long pour tester la largeur',
          'Chip 2',
          'Chip 3',
          'Chip 4',
          'Chip 5',
          'Chip 6',
          'Chip 7',
          'Chip 8',
        ],
      },
      {
        id: 'col5',
        label: 'Nombre',
        valueType: 'number',
      },
      {
        id: 'col6',
        label: 'Image URL',
        valueType: 'image',
      },
      {
        id: 'col7',
        label: 'Choix multiples par ligne',
        valueType: 'multi-choice-row',
        rowOptions: {
          row1: [
            'Option A',
            'Option B',
            'Option C',
            'Option D',
            'Option E',
            'Option F',
          ],
          row2: ['Choix 1', 'Choix 2', 'Choix 3', 'Choix 4', 'Choix 5'],
        },
      },
    ],
    rowsGroups: [
      {
        id: 'group1',
        title: 'Groupe de démonstration',
        rows: [
          {
            id: 'row1',
            label:
              'Ligne avec un label très long pour tester la troncature de la colonne des lignes',
          },
          { id: 'row2', label: 'Ligne 2' },
          { id: 'row3', label: 'Ligne 3' },
        ],
      },
    ],
  },
};

export function TableDemo() {
  const [values, setValues] = React.useState<Record<string, any>>({});

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Démonstration des améliorations UI des tableaux
        </h2>
        <p className="text-gray-600">
          Ce composant démontre les améliorations apportées à l'interface des
          tableaux :
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
          <li>Colonne des lignes avec largeur maximale limitée</li>
          <li>Colonnes de type "Case à cocher" avec taille réduite</li>
          <li>Colonnes de type "Liste déroulante" avec largeur maximale</li>
          <li>Système de pagination pour les chips avec bouton "+" et "-"</li>
          <li>Gestion du débordement horizontal avec scroll</li>
        </ul>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <TableQuestion
          question={demoQuestion}
          value={values}
          onChange={setValues}
        />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">
          Valeurs actuelles :
        </h3>
        <pre className="text-sm text-blue-700 overflow-auto">
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </div>
  );
}
