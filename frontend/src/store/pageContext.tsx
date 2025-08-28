import * as React from 'react';
import { createStore } from 'zustand';
import { StoreApi, useStore } from 'zustand';

export type Page =
  | 'MesBilans'
  | 'Patients'
  | 'Agenda'
  | 'Resultats'
  | 'Abonnement'
  | 'MonCompte'
  | 'Bibliotheque'
  | 'BilanTypes';

interface PageState {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const pageStore = createStore<PageState>((set) => ({
  currentPage: 'MesBilans',
  setCurrentPage: (page) => set({ currentPage: page }),
}));

export const PageContext = React.createContext<StoreApi<PageState> | null>(
  null,
);

export function PageProvider({ children }: { children: React.ReactNode }) {
  return (
    <PageContext.Provider value={pageStore}>{children}</PageContext.Provider>
  );
}

export function usePageStore<T>(selector: (state: PageState) => T): T {
  const store = React.useContext(PageContext);
  if (!store) throw new Error('PageContext not found');
  return useStore(store, selector);
}
