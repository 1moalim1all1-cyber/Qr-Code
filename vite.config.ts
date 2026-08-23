import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// TEMPORARY: reverted to the GitHub Pages subpath while egy-menu.org's DNS/
// Cloudflare nameserver switch is still propagating, so the old
// https://1moalim1all1-cyber.github.io/Qr-Code/ link keeps working in the
// meantime. Once egy-menu.org is confirmed working, change this back to
// base: '/' and redeploy — the custom domain needs root-level asset paths.
const REPO_NAME = 'Qr-Code'

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
