import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataEntry } from './DataEntry';
import type { Question } from '@/types/question';

const noop = () => {};

const mcQuestion: Question = {
  id: '1',
  type: 'choix-multiple',
  titre: 'Choix',
  options: ['Opt1', 'Opt2'],
};

const scaleQuestion: Question = {
  id: '2',
  type: 'echelle',
  titre: 'Scale',
  echelle: { min: 1, max: 5 },
};

describe('DataEntry', () => {
  it('renders multiple choice options as buttons', () => {
    render(<DataEntry questions={[mcQuestion]} answers={{}} onChange={noop} />);
    fireEvent.click(screen.getByText(/ajouter/i));
    expect(screen.getByRole('button', { name: 'Opt1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Opt2' })).toBeInTheDocument();
  });

  it('validates scale input', () => {
    render(
      <DataEntry questions={[scaleQuestion]} answers={{}} onChange={noop} />,
    );
    fireEvent.click(screen.getByText(/ajouter/i));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '10' } });
    expect(screen.getByText(/Valeur entre 1 et 5/)).toBeInTheDocument();
  });
});
