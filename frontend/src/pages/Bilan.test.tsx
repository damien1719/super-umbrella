import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Bilan from './Bilan';

describe('Bilan page', () => {
  it('renders return button', () => {
    render(
      <MemoryRouter initialEntries={['/bilan/1']}>
        <Routes>
          <Route path="/bilan/:bilanId" element={<Bilan />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
  });
});
