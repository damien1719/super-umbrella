import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Bibliotheque from './Bibliothèque';

describe('Bibliothèque page', () => {
  it('renders the header', () => {
    render(
      <MemoryRouter initialEntries={['/bibliotheque']}>
        <Routes>
          <Route path="/bibliotheque" element={<Bibliotheque />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /biblioth[eè]que/i }),
    ).toBeInTheDocument();
  });
});
