import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SaisieExempleTrame from './SaisieExempleTrame';

it('adds example on button click', () => {
  const handle = vi.fn();
  render(<SaisieExempleTrame examples={[]} onAdd={handle} />);
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'exemple' },
  });
  fireEvent.click(screen.getByRole('button', { name: /ajouter un exemple/i }));
  expect(handle).toHaveBeenCalledWith('exemple');
});
