import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AiRightPanel from './components/AiRightPanel';

const sections = [{ id: 1, title: 'Intro', content: 'c', metadata: {} }];

global.fetch = vi.fn(
  () =>
    Promise.resolve({
      json: () => Promise.resolve({ sections }),
    }) as unknown as typeof fetch,
);

describe('AiRightPanel', () => {
  it('fetches and displays sections', async () => {
    render(<AiRightPanel bilanId="1" />);
    await waitFor(() => expect(screen.getByText('Intro')).toBeInTheDocument());
  });
});
