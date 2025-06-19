import { render, screen } from '@testing-library/react';
import InventaireForm from './InventaireForm';
import { describe, it, expect } from 'vitest';

describe('InventaireForm', () => {
  it('renders required fields and mobilier options', () => {
    render(<InventaireForm data={{}} onChange={() => {}} />);
    expect(screen.getByLabelText(/pièce/i)).toBeInTheDocument();
    const select = screen.getByLabelText(/mobilier/i);
    expect(select.tagName).toBe('SELECT');
    expect(
      screen.getByRole('option', { name: 'BOUILLOIRE' }),
    ).toBeInTheDocument();
  });
});
