import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreationTrame from './CreationTrame';
import { useSectionStore } from '../store/sections';
import { vi } from 'vitest';

it('shows navigation tabs', () => {
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
});
