import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SlotSidebar from './SlotSidebar';
import type { Slot } from '../types/template';

test('adds slot and calls callbacks', () => {
  const onChange = vi.fn();
  const onAddSlot = vi.fn();
  const slots: Slot[] = [];
  render(
    <SlotSidebar slots={slots} onChange={onChange} onAddSlot={onAddSlot} />,
  );
  fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));
  expect(onChange).toHaveBeenCalled();
  expect(onAddSlot).toHaveBeenCalled();
});
