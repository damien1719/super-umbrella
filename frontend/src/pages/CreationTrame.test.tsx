import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreationTrame from './CreationTrame';
import { useSectionStore } from '../store/sections';
import { useSectionExampleStore } from '../store/sectionExamples';
import { useSectionTemplateStore } from '../store/sectionTemplates';
import { vi } from 'vitest';

const tplCreate = vi.fn().mockResolvedValue({
  id: 'tpl',
  label: '',
  ast: null,
  slots: [],
  stylePrompt: '',
});

it('shows navigation tabs', async () => {
  useSectionStore.setState({
    fetchOne: vi.fn().mockResolvedValue({ title: '', kind: '', schema: [] }),
    update: vi.fn(),
  });
  useSectionTemplateStore.setState({ create: tplCreate });
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
  expect(screen.getByRole('button', { name: /Template/i })).toBeInTheDocument();
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
          tableau: {
            columns: [],
            sections: [{ id: 's1', title: '', rows: [] }],
          },
        },
      ],
    }),
    update: vi.fn(),
  });
  useSectionTemplateStore.setState({ create: tplCreate });
  render(
    <MemoryRouter initialEntries={['/creation-trame/1']}>
      <Routes>
        <Route path="/creation-trame/:sectionId" element={<CreationTrame />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    await screen.findByRole('button', {
      name: /\+ Ajouter une zone de commentaire/i,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText(/Ajouter une colonne/),
  ).toBeInTheDocument();
});

it('prompts to save when leaving and saves on confirm', async () => {
  const update = vi.fn().mockResolvedValue(undefined);
  useSectionStore.setState({
    fetchOne: vi.fn().mockResolvedValue({ title: '', kind: '', schema: [] }),
    update,
  });
  useSectionExampleStore.setState({ create: vi.fn() });
  useSectionTemplateStore.setState({ create: tplCreate });

  render(
    <MemoryRouter initialEntries={['/creation-trame/1']}>
      <Routes>
        <Route path="/creation-trame/:sectionId" element={<CreationTrame />} />
      </Routes>
    </MemoryRouter>,
  );

  await screen.findByRole('button', { name: /Déplacer la question/i });

  fireEvent.click(screen.getByRole('button', { name: /Retour/i }));

  expect(
    await screen.findByText(
      /Souhaitez-vous conserver les modifications apportées/i,
    ),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Oui' }));

  await waitFor(() => expect(update).toHaveBeenCalled());
  expect(tplCreate).toHaveBeenCalled();
});
