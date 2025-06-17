import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { PageProvider } from './store/pageContext';

// Tests simplifiés pour la navigation

describe('App navigation', () => {
  it('affiche le dashboard par défaut', () => {
    render(
      <PageProvider>
        <App />
      </PageProvider>,
    );
    expect(
      screen.getByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it('active le menu MesBiens après clic', () => {
    render(
      <PageProvider>
        <App />
      </PageProvider>,
    );
    const btn = screen.getByRole('button', { name: /mesbiens/i });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('data-active', 'true');
  });
});
