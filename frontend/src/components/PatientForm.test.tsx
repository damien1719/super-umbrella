import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PatientForm from './PatientForm';

describe('PatientForm', () => {
  it('renders fields', () => {
    render(<PatientForm onCancel={() => {}} />);
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/nom/i)[0]).toBeInTheDocument();
  });
});
