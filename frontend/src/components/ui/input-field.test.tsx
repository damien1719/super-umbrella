import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InputField } from './input-field';

describe('InputField', () => {
  it('renders label and value', () => {
    const onChange = vi.fn();
    render(<InputField label="Nom" value="John" onChange={onChange} />);
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByText('Nom')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<InputField label="Nom" value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('supports a custom type', () => {
    const onChange = vi.fn();
    render(
      <InputField label="Age" value="" onChange={onChange} type="number" />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '2' },
    });
    expect(onChange).toHaveBeenCalledWith('2');
  });
});
