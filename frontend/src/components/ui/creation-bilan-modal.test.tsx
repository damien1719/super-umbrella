import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreationBilan } from './creation-bilan-modal';

describe('CreationBilan', () => {
  it('passes the title to callbacks', () => {
    const onNew = vi.fn();
    const onExisting = vi.fn();
    render(
      <CreationBilan
        isOpen={true}
        onClose={() => {}}
        onNewPatient={onNew}
        onExistingPatient={onExisting}
        hasPatients={true}
      />,
    );
    const input = screen.getByLabelText(/titre du bilan/i);
    fireEvent.change(input, { target: { value: 'Mon bilan' } });

    // Test nouveau patient
    fireEvent.click(screen.getByText(/nouveau patient/i));
    expect(onNew).toHaveBeenCalledWith('Mon bilan');

    // Test patient existant
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'patient-1' } });
    fireEvent.click(screen.getByText(/patient existant/i));
    expect(onExisting).toHaveBeenCalledWith('Mon bilan', 'patient-1');
  });
});
