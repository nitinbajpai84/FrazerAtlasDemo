import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/intelligence.css';
import './styles/investor.css';
import './styles/reporting.css';
import './styles/previews.css';
import './styles/responsive.css';
import './styles/engine.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Finance Atlas could not start: the root element is missing from index.html.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);