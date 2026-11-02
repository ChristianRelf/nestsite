import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './index.css';
import Nightly from './pages/Nightly';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Nightly />
  </StrictMode>,
);
