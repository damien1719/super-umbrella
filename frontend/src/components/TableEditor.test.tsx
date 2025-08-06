import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React, { useState } from 'react';
import { TableEditor } from './Editors';
import type { Question } from '@/types/Typequestion';

describe('TableEditor drag and drop', () => {
  let current: Question;
  function Wrapper({ initial }: { initial: Question }) {
    const [q, setQ] = useState(initial);
    current = q;
    return (
      <TableEditor q={q} onPatch={(p) => setQ((prev) => ({ ...prev, ...p }))} />
    );
  }

  it('reorders columns via drag and drop', () => {
    const question: Question = {
      id: 'q1',
      type: 'tableau',
      titre: '',
      tableau: {
        columns: [
          { id: 'c1', label: 'Col1', valueType: 'text' },
          { id: 'c2', label: 'Col2', valueType: 'text' },
        ],
        rowsGroups: [{ id: 'g1', title: 'G1', rows: [] }],
      },
    };
    render(<Wrapper initial={question} />);
    const handles = document.querySelectorAll(
      'button[aria-label="Déplacer la colonne"]',
    );
    fireEvent.dragStart(handles[0]);
    const target = handles[1].closest('th')!;
    fireEvent.dragOver(target);
    fireEvent.drop(target);
    fireEvent.dragEnd(handles[0]);
    expect(current.tableau?.columns.map((c) => c.label)).toEqual([
      'Col2',
      'Col1',
    ]);
  });

  it('moves rows across groups', () => {
    const question: Question = {
      id: 'q1',
      type: 'tableau',
      titre: '',
      tableau: {
        columns: [],
        rowsGroups: [
          {
            id: 'g1',
            title: 'G1',
            rows: [
              { id: 'r1', label: 'R1' },
              { id: 'r2', label: 'R2' },
            ],
          },
          {
            id: 'g2',
            title: 'G2',
            rows: [{ id: 'r3', label: 'R3' }],
          },
        ],
      },
    };
    render(<Wrapper initial={question} />);
    const rowHandles = document.querySelectorAll(
      'button[aria-label="Déplacer la ligne"]',
    );
    fireEvent.dragStart(rowHandles[0]);
    const targetRow = rowHandles[2].closest('tr')!;
    fireEvent.dragOver(targetRow);
    fireEvent.drop(targetRow);
    fireEvent.dragEnd(rowHandles[0]);
    expect(current.tableau?.rowsGroups[0].rows.map((r) => r.label)).toEqual([
      'R2',
    ]);
    expect(current.tableau?.rowsGroups[1].rows.map((r) => r.label)).toEqual([
      'R1',
      'R3',
    ]);
  });
});
