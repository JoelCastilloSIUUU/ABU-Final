import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App';

createRoot(document.getElementById('principal-react-root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);