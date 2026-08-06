import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { QRCode } from '@/types/database'

// Every restaurant has one "main" QR doc that points at its public menu.
// Branch/table-specific codes can reuse the same subcollection later.
const mainQRRef = (restaurantId: string) => doc(db, 'restaurants', restaurantId, 'qrcodes', 'main')

export async function getOrCreateMainQRCode(restaurantId: string, ownerId: string | null) {
  const ref = mainQRRef(restaurantId)
  let snap
  try {
    snap = await getDoc(ref)
  } catch (err) {
    console.error('[getOrCreateMainQRCode] failed reading qrcodes/main:', err)
    throw new Error(`تعذّر قراءة كود QR: ${err instanceof Error ? err.message : String(err)}`)
  }
  if (snap.exists()) return { id: snap.id, ...snap.data() } as unknown as QRCode

  const initial = {
    owner_id: ownerId,
    branch_id: null,
    table_id: null,
    style: { color: '#14110F', shape: 'square' as const, logoUrl: null },
    scans_count: 0,
  }
  try {
    await setDoc(ref, initial)
  } catch (err) {
    console.error('[getOrCreateMainQRCode] failed creating qrcodes/main:', err)
    throw new Error(`تعذّر إنشاء كود QR (restaurantId: ${restaurantId}): ${err instanceof Error ? err.message : String(err)}`)
  }
  return { id: 'main', ...initial } as unknown as QRCode
}

export async function updateQRStyle(restaurantId: string, style: QRCode['style']) {
  const ref = mainQRRef(restaurantId)
  try {
    await updateDoc(ref, { style })
  } catch (err) {
    console.error('[updateQRStyle] failed updating qrcodes/main:', err)
    throw new Error(`تعذّر تحديث تصميم QR: ${err instanceof Error ? err.message : String(err)}`)
  }
  const snap = await getDoc(ref)
  return { id: snap.id, ...snap.data() } as unknown as QRCode
}

export async function incrementScanCount(restaurantId: string) {
  try {
    await updateDoc(mainQRRef(restaurantId), { scans_count: increment(1) })
  } catch {
    // Non-critical for menu viewing
  }
}
