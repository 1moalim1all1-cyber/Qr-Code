import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Fire-and-forget visit logging for menu analytics — never blocks the UI.
export async function logVisit(params: { restaurantId: string; productId?: string }) {
  try {
    await addDoc(collection(db, 'restaurants', params.restaurantId, 'visits'), {
      product_id: params.productId ?? null,
      visited_at: serverTimestamp(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    })
  } catch {
    // Analytics failures should never break the customer's menu experience
  }
}
