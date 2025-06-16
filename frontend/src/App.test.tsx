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

  it('affiche les résultats après clic sur déclaration fiscale', () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole('button', { name: /déclaration fiscale/i }),
    );
    expect(
      screen.getByRole('heading', { name: /résultats/i }),
    ).toBeInTheDocument();
  });
});
