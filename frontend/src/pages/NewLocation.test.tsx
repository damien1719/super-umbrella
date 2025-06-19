import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import NewLocation from './NewLocation';

describe('NewLocation page', () => {
  it('renders the location form', () => {
    render(
      <MemoryRouter initialEntries={['/biens/1/locations/new']}>
        <Routes>
          <Route path="/biens/:id/locations/new" element={<NewLocation />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/loyer hors charges/i)).toBeInTheDocument();
  });
});
