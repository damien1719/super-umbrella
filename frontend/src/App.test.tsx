// frontend/src/App.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App'; // ← sans extension .js/.tsx

describe('App component', () => {
  it('affiche le texte de bienvenue', () => {
    render(<App />);
    expect(screen.getByText(/Test/i)).toBeInTheDocument();
  });

  it('telecharge le cerfa au clic', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob()) }),
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
    fireEvent.click(screen.getByRole('button', { name: /2031/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/cerfa/2031-sd?anneeId=1&activityId=2',
      { credentials: 'include' },
    );
    expect(urlMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });

  it('telecharge le cerfa 2033 au clic', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob()) }),
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
    fireEvent.click(screen.getByRole('button', { name: /2033/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/cerfa/2033?anneeId=1&activityId=2',
      { credentials: 'include' },
    );
    expect(urlMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });

  it('telecharge le cerfa 2042 au clic', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob()) }),
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
    fireEvent.click(screen.getByRole('button', { name: /2042/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/cerfa/2042?anneeId=1&activityId=2',
      { credentials: 'include' },
    );
    expect(urlMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });

  it('exporte le FEC au clic', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob()) }),
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
    fireEvent.click(
      screen.getByRole('button', { name: /Fichier des Écritures/i }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/fec?anneeId=1&activityId=2',
      { credentials: 'include' },
    );
    expect(urlMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });

  it('exporte le PDF complet au clic', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob()) }),
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
    fireEvent.click(screen.getByRole('button', { name: /Exporter en PDF/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/reports/pdf?anneeId=1&activityId=2',
      { credentials: 'include' },
    );
    expect(urlMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });
});
