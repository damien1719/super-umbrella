import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Patients from './Patients';
import { usePatientStore } from '../store/patients';

describe('Patients page', () => {
  it('lists patients fetched from the store', async () => {
    const fetchAll = vi.fn().mockResolvedValue(undefined);
    usePatientStore.setState({
      items: [{ id: '1', firstName: 'Jane', lastName: 'Doe' }],
      fetchAll,
      remove: vi.fn(),
    } as Partial<ReturnType<typeof usePatientStore.getState>>);

    render(
      <MemoryRouter initialEntries={['/patients']}>
        <Routes>
          <Route path="/patients" element={<Patients />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(fetchAll).toHaveBeenCalled();
    expect(await screen.findByText(/Doe/)).toBeInTheDocument();
  });
});
