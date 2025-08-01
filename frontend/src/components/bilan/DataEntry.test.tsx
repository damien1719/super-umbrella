import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { DataEntry, type DataEntryHandle } from './DataEntry';
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

const tableQuestion: Question = {
  id: '3',
  type: 'tableau',
  titre: 'Table',
  tableau: { lignes: ['L1', 'L2'], colonnes: ['C1'] },
};

const titleQuestion: Question = {
  id: '4',
  type: 'titre',
  titre: 'Titre Section',
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

  it('shows fields inline when inline prop is true', () => {
    render(
      <DataEntry
        questions={[mcQuestion]}
        answers={{}}
        onChange={noop}
        inline
      />,
    );
    // buttons should be visible without clicking "Ajouter"
    expect(screen.getByRole('button', { name: 'Opt1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Opt2' })).toBeInTheDocument();
  });

  it('allows saving through ref', () => {
    const handle = vi.fn();
    const ref = React.createRef<DataEntryHandle>();
    render(
      <DataEntry
        ref={ref}
        questions={[mcQuestion]}
        answers={{}}
        onChange={handle}
        inline
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opt1' }));
    ref.current?.save();
    expect(handle).toHaveBeenCalledWith({ [mcQuestion.id]: 'Opt1' });
  });

  it('renders table rows', () => {
    render(
      <DataEntry
        questions={[tableQuestion]}
        answers={{}}
        onChange={noop}
        inline
      />,
    );
    expect(screen.getAllByRole('textbox').length).toBe(2);
  });

  it('renders heading for title question', () => {
    render(
      <DataEntry
        questions={[titleQuestion]}
        answers={{}}
        onChange={noop}
        inline
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Titre Section' }),
    ).toBeInTheDocument();
  });
});
