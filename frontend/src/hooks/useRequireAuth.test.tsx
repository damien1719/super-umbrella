import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { useAuth } from '../store/auth';
import { useRequireAuth } from './useRequireAuth';

function TestComponent() {
  useRequireAuth();
  return <div>home</div>;
}

describe('useRequireAuth', () => {
  it('does not redirect while loading', () => {
    useAuth.setState((s) => ({ ...s, user: null, loading: true }));
    render(
      <MemoryRouter initialEntries={['/']}> 
        <Routes>
          <Route path="/" element={<TestComponent />} />
          <Route path="/login" element={<div>login</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByText('login')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    useAuth.setState((s) => ({ ...s, user: null, loading: false }));
    render(
      <MemoryRouter initialEntries={['/']}> 
        <Routes>
          <Route path="/" element={<TestComponent />} />
          <Route path="/login" element={<div>login</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('login')).toBeInTheDocument();
  });
});
