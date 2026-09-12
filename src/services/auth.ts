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

const FREE_TRIAL_DAYS = 10

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

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
// the username, exactly like email + password would).
// ============================================================

export async function signUpWithPhone(
  phone: string,
  password: string,
  fullName: string,
  requestedBusinessName?: string,
): Promise<User> {
  const pseudoEmail = phoneToPseudoEmail(phone)
  const cred = await createUserWithEmailAndPassword(auth, pseudoEmail, password)
  await updateProfile(cred.user, { displayName: fullName })

  await cred.user.getIdToken(true)

  const trialStart = new Date()
  const trialEnd = addDays(trialStart, FREE_TRIAL_DAYS)

  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      full_name: fullName,
      phone: normalizePhone(phone),
      role: 'owner',
      avatar_url: null,
      account_status: 'active',
      requested_business_name: requestedBusinessName?.trim() || null,
      rejection_reason: null,
      payment_status: 'unpaid',
      amount_paid: 0,
      payment_note: 'فترة تجريبية مجانية 10 أيام',
      subscription_start: trialStart.toISOString(),
      subscription_end: trialEnd.toISOString(),
      subscription_days: FREE_TRIAL_DAYS,
      trial_days: FREE_TRIAL_DAYS,
      last_renewed_at: null,
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
