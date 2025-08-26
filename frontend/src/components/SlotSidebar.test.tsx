import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SlotSidebar from './SlotSidebar';
import type { SlotSpec } from '../types/template';

// Mock des composants UI
vi.mock('./ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('./ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('./ui/input', () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input value={value} onChange={onChange} {...props} />
  ),
}));

vi.mock('./ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock('./ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <span>Select Value</span>,
}));

vi.mock('./ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock('./ui/confirm-dialog', () => ({
  ConfirmDialog: ({ children, open, onConfirm }: any) =>
    open ? (
      <div>
        {children}
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}));

describe('SlotSidebar - Suppression en cascade', () => {
  const mockOnChange = vi.fn();
  const mockOnAddSlot = vi.fn();
  const mockOnUpdateSlot = vi.fn();
  const mockOnRemoveSlot = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('supprime en cascade un groupe avec ses slots enfants', () => {
    const slots: SlotSpec[] = [
      {
        kind: 'group',
        id: 'group-1',
        label: 'Mon groupe',
        slots: [
          {
            kind: 'field',
            id: 'field-1',
            type: 'text',
            mode: 'llm',
            label: 'Champ 1',
            prompt: 'Description',
            deps: [],
            preset: 'description',
          },
          {
            kind: 'field',
            id: 'field-2',
            type: 'text',
            mode: 'llm',
            label: 'Champ 2',
            prompt: 'Description',
            deps: [],
            preset: 'description',
          },
        ],
      },
    ];

    render(
      <SlotSidebar
        slots={slots}
        onChange={mockOnChange}
        onAddSlot={mockOnAddSlot}
        onUpdateSlot={mockOnUpdateSlot}
        onRemoveSlot={mockOnRemoveSlot}
      />
    );

    // Trouver et cliquer sur le bouton de suppression du groupe
    const deleteButton = screen.getByText('×');
    fireEvent.click(deleteButton);

    // Confirmer la suppression
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    // Vérifier que onRemoveSlot a été appelé pour tous les slots enfants
    expect(mockOnRemoveSlot).toHaveBeenCalledWith('field-1');
    expect(mockOnRemoveSlot).toHaveBeenCalledWith('field-2');

    // Vérifier que onChange a été appelé pour supprimer le groupe du slotsSpec
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('supprime en cascade un répéteur avec tous ses slots concrets', () => {
    const slots: SlotSpec[] = [
      {
        kind: 'repeat',
        id: 'repeat-1',
        from: { enum: [{ key: 'item1', label: 'Item 1' }, { key: 'item2', label: 'Item 2' }] },
        ctx: 'item',
        namePattern: '',
        slots: [
          {
            kind: 'field',
            id: 'field-1',
            type: 'text',
            mode: 'llm',
            label: 'Champ',
            prompt: 'Description',
            deps: [],
            preset: 'description',
          },
        ],
      },
    ];

    render(
      <SlotSidebar
        slots={slots}
        onChange={mockOnChange}
        onAddSlot={mockOnAddSlot}
        onUpdateSlot={mockOnUpdateSlot}
        onRemoveSlot={mockOnRemoveSlot}
      />
    );

    // Trouver et cliquer sur le bouton de suppression du répéteur
    const deleteButton = screen.getByText('×');
    fireEvent.click(deleteButton);

    // Confirmer la suppression
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    // Vérifier que onRemoveSlot a été appelé pour tous les slots concrets
    expect(mockOnRemoveSlot).toHaveBeenCalledWith('repeat-1.item1.field-1');
    expect(mockOnRemoveSlot).toHaveBeenCalledWith('repeat-1.item2.field-1');

    // Vérifier que onChange a été appelé pour supprimer le répéteur du slotsSpec
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('supprime un champ simple sans cascade', () => {
    const slots: SlotSpec[] = [
      {
        kind: 'field',
        id: 'field-1',
        type: 'text',
        mode: 'llm',
        label: 'Mon champ',
        prompt: 'Description',
        deps: [],
        preset: 'description',
      },
    ];

    render(
      <SlotSidebar
        slots={slots}
        onChange={mockOnChange}
        onAddSlot={mockOnAddSlot}
        onUpdateSlot={mockOnUpdateSlot}
        onRemoveSlot={mockOnRemoveSlot}
      />
    );

    // Trouver et cliquer sur le bouton de suppression du champ
    const deleteButton = screen.getByText('×');
    fireEvent.click(deleteButton);

    // Confirmer la suppression
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    // Vérifier que onRemoveSlot a été appelé pour le champ
    expect(mockOnRemoveSlot).toHaveBeenCalledWith('field-1');

    // Vérifier que onChange a été appelé pour supprimer le champ du slotsSpec
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
