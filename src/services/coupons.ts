import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { withFirestoreError } from '@/lib/firestoreError'

export interface Coupon {
  id: string
  owner_id: string | null
  code: string
  discount_percent: number
  max_uses: number | null
  used_count: number
  is_active: boolean
}

const couponsRef = (restaurantId: string) => collection(db, 'restaurants', restaurantId, 'coupons')

export async function validateCoupon(restaurantId: string, code: string): Promise<Coupon | null> {
  const q = query(
    couponsRef(restaurantId),
    where('code', '==', code.trim().toUpperCase()),
    where('is_active', '==', true)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Coupon
}

export async function listCoupons(restaurantId: string): Promise<Coupon[]> {
  const snap = await getDocs(couponsRef(restaurantId))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Coupon[]
}

export async function createCoupon(
  restaurantId: string,
  ownerId: string | null,
  input: { code: string; discountPercent: number; maxUses: number | null }
) {
  return withFirestoreError('تعذّر إضافة الكوبون', () =>
    addDoc(couponsRef(restaurantId), {
      owner_id: ownerId,
      code: input.code.trim().toUpperCase(),
      discount_percent: input.discountPercent,
      max_uses: input.maxUses,
      used_count: 0,
      is_active: true,
    })
  )
}

export async function toggleCouponActive(restaurantId: string, couponId: string, isActive: boolean) {
  await withFirestoreError('تعذّر تحديث الكوبون', () =>
    updateDoc(doc(db, 'restaurants', restaurantId, 'coupons', couponId), { is_active: isActive })
  )
}

export async function deleteCoupon(restaurantId: string, couponId: string) {
  await withFirestoreError('تعذّر حذف الكوبون', () =>
    deleteDoc(doc(db, 'restaurants', restaurantId, 'coupons', couponId))
  )
}
