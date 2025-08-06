import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { utils, write } from 'xlsx';
import ImportMagique from './ImportMagique';
import { useAuth } from '@/store/auth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
vi.mock('@/utils/api');
import { apiFetch } from '@/utils/api';

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
    fireEvent.click(screen.getByLabelText('Importer un Excel'));

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
    fireEvent.click(screen.getByRole('button', { name: 'Importer' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(onDone).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.any(String),
        type: 'tableau',
        titre: 'Question sans titre',
        tableau: expect.objectContaining({
          columns: [
            expect.objectContaining({ label: 'C1', valueType: 'text' }),
            expect.objectContaining({ label: 'C2', valueType: 'text' }),
          ],
          sections: [
            expect.objectContaining({
              rows: [
                expect.objectContaining({ label: 'L1' }),
                expect.objectContaining({ label: 'L2' }),
              ],
            }),
          ],
        }),
      }),
    ]);
    expect(onCancel).toHaveBeenCalled();
  });

  it('transforms image into tableau question via api', async () => {
    const onDone = vi.fn();
    const onCancel = vi.fn();
    const mockedApi = apiFetch as unknown as vi.Mock;
    mockedApi.mockResolvedValueOnce({
      result: [
        {
          id: '1',
          type: 'tableau',
          titre: 'Question sans titre',
          tableau: {
            columns: [{ id: 'c1', label: 'C1', valueType: 'text' }],
            sections: [
              { id: 's1', title: '', rows: [{ id: 'r1', label: 'L1' }] },
            ],
          },
        },
      ],
    });

    render(
      <Dialog open>
        <DialogContent>
          <ImportMagique onDone={onDone} onCancel={onCancel} />
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tableau' }));
    fireEvent.click(screen.getByLabelText('Importer une image'));

    const img = new File(['img'], 'table.png', { type: 'image/png' });
    const input = screen.getByTestId('image-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [img] } });
    await waitFor(() => expect(input.files?.length).toBe(1));
    fireEvent.click(screen.getByRole('button', { name: 'Importer' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(mockedApi).toHaveBeenCalledWith(
      '/api/v1/import/transform-image',
      expect.any(Object),
    );
    expect(onDone).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'tableau',
        tableau: expect.objectContaining({
          columns: [expect.objectContaining({ label: 'C1' })],
          sections: [
            expect.objectContaining({
              rows: [expect.objectContaining({ label: 'L1' })],
            }),
          ],
        }),
      }),
    ]);
    expect(onCancel).toHaveBeenCalled();
  });

  it('transforms pasted text into tableau via api', async () => {
    const onDone = vi.fn();
    const onCancel = vi.fn();
    const mockedApi = apiFetch as unknown as vi.Mock;
    mockedApi.mockResolvedValueOnce({
      result: [
        {
          id: '1',
          type: 'tableau',
          titre: 'Question sans titre',
          tableau: {
            columns: [{ id: 'c1', label: 'C1', valueType: 'text' }],
            sections: [
              { id: 's1', title: '', rows: [{ id: 'r1', label: 'L1' }] },
            ],
          },
        },
      ],
    });

    render(
      <Dialog open>
        <DialogContent>
          <ImportMagique onDone={onDone} onCancel={onCancel} />
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tableau' }));
    const textarea = screen.getByPlaceholderText(
      'Collez votre tableau ici...',
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: { value: 'C1\tC2\nL1\tA\n' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Importer' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(mockedApi).toHaveBeenCalledWith(
      '/api/v1/import/transform-text-table',
      expect.any(Object),
    );
    expect(onDone).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'tableau',
        tableau: expect.objectContaining({
          columns: [expect.objectContaining({ label: 'C1' })],
          sections: [
            expect.objectContaining({
              rows: [expect.objectContaining({ label: 'L1' })],
            }),
          ],
        }),
      }),
    ]);
    expect(onCancel).toHaveBeenCalled();
  });

  it('transforms pasted image into tableau question via api', async () => {
    const onDone = vi.fn();
    const onCancel = vi.fn();
    const mockedApi = apiFetch as unknown as vi.Mock;
    mockedApi.mockResolvedValueOnce({
      result: [
        {
          id: '1',
          type: 'tableau',
          titre: 'Question sans titre',
          tableau: {
            columns: [{ id: 'c1', label: 'C1', valueType: 'text' }],
            sections: [
              { id: 's1', title: '', rows: [{ id: 'r1', label: 'L1' }] },
            ],
          },
        },
      ],
    });

    render(
      <Dialog open>
        <DialogContent>
          <ImportMagique onDone={onDone} onCancel={onCancel} />
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tableau' }));
    fireEvent.click(screen.getByLabelText('Importer une image'));

    const pasteZone = screen.getByTestId('image-paste-zone');
    const img = new File(['img'], 'pasted.png', { type: 'image/png' });
    const pasteEvent = {
      clipboardData: { files: [img] },
      preventDefault: () => {},
    } as unknown as ClipboardEvent;
    fireEvent.paste(pasteZone, pasteEvent);
    await waitFor(() =>
      expect(screen.getByDisplayValue('pasted.png')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Importer' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(mockedApi).toHaveBeenCalledWith(
      '/api/v1/import/transform-image',
      expect.any(Object),
    );
    expect(onCancel).toHaveBeenCalled();
  });
});
