import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { normalizePhone, phoneToPseudoEmail } from '@/lib/phone'

export async function signOut() {
  await firebaseSignOut(auth)
}

export async function getCurrentUserProfile(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId))
  if (!snap.exists()) throw new Error('User profile not found')
  return { id: snap.id, ...snap.data() }
}

// ============================================================
// Phone + password authentication (no SMS/OTP — phone number acts as
// the username, exactly like email + password would). This is the ONLY
// sign-up/sign-in method the platform offers.
// ============================================================

export async function signUpWithPhone(phone: string, password: string, fullName: string): Promise<User> {
  const pseudoEmail = phoneToPseudoEmail(phone)
  const cred = await createUserWithEmailAndPassword(auth, pseudoEmail, password)
  await updateProfile(cred.user, { displayName: fullName })

  // Force the ID token to sync before the first Firestore write — without
  // this, the very next write can occasionally race Firestore's auth state
  // and fail with "Missing or insufficient permissions" right after a
  // brand-new sign-up, even though the auth account itself was created fine.
  await cred.user.getIdToken(true)

  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      full_name: fullName,
      phone: normalizePhone(phone),
      role: 'owner',
      avatar_url: null,
      created_at: serverTimestamp(),
    })
  } catch (err) {
    console.error('[signUpWithPhone] failed writing users/{uid}:', err)
    throw new Error(`تعذّر حفظ بروفايل المستخدم (users): ${err instanceof Error ? err.message : String(err)}`)
  }

  return cred.user
}

export async function signInWithPhone(phone: string, password: string) {
  const pseudoEmail = phoneToPseudoEmail(phone)
  const cred = await signInWithEmailAndPassword(auth, pseudoEmail, password)
  return cred.user
}
