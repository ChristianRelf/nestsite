import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './index.css';
import Download from './pages/Download';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Download />
  </StrictMode>,
);
