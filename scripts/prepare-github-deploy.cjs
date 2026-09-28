const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const menuPath = path.join(root, 'src/pages/public/MenuPage.tsx')
const ghPagesAssets = path.join(root, '_gh_pages_current/assets')

function patchMenuImages() {
  let source = fs.readFileSync(menuPath, 'utf8')

  const quickOld = "addItem({ productId: p.id, name: p.name.ar, price: p.discount_price || p.price, extras: [] }, 1)"
  const quickNew = "addItem({ productId: p.id, name: p.name.ar, price: p.discount_price || p.price, extras: [], imageUrl: p.images?.[0]?.url ?? null }, 1)"

  const detailOld = "addItem({ productId: product.id, name: product.name.ar, price: basePrice, extras: selectedExtras, size: selectedVariant?.label || selectedSize?.name }, quantity)"
  const detailNew = "addItem({ productId: product.id, name: product.name.ar, price: basePrice, extras: selectedExtras, size: selectedVariant?.label || selectedSize?.name, imageUrl: selectedVariant?.image_url || images[activeImage]?.url || product.images?.[0]?.url || null }, quantity)"

  if (source.includes(quickOld)) source = source.replace(quickOld, quickNew)
  if (source.includes(detailOld)) source = source.replace(detailOld, detailNew)

  if (!source.includes('imageUrl: p.images?.[0]?.url ?? null')) {
    throw new Error('Could not patch quick-add product image into MenuPage.tsx')
  }
  if (!source.includes('imageUrl: selectedVariant?.image_url || images[activeImage]?.url')) {
    throw new Error('Could not patch detail product image into MenuPage.tsx')
  }

  fs.writeFileSync(menuPath, source)
}

function readBuiltJs() {
  if (!fs.existsSync(ghPagesAssets)) {
    throw new Error('Existing gh-pages assets were not checked out')
  }

  return fs.readdirSync(ghPagesAssets)
    .filter((name) => name.endsWith('.js'))
    .map((name) => fs.readFileSync(path.join(ghPagesAssets, name), 'utf8'))
    .join('\n')
}

function first(text, regex, label) {
  const match = text.match(regex)
  if (!match) throw new Error(`Could not recover ${label} from the current public build`)
  return match[1] || match[0]
}

function recoverPublicEnv() {
  const js = readBuiltJs()

  const apiKey = first(js, /AIza[0-9A-Za-z_-]{30,50}/, 'Firebase API key')
  const authDomain = first(js, /([a-z0-9-]+\.firebaseapp\.com)/i, 'Firebase auth domain')
  const projectId = authDomain.replace(/\.firebaseapp\.com$/i, '')
  const storageBucket = first(js, /([a-z0-9-]+\.(?:appspot\.com|firebasestorage\.app))/i, 'Firebase storage bucket')
  const appId = first(js, /(1:\d+:web:[0-9a-z]+)/i, 'Firebase app id')
  const senderMatch = appId.match(/^1:(\d+):web:/)
  if (!senderMatch) throw new Error('Could not recover Firebase messaging sender id')

  // These are public frontend values already shipped in the current production bundle.
  const cloudName = 'sg5ompuf'
  const uploadPreset = 'Qrcode'

  const env = [
    `VITE_FIREBASE_API_KEY=${apiKey}`,
    `VITE_FIREBASE_AUTH_DOMAIN=${authDomain}`,
    `VITE_FIREBASE_PROJECT_ID=${projectId}`,
    `VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}`,
    `VITE_FIREBASE_MESSAGING_SENDER_ID=${senderMatch[1]}`,
    `VITE_FIREBASE_APP_ID=${appId}`,
    `VITE_CLOUDINARY_CLOUD_NAME=${cloudName}`,
    `VITE_CLOUDINARY_UPLOAD_PRESET=${uploadPreset}`,
    '',
  ].join('\n')

  fs.writeFileSync(path.join(root, '.env.production'), env)
}

patchMenuImages()
recoverPublicEnv()
console.log('Prepared source + recovered public frontend environment for GitHub Pages deploy.')
