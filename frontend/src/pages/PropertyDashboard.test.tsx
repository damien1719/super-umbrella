import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PropertyDashboard from './PropertyDashboard';

describe('PropertyDashboard page', () => {
  it('renders property info', () => {
    render(
      <MemoryRouter initialEntries={['/biens/1/dashboard']}>
        <Routes>
          <Route path="/biens/:id/dashboard" element={<PropertyDashboard />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Bien Immobilier/i)).toBeInTheDocument();
  });
});
