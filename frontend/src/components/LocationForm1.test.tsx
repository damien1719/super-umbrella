import { render, screen } from '@testing-library/react';
import LocationForm1 from './LocationForm1';
import { describe, it, expect } from 'vitest';

describe('LocationForm1', () => {
  it('renders required fields', () => {
    render(<LocationForm1 data={{}} onChange={() => {}} />);
    expect(screen.getByLabelText(/loyer hors charges/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/montant du dépôt de garantie/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/date début du bail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre d'exemplaires/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/situation locative précédente/i),
    ).toBeInTheDocument();
  });
});
