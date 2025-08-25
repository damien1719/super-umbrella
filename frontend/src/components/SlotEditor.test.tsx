import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SlotEditor from './SlotEditor';
import type { RepeatSpec } from '../types/template';

describe('SlotEditor repeat items', () => {
  const createRepeat = (): RepeatSpec => ({
    kind: 'repeat',
    id: 'rep-1',
    from: { enum: [{ key: 'key_1', label: 'value_1' }] },
    ctx: 'item',
    namePattern: '',
    slots: [],
  });

  test('pressing Enter in item label adds new item', () => {
    const onChange = vi.fn();
    render(
      <SlotEditor
        slot={createRepeat()}
        onChange={onChange}
        onRemove={() => {}}
      />,
    );
    const input = screen.getByPlaceholderText("Label de l'item");
    fireEvent.change(input, { target: { value: 'Label 1' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    // first call from change, second from addItem
    expect(onChange).toHaveBeenCalledTimes(2);
    const updated: RepeatSpec = onChange.mock.calls[1][0];
    expect(updated.from.enum).toHaveLength(2);
  });
});
