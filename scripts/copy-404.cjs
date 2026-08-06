// Copies dist/index.html to dist/404.html so GitHub Pages serves the SPA
// for any deep link (e.g. /dashboard/menu) instead of a real 404 page.
// This is what makes React Router work correctly on GitHub Pages.
const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '..', 'dist', 'index.html')
const dest = path.join(__dirname, '..', 'dist', '404.html')

fs.copyFileSync(src, dest)
console.log('Copied index.html -> 404.html for SPA routing on GitHub Pages')
