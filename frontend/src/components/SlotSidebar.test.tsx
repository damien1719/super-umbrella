import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SlotSidebar from './SlotSidebar';
import type { FieldSpec } from '../types/template';

function createField(id: string): FieldSpec {
  return {
    kind: 'field',
    id,
    type: 'text',
    mode: 'llm',
    label: id,
    prompt: '',
    pattern: '',
    deps: [],
    preset: 'description',
  };
}

test('insert button calls onAddSlot', () => {
  const field = createField('field-1');
  const onAddSlot = vi.fn();
  render(
    <SlotSidebar slots={[field]} onChange={vi.fn()} onAddSlot={onAddSlot} />,
  );
  fireEvent.click(screen.getByRole('button', { name: /insérer/i }));
  expect(onAddSlot).toHaveBeenCalledWith(field);
});

test('opens detail view and returns on back', () => {
  const field = createField('field-1');
  render(<SlotSidebar slots={[field]} onChange={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: /détails/i }));
  expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /retour/i }));
  expect(
    screen.queryByRole('button', { name: /retour/i }),
  ).not.toBeInTheDocument();
});

test('inline label edit updates slot and calls onUpdateSlot', () => {
  const field = createField('field-1');
  const onChange = vi.fn();
  const onUpdateSlot = vi.fn();
  render(
    <SlotSidebar
      slots={[field]}
      onChange={onChange}
      onUpdateSlot={onUpdateSlot}
    />,
  );
  const input = screen.getByDisplayValue('field-1');
  fireEvent.change(input, { target: { value: 'new label' } });
  expect(onUpdateSlot).toHaveBeenCalledWith('field-1', 'new label');
  expect(onChange).toHaveBeenCalled();
  expect(onChange.mock.calls[0][0][0].label).toBe('new label');
});
