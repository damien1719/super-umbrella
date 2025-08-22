import './global.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PageProvider } from './store/pageContext';

const container = document.getElementById('root');
if (!container) {
  throw new Error("Couldn't find #root container");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PageProvider>
        <App />
      </PageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
