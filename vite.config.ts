import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// FINAL: egy-menu.org's DNS check succeeded in GitHub Pages (confirmed),
// so the site is now served from the custom domain root — asset paths must
// be root-relative ('/'), not under a /Qr-Code/ subpath. This intentionally
// breaks https://1moalim1all1-cyber.github.io/Qr-Code/ (its assets no
// longer live there), but egy-menu.org is now the permanent home.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
