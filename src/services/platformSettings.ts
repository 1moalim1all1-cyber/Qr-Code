import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const globalSettingsRef = doc(db, 'platform_settings', 'global')

export async function getGlobalMenuVisibility() {
  const snap = await getDoc(globalSettingsRef)
  if (!snap.exists()) return true
  return snap.data().menus_visible !== false
}

export async function setGlobalMenuVisibility(visible: boolean) {
  await setDoc(
    globalSettingsRef,
    {
      menus_visible: visible,
      updated_at: serverTimestamp(),
    },
    { merge: true },
  )
}
