import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImportMagique from './ImportMagique';
import { useAuth } from '@/store/auth';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Ensure token exists for hook
useAuth.setState({ token: 'tok' });

describe('ImportMagique', () => {
  it('converts pasted table into tableau question', async () => {
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
    fireEvent.change(screen.getByPlaceholderText(/Collez votre tableau/), {
      target: { value: '\tC1\tC2\nL1\tA\tB\nL2\tC\tD' },
    });
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
