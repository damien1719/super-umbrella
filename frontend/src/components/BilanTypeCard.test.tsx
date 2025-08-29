import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BilanTypeCard from './BilanTypeCard';

describe('BilanTypeCard', () => {
  it('displays info and handles delete', () => {
    const onDelete = vi.fn();
    render(
      <BilanTypeCard
        bilanType={{ id: '1', name: 'Bilan', description: 'Desc' }}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText('Bilan')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /supprimer/i });
    fireEvent.click(btn);
    expect(onDelete).toHaveBeenCalled();
  });
});
