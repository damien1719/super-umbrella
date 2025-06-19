import { render, screen } from '@testing-library/react';
import LocataireForm from './LocataireForm';
import { describe, it, expect } from 'vitest';

describe('LocataireForm', () => {
  it('renders required fields', () => {
    render(<LocataireForm data={{}} onChange={() => {}} />);
    expect(screen.getByLabelText(/civilité/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Prénom$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nom$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date de naissance/i)).toBeInTheDocument();
  });
});
