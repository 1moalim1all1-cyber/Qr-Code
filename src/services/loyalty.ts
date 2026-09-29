import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type LoyaltyConfig = {
  enabled?: boolean
  points_per_egp?: number
  reward_threshold?: number
  reward_value?: number
}

export type LoyaltyBalance = {
  points: number
  total_earned?: number
  total_redeemed?: number
}

export function normalizeCustomerPhone(value?: string | null) {
  let digits = String(value || '').replace(/[^0-9]/g, '')
  if (digits.startsWith('0020')) digits = digits.slice(2)
  if (digits.startsWith('01') && digits.length === 11) digits = `20${digits}`
  else if (digits.startsWith('1') && digits.length === 10) digits = `20${digits}`
  return digits
}

export async function getLoyaltyBalance(restaurantId: string, phone: string): Promise<LoyaltyBalance> {
  const normalized = normalizeCustomerPhone(phone)
  if (!normalized) return { points: 0 }
  const snap = await getDoc(doc(db, 'restaurants', restaurantId, 'loyalty_customers', normalized))
  if (!snap.exists()) return { points: 0 }
  const data = snap.data()
  return {
    points: Math.max(0, Number(data.points || 0)),
    total_earned: Math.max(0, Number(data.total_earned || 0)),
    total_redeemed: Math.max(0, Number(data.total_redeemed || 0)),
  }
}
