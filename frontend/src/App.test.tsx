import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

// Tests simplifiés pour la navigation

describe('App navigation', () => {
  it('affiche le dashboard par défaut', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it('active le menu Résultats après clic', () => {
    render(<App />);
    const btn = screen.getByRole('button', { name: /résultats/i });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('data-active', 'true');
  });
});
