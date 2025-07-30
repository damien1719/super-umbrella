import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import InventoryPage from './Inventory';
import { useInventaireStore } from '../store/inventaires';

vi.stubGlobal('fetch', vi.fn());

describe('InventoryPage', () => {
  it('fetches items for active property', async () => {
    const fetchForBien = vi.fn(async () => {
      useInventaireStore.setState({
        items: [
          {
            id: '1',
            bienId: 'b1',
            piece: 'Salon',
            mobilier: 'TABLE_BASSE',
          },
        ],
      });
    });
    useInventaireStore.setState({
      items: [],
      fetchForBien,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/biens/b1/dashboard']}>
        <Routes>
          <Route path="/biens/:id/dashboard" element={<InventoryPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(fetchForBien).toHaveBeenCalledWith('b1');
    expect(await screen.findByText('Salon')).toBeInTheDocument();
  });
});
