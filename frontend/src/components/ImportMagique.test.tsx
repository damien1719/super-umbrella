import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { utils, write } from 'xlsx';
import ImportMagique from './ImportMagique';
import { useAuth } from '@/store/auth';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Ensure token exists for hook
useAuth.setState({ token: 'tok' });

describe('ImportMagique', () => {
  it('converts imported excel into tableau question', async () => {
    const onDone = vi.fn();
    const onCancel = vi.fn();

    render(
      <Dialog open>
        <DialogContent>
          <ImportMagique onDone={onDone} onCancel={onCancel} />
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tableau' }));

    const data = [
      ['', 'C1', 'C2'],
      ['L1', 'A', 'B'],
      ['L2', 'C', 'D'],
    ];
    const sheet = utils.aoa_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, sheet, 'Sheet1');
    const buffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new File([buffer], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(input.files?.length).toBe(1));
    fireEvent.click(screen.getByRole('button', { name: 'Transformer' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(onDone).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.any(String),
        type: 'tableau',
        titre: 'Question sans titre',
        tableau: { lignes: ['L1', 'L2'], colonnes: ['C1', 'C2'] },
      }),
    ]);
    expect(onCancel).toHaveBeenCalled();
  });
});
