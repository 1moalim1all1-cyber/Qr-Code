import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { withFirestoreError } from '@/lib/firestoreError'
import type { Offer } from '@/types/database'

const offersRef = (restaurantId: string) => collection(db, 'restaurants', restaurantId, 'offers')

export async function listOffers(restaurantId: string) {
  const q = query(offersRef(restaurantId), orderBy('created_at', 'desc'))
  const snap = await getDocs(q).catch(async () => getDocs(offersRef(restaurantId))) // in case created_at index isn't ready yet
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Offer[]
}

export interface OfferInput {
  titleAr: string
  titleEn?: string
  descriptionAr?: string
  imageUrl: string | null
  discountPercent: number | null
}

export async function createOffer(restaurantId: string, ownerId: string | null, input: OfferInput) {
  return withFirestoreError('تعذّر إضافة العرض', () =>
    addDoc(offersRef(restaurantId), {
      owner_id: ownerId,
      title: { ar: input.titleAr, en: input.titleEn ?? '' },
      description: { ar: input.descriptionAr ?? '' },
      image_url: input.imageUrl,
      discount_percent: input.discountPercent,
      starts_at: null,
      ends_at: null,
      is_active: true,
      created_at: new Date().toISOString(),
    })
  )
}

export async function toggleOfferActive(restaurantId: string, offerId: string, isActive: boolean) {
  await withFirestoreError('تعذّر تحديث العرض', () =>
    updateDoc(doc(db, 'restaurants', restaurantId, 'offers', offerId), { is_active: isActive })
  )
}

export async function deleteOffer(restaurantId: string, offerId: string) {
  await withFirestoreError('تعذّر حذف العرض', () =>
    deleteDoc(doc(db, 'restaurants', restaurantId, 'offers', offerId))
  )
}
