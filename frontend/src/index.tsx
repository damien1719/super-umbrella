import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './globals.css';
import { PageProvider } from './store/pageContext';

const container = document.getElementById('root');
if (!container) {
  throw new Error("Couldn't find #root container");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <PageProvider>
      <App />
    </PageProvider>
  </React.StrictMode>,
);
