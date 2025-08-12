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
  tableau: {
    columns: [{ id: 'c1', label: 'C1', valueType: 'text' }],
    sections: [
      {
        id: 's1',
        title: '',
        rows: [
          { id: 'r1', label: 'L1' },
          { id: 'r2', label: 'L2' },
        ],
      },
    ],
  },
};

const tableCommentQuestion: Question = {
  id: '5',
  type: 'tableau',
  titre: 'Table',
  tableau: {
    columns: [{ id: 'c1', label: 'C1', valueType: 'text' }],
    sections: [{ id: 's1', title: '', rows: [{ id: 'r1', label: 'L1' }] }],
    commentaire: true,
  },
};

const tableScoreQuestion: Question = {
  id: '6',
  type: 'tableau',
  titre: 'Table',
  tableau: {
    columns: [{ id: 'c1', label: 'C1', valueType: 'number' }],
    sections: [{ id: 's1', title: '', rows: [{ id: 'r1', label: 'L1' }] }],
  },
};

const tableSelectQuestion: Question = {
  id: '7',
  type: 'tableau',
  titre: 'Table',
  tableau: {
    columns: [
      {
        id: 'c1',
        label: 'C1',
        valueType: 'choice',
        options: ['A', 'B'],
      },
    ],
    sections: [{ id: 's1', title: '', rows: [{ id: 'r1', label: 'L1' }] }],
  },
};

const tableCheckQuestion: Question = {
  id: '8',
  type: 'tableau',
  titre: 'Table',
  tableau: {
    columns: [{ id: 'c1', label: 'C1', valueType: 'bool' }],
    sections: [{ id: 's1', title: '', rows: [{ id: 'r1', label: 'L1' }] }],
  },
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
    fireEvent.click(screen.getByRole('button', { name: 'Opt2' }));
    ref.current?.save();
    expect(handle).toHaveBeenCalledWith({
      [mcQuestion.id]: { options: ['Opt1', 'Opt2'], commentaire: '' },
    });
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

  it('renders comment field when enabled', () => {
    render(
      <DataEntry
        questions={[tableCommentQuestion]}
        answers={{}}
        onChange={noop}
        inline
      />,
    );
    expect(screen.getByText(/Commentaire/)).toBeInTheDocument();
  });

  it('renders comment field for multi choice by default', () => {
    render(
      <DataEntry
        questions={[mcQuestion]}
        answers={{}}
        onChange={noop}
        inline
      />,
    );
    expect(screen.getByText(/Commentaire/)).toBeInTheDocument();
  });

  it('uses number input for score type', () => {
    render(
      <DataEntry
        questions={[tableScoreQuestion]}
        answers={{}}
        onChange={noop}
        inline
      />,
    );
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders select for choix multiple type', () => {
    render(
      <DataEntry
        questions={[tableSelectQuestion]}
        answers={{}}
        onChange={noop}
        inline
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders checkbox for case a cocher type', () => {
    render(
      <DataEntry
        questions={[tableCheckQuestion]}
        answers={{}}
        onChange={noop}
        inline
      />,
    );
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
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
