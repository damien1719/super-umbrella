// frontend/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App'; // ← sans extension .js/.tsx

describe('App component', () => {
  it('affiche le texte de bienvenue', () => {
    render(<App />);
    expect(screen.getByText(/Test/i)).toBeInTheDocument();
  });
});
