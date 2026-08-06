import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Coupon {
  id: string
  code: string
  discount_percent: number
  is_active: boolean
}

export async function validateCoupon(restaurantId: string, code: string): Promise<Coupon | null> {
  const q = query(
    collection(db, 'restaurants', restaurantId, 'coupons'),
    where('code', '==', code.trim().toUpperCase()),
    where('is_active', '==', true)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Coupon
}
