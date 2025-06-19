import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PropertyTabList } from './PropertyTabList';

describe('PropertyTabList', () => {
  it('highlights active tab', () => {
    const { rerender } = render(
      <PropertyTabList value="view" onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: /vue/i })).toHaveClass(
      'border-b-2',
    );
    rerender(<PropertyTabList value="documents" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /documents/i })).toHaveClass(
      'border-b-2',
    );
    rerender(<PropertyTabList value="inventaire" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /inventaire/i })).toHaveClass(
      'border-b-2',
    );
  });

  it('calls onChange when clicking', () => {
    const onChange = vi.fn();
    render(<PropertyTabList value="view" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /inventaire/i }));
    expect(onChange).toHaveBeenCalledWith('inventaire');
  });
});
