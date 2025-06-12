// frontend/src/App.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App'; // ← sans extension .js/.tsx

describe('App component', () => {
  it('affiche le texte de bienvenue', () => {
    render(<App />);
    expect(screen.getByText(/Test/i)).toBeInTheDocument();
  });

  it('telecharge le cerfa au clic', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ blob: () => Promise.resolve(new Blob()) })
    );
    global.fetch = fetchMock as unknown as typeof fetch;
    const urlMock = vi.fn(() => 'blob:url');
    global.URL.createObjectURL = urlMock;
    global.URL.revokeObjectURL = vi.fn();
    const clickMock = vi.fn();
    HTMLAnchorElement.prototype.click = clickMock;

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('anneeId'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByPlaceholderText('activityId'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button'));
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/cerfa/2031-sd?anneeId=1&activityId=2'
    );
    expect(urlMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });
});
