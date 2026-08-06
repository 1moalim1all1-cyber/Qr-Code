import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// IMPORTANT: change this to your exact GitHub repo name before deploying,
// e.g. if the repo is github.com/1moalim1all1-cyber/Qr-Code then
// base must be '/Qr-Code/'
const REPO_NAME = 'Qr-Code'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
