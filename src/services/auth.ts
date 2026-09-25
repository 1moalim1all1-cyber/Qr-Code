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
import type { BusinessType } from '@/types/database'

const FREE_TRIAL_HOURS = 72
function addHours(date: Date, hours: number) { const result = new Date(date); result.setHours(result.getHours() + hours); return result }
export async function signOut() { await firebaseSignOut(auth) }
export async function getCurrentUserProfile(userId: string) { const snap = await getDoc(doc(db, 'users', userId)); if (!snap.exists()) throw new Error('User profile not found'); return { id: snap.id, ...snap.data() } }

export async function signUpWithPhone(phone: string, password: string, fullName: string, requestedBusinessName?: string, businessType: BusinessType = 'restaurant'): Promise<User> {
  const pseudoEmail = phoneToPseudoEmail(phone)
  const cred = await createUserWithEmailAndPassword(auth, pseudoEmail, password)
  await updateProfile(cred.user, { displayName: fullName })
  await cred.user.getIdToken(true)
  const trialStart = new Date(); const trialEnd = addHours(trialStart, FREE_TRIAL_HOURS)
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      full_name: fullName, phone: normalizePhone(phone), role: 'owner', avatar_url: null,
      account_status: 'active', business_type: businessType,
      requested_business_name: requestedBusinessName?.trim() || null, rejection_reason: null,
      payment_status: 'unpaid', amount_paid: 0, payment_note: 'فترة تجريبية مجانية 72 ساعة',
      subscription_start: trialStart.toISOString(), subscription_end: trialEnd.toISOString(),
      subscription_hours: FREE_TRIAL_HOURS, trial_hours: FREE_TRIAL_HOURS,
      subscription_days: 3, trial_days: 3, last_renewed_at: null,
      created_at: serverTimestamp(),
    })
  } catch (err) { console.error('[signUpWithPhone] failed writing users/{uid}:', err); throw new Error(`تعذّر حفظ بروفايل المستخدم (users): ${err instanceof Error ? err.message : String(err)}`) }
  return cred.user
}

export async function signInWithPhone(phone: string, password: string) {
  const pseudoEmail = phoneToPseudoEmail(phone)
  const cred = await signInWithEmailAndPassword(auth, pseudoEmail, password)
  return cred.user
}
