import { defineConfig, type Connect } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Pages that live in their own folder. */
const PAGES = ['jits', 'download', 'connect'];

/** /jits → /jits/ locally, like a static host does for a folder. */
const slash: Connect.NextHandleFunction = (req, res, next) => {
  const page = PAGES.find((p) => req.url === `/${p}` || req.url?.startsWith(`/${p}?`));
  if (page && req.url) {
    res.statusCode = 301;
    res.setHeader('Location', req.url.replace(`/${page}`, `/${page}/`));
    res.end();
    return;
  }
  next();
};

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'folder-trailing-slash',
      configureServer: (server) => void server.middlewares.use(slash),
      configurePreviewServer: (server) => void server.middlewares.use(slash),
    },
  ],
  build: {
    rolldownOptions: {
      input: { main: 'index.html', ...Object.fromEntries(PAGES.map((p) => [p, `${p}/index.html`])) },
    },
  },
});
