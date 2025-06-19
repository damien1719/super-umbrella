import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import SignUp from './SignUp';
import { useAuth, type AuthState } from '../store/auth';

describe('SignUp page', () => {
  it('calls signUp with form values', async () => {
    const signUpMock = vi.fn(() => Promise.resolve());
    useAuth.setState({ signUp: signUpMock } as Partial<AuthState>);
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('Prénom'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nom'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('E-mail'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), {
      target: { value: 'Passw0rd!' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmation'), {
      target: { value: 'Passw0rd!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /s’inscrire/i }));

    await waitFor(() => expect(signUpMock).toHaveBeenCalled());
    expect(signUpMock).toHaveBeenCalledWith(
      'john@example.com',
      'Passw0rd!',
      'John',
      'Doe',
    );
  });
});
