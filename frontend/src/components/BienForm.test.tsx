import { render, screen } from '@testing-library/react';
import BienForm from './BienForm';
import { describe, it, expect } from 'vitest';

describe('BienForm', () => {
  it('renders extra fields', () => {
    render(<BienForm onCancel={() => {}} />);
    expect(screen.getByLabelText(/code postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre de chambres/i)).toBeInTheDocument();
  });
});
