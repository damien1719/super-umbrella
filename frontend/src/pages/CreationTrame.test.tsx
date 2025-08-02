import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreationTrame from './CreationTrame';
import { useSectionStore } from '../store/sections';
import { vi } from 'vitest';

it('shows navigation tabs', async () => {
  useSectionStore.setState({
    fetchOne: vi.fn().mockResolvedValue({ title: '', kind: '', schema: [] }),
    update: vi.fn(),
  });
  render(
    <MemoryRouter initialEntries={['/creation-trame/1']}>
      <Routes>
        <Route path="/creation-trame/:sectionId" element={<CreationTrame />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    screen.getByRole('button', { name: /import magique/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /Questions/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /Pré-visualisation/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Exemples/i })).toBeInTheDocument();
  expect(
    await screen.findByRole('button', { name: /Déplacer la question/i }),
  ).toBeInTheDocument();
});

it('shows table specific options', async () => {
  useSectionStore.setState({
    fetchOne: vi.fn().mockResolvedValue({
      title: '',
      kind: '',
      schema: [
        {
          id: 't1',
          type: 'tableau',
          titre: 'Table',
          tableau: { lignes: [], colonnes: [] },
        },
      ],
    }),
    update: vi.fn(),
  });
  render(
    <MemoryRouter initialEntries={['/creation-trame/1']}>
      <Routes>
        <Route path="/creation-trame/:sectionId" element={<CreationTrame />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    await screen.findByRole('button', { name: /\+ Ajout case commentaire/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Type de valeur/)).toBeInTheDocument();
});
