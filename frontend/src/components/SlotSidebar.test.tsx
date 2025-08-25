import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

test('add field button calls onChange with new field', () => {
  const onChange = vi.fn();
  render(<SlotSidebar slots={[]} onChange={onChange} />);

  fireEvent.click(screen.getByRole('button', { name: /champ/i }));

  expect(onChange).toHaveBeenCalled();
  const newSlots = onChange.mock.calls[0][0];
  expect(newSlots).toHaveLength(1);
  expect(newSlots[0].kind).toBe('field');
});

test('meatball menu opens and contains group and repeat options', async () => {
  render(<SlotSidebar slots={[]} onChange={vi.fn()} />);

  // Click on meatball menu (MoreHorizontal button)
  const meatballButton = screen.getByRole('button', { name: '' }); // MoreHorizontal has no accessible name
  fireEvent.click(meatballButton);

  // Wait for menu to open and check that menu items are visible
  await waitFor(() => {
    expect(screen.getByText('Groupe')).toBeInTheDocument();
    expect(screen.getByText('Répéteur')).toBeInTheDocument();
  });
});

test('add group from meatball menu calls onChange with new group', async () => {
  const onChange = vi.fn();
  render(<SlotSidebar slots={[]} onChange={onChange} />);

  // Open meatball menu
  const meatballButton = screen.getByRole('button', { name: '' });
  fireEvent.click(meatballButton);

  // Wait for menu to open and click on Groupe option
  await waitFor(() => {
    expect(screen.getByText('Groupe')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('Groupe'));

  expect(onChange).toHaveBeenCalled();
  const newSlots = onChange.mock.calls[0][0];
  expect(newSlots).toHaveLength(1);
  expect(newSlots[0].kind).toBe('group');
});

test('add repeat from meatball menu calls onChange with new repeat', async () => {
  const onChange = vi.fn();
  render(<SlotSidebar slots={[]} onChange={onChange} />);

  // Open meatball menu
  const meatballButton = screen.getByRole('button', { name: '' });
  fireEvent.click(meatballButton);

  // Wait for menu to open and click on Répéteur option
  await waitFor(() => {
    expect(screen.getByText('Répéteur')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('Répéteur'));

  expect(onChange).toHaveBeenCalled();
  const newSlots = onChange.mock.calls[0][0];
  expect(newSlots).toHaveLength(1);
  expect(newSlots[0].kind).toBe('repeat');
});

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

test('transform button calls onTransformToQuestions', () => {
  const onTransform = vi.fn();
  render(
    <SlotSidebar
      slots={[]}
      onChange={vi.fn()}
      onTransformToQuestions={onTransform}
    />,
  );
  fireEvent.click(
    screen.getByRole('button', { name: /Transformer en Questions/i }),
  );
  expect(onTransform).toHaveBeenCalled();
});

test('magic templating button calls onMagicTemplating', () => {
  const onMagic = vi.fn();
  render(
    <SlotSidebar slots={[]} onChange={vi.fn()} onMagicTemplating={onMagic} />,
  );
  fireEvent.click(screen.getByRole('button', { name: /MagicTemplating/i }));
  expect(onMagic).toHaveBeenCalled();
});
