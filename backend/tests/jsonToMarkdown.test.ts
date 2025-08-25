import { bilanJsonToMarkdown, bilanWithSectionsToMarkdown } from '../src/utils/jsonToMarkdown';

describe('jsonToMarkdown', () => {
  describe('bilanJsonToMarkdown', () => {
    it('devrait convertir un état Lexical simple en markdown', () => {
      const lexicalState = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Ceci est un test',
                  format: 0,
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          version: 1,
        },
      };

      const result = bilanJsonToMarkdown(lexicalState);
      expect(result).toBe('Ceci est un test\n');
    });

    it('devrait gérer le formatage du texte', () => {
      const lexicalState = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Texte en gras et italique',
                  format: 3, // 1 (bold) + 2 (italic)
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          version: 1,
        },
      };

      const result = bilanJsonToMarkdown(lexicalState);
      expect(result).toBe('*Texte en gras et italique*\n');
    });

    it('devrait gérer les titres', () => {
      const lexicalState = {
        root: {
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: 'Titre de section',
                  format: 0,
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          version: 1,
        },
      };

      const result = bilanJsonToMarkdown(lexicalState);
      expect(result).toBe('## Titre de section\n');
    });

    it('devrait gérer les listes', () => {
      const lexicalState = {
        root: {
          children: [
            {
              type: 'list',
              children: [
                {
                  type: 'listitem',
                  children: [
                    {
                      type: 'text',
                      text: 'Premier élément',
                      format: 0,
                      version: 1,
                    },
                  ],
                  version: 1,
                },
                {
                  type: 'listitem',
                  children: [
                    {
                      type: 'text',
                      text: 'Deuxième élément',
                      format: 0,
                      version: 1,
                    },
                  ],
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          version: 1,
        },
      };

      const result = bilanJsonToMarkdown(lexicalState);
      expect(result).toBe('- Premier élément\n- Deuxième élément\n');
    });

    it('devrait gérer les slots', () => {
      const lexicalState = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Observation: ',
                  format: 0,
                  version: 1,
                },
                {
                  type: 'slot',
                  slotId: 'obs_1',
                  slotLabel: 'Observation principale',
                  slotType: 'text',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          version: 1,
        },
      };

      const result = bilanJsonToMarkdown(lexicalState);
      expect(result).toBe('Observation: [Observation principale (text)]\n');
    });

    it('devrait gérer les objets simples (fallback)', () => {
      const simpleObject = {
        observation: 'Patient calme et coopératif',
        tests: ['Test A', 'Test B'],
        notes: {
          comportement: 'Normal',
          attention: 'Bon niveau',
        },
      };

      const result = bilanJsonToMarkdown(simpleObject);
      expect(result).toContain('**observation:** Patient calme et coopératif');
      expect(result).toContain('**tests:**');
      expect(result).toContain('- Test A');
      expect(result).toContain('- Test B');
      expect(result).toContain('## notes');
      expect(result).toContain('**comportement:** Normal');
    });

    it('devrait gérer les cas d\'erreur', () => {
      expect(bilanJsonToMarkdown(null)).toBe('Aucun contenu disponible');
      expect(bilanJsonToMarkdown(undefined)).toBe('Aucun contenu disponible');
      expect(bilanJsonToMarkdown('')).toBe('Format de contenu non reconnu');
    });
  });

  describe('bilanWithSectionsToMarkdown', () => {
    it('devrait convertir un bilan complet avec sections', () => {
      const bilan = {
        title: 'Bilan psychomoteur',
        date: '2024-01-15T10:00:00Z',
        patient: {
          firstName: 'Jean',
          lastName: 'Dupont',
        },
        descriptionJson: {
          root: {
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Bilan complet du patient',
                    format: 0,
                    version: 1,
                  },
                ],
                version: 1,
              },
            ],
            version: 1,
          },
        },
        sections: [
          {
            order: 1,
            section: { title: 'Anamnèse' },
            contentNotes: {
              motif: 'Consultation pour troubles attentionnels',
              antecedents: 'Aucun antécédent notable',
            },
            test: 'Entretien clinique',
          },
          {
            order: 2,
            section: { title: 'Tests' },
            contentNotes: {
              resultats: 'Score normal',
            },
            generatedContent: {
              root: {
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Résultats des tests',
                        format: 0,
                        version: 1,
                      },
                    ],
                    version: 1,
                  },
                ],
                version: 1,
              },
            },
          },
        ],
      };

      const result = bilanWithSectionsToMarkdown(bilan);
      
      expect(result).toContain('# Bilan psychomoteur');
      expect(result).toContain('**Patient:** Jean Dupont');
      expect(result).toContain('**Date:** 15/01/2024');
      expect(result).toContain('## Contenu du bilan');
      expect(result).toContain('Bilan complet du patient');
      expect(result).toContain('## Sections détaillées');
      expect(result).toContain('### Anamnèse');
      expect(result).toContain('**motif:** Consultation pour troubles attentionnels');
      expect(result).toContain('**Test:** Entretien clinique');
      expect(result).toContain('### Tests');
      expect(result).toContain('**resultats:** Score normal');
      expect(result).toContain('**Contenu généré:**');
      expect(result).toContain('Résultats des tests');
    });

    it('devrait gérer les bilans sans sections', () => {
      const bilan = {
        title: 'Bilan simple',
        descriptionJson: {
          root: {
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Contenu simple',
                    format: 0,
                    version: 1,
                  },
                ],
                version: 1,
              },
            ],
            version: 1,
          },
        },
      };

      const result = bilanWithSectionsToMarkdown(bilan);
      
      expect(result).toContain('# Bilan simple');
      expect(result).toContain('## Contenu du bilan');
      expect(result).toContain('Contenu simple');
      expect(result).not.toContain('## Sections détaillées');
    });

    it('devrait gérer les bilans vides', () => {
      expect(bilanWithSectionsToMarkdown(null)).toBe('Aucun bilan disponible');
      expect(bilanWithSectionsToMarkdown({})).toBe('Aucun contenu disponible');
    });
  });
});
