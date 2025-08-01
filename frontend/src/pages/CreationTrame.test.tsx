import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreationTrame from './CreationTrame';
import { useSectionStore } from '../store/sections';
import { vi } from 'vitest';

it('shows import magique button', () => {
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
});
