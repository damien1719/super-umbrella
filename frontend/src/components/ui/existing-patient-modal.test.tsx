import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExistingPatientModal } from './existing-patient-modal';
import { usePatientStore, type PatientState } from '@/store/patients';

describe('ExistingPatientModal', () => {
  it('lists patients from the store and calls callback on select', () => {
    const fetchAll = vi.fn().mockResolvedValue(undefined);
    usePatientStore.setState({
      items: [
        { id: '1', firstName: 'Alice', lastName: 'Dupont' },
        { id: '2', firstName: 'Bob', lastName: 'Martin' },
      ],
      fetchAll,
    } as Partial<PatientState>);
    const onSelect = vi.fn();
    render(
      <ExistingPatientModal
        isOpen={true}
        onClose={() => {}}
        onPatientSelected={onSelect}
      />,
    );
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Bob Martin'));
    expect(onSelect).toHaveBeenCalledWith('2');
    expect(fetchAll).toHaveBeenCalled();
    usePatientStore.setState({
      items: [],
      fetchAll: async () => {},
    } as Partial<PatientState>);
  });
});
