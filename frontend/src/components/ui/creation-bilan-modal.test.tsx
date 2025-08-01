import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreationBilan } from './creation-bilan-modal';

describe('CreationBilan', () => {
  it('calls callbacks when selecting patient type', () => {
    const onNew = vi.fn();
    const onExisting = vi.fn();
    render(
      <CreationBilan
        isOpen={true}
        onClose={() => {}}
        onNewPatient={onNew}
        onExistingPatient={onExisting}
      />,
    );
    fireEvent.click(screen.getByText(/nouveau patient/i));
    expect(onNew).toHaveBeenCalled();
    fireEvent.click(screen.getByText(/patient existant/i));
    expect(onExisting).toHaveBeenCalled();
  });
});