import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null } }),
      signOut: () => Promise.resolve(),
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  }),
}));

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;

  readonly rootMargin = '';

  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    this.callback([{ isIntersecting: true, target, intersectionRatio: 1 }], this);
  }

  disconnect(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve(): void {}
}

class MockResizeObserver implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element): void {
    this.callback([{ target, contentRect: target.getBoundingClientRect() }], this);
  }

  unobserve(): void {}

  disconnect(): void {}
}

type GlobalWithObservers = typeof globalThis & {
  IntersectionObserver?: typeof IntersectionObserver;
  ResizeObserver?: typeof ResizeObserver;
};

const globalWithObservers = globalThis as GlobalWithObservers;

if (!globalWithObservers.IntersectionObserver) {
  globalWithObservers.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

if (!globalWithObservers.ResizeObserver) {
  globalWithObservers.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
}

if (typeof window !== 'undefined') {
  window.alert = vi.fn() as unknown as typeof window.alert;
}
