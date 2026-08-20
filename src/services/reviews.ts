import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { withFirestoreError } from '@/lib/firestoreError'
import type { Review } from '@/types/database'

const reviewsRef = (restaurantId: string) => collection(db, 'restaurants', restaurantId, 'reviews')

export async function listReviews(restaurantId: string) {
  const q = query(reviewsRef(restaurantId), orderBy('created_at', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Review[]
}

export async function createReview(restaurantId: string, customerName: string, rating: number, comment: string) {
  return withFirestoreError('تعذّر إرسال التقييم', async () => {
    await addDoc(reviewsRef(restaurantId), {
      customer_name: customerName,
      rating,
      comment,
      created_at: serverTimestamp(),
    })
  })
}

export async function deleteReview(restaurantId: string, reviewId: string) {
  await withFirestoreError('تعذّر حذف التقييم', () =>
    deleteDoc(doc(db, 'restaurants', restaurantId, 'reviews', reviewId))
  )
}
