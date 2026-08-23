import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// With a custom domain (egy-menu.org) the site is served from the domain
// root, not from a GitHub Pages subpath like /Qr-Code/ anymore — so base
// is just '/'. If you ever go back to the default *.github.io/RepoName/
// URL (no custom domain), change this back to `/${REPO_NAME}/`.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
