import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { register } from './serviceWorkerRegistration';
import { BrowserRouter } from 'react-router-dom';
import './utils/i18n';
import './index.css';
import './fonts/fonts.css';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

register();
