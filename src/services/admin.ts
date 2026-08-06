import { collection, getDocs, doc, updateDoc, query, orderBy, collectionGroup, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Restaurant, RestaurantStatus } from '@/types/database'

// Admin-only reads: firestore.rules only allow these when the caller's
// users/{uid}.role == 'super_admin' (see isSuperAdmin() in firestore.rules).

export async function listAllRestaurants() {
  const snap = await getDocs(query(collection(db, 'restaurants'), orderBy('name', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Restaurant[]
}

export async function setRestaurantStatus(id: string, status: RestaurantStatus) {
  await updateDoc(doc(db, 'restaurants', id), { status })
}

export async function getPlatformStats() {
  const restaurants = await listAllRestaurants()
  const active = restaurants.filter((r) => r.status === 'active').length
  const pending = restaurants.filter((r) => r.status === 'pending').length
  const suspended = restaurants.filter((r) => r.status === 'suspended').length

  // Recent visits across the platform (best-effort — capped for cost/perf)
  let totalVisitsSample = 0
  try {
    const visitsSnap = await getDocs(query(collectionGroup(db, 'visits'), limit(500)))
    totalVisitsSample = visitsSnap.size
  } catch {
    // collectionGroup query needs a Firestore index the first time — non-blocking
  }

  return {
    totalRestaurants: restaurants.length,
    active,
    pending,
    suspended,
    totalVisitsSample,
  }
}
