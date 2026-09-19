import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type VisitSource = 'qr' | 'direct' | 'share' | 'unknown'
export type VisitKind = 'page_view' | 'product_view'

function getVisitSource(): VisitSource {
  if (typeof window === 'undefined') return 'unknown'
  const source = new URLSearchParams(window.location.search).get('src')
  if (source === 'qr') return 'qr'
  if (source === 'share') return 'share'
  return document.referrer ? 'direct' : 'direct'
}

function sessionKey(restaurantId: string) {
  return `egy-menu:visit:${restaurantId}`
}

// A real menu visit is counted once per browser session per restaurant.
// Product opens are stored separately and do not inflate the visit/QR counters.
export async function logVisit(params: { restaurantId: string; productId?: string }) {
  try {
    const kind: VisitKind = params.productId ? 'product_view' : 'page_view'
    const source = getVisitSource()

    if (kind === 'page_view' && typeof sessionStorage !== 'undefined') {
      const key = sessionKey(params.restaurantId)
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    }

    await addDoc(collection(db, 'restaurants', params.restaurantId, 'visits'), {
      kind,
      source,
      is_qr_scan: kind === 'page_view' && source === 'qr',
      product_id: params.productId ?? null,
      visited_at: serverTimestamp(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    })
  } catch {
    // Analytics failures should never break the customer's menu experience.
  }
}

export async function getVisitStats(restaurantId: string) {
  const visitsRef = collection(db, 'restaurants', restaurantId, 'visits')
  const pageViewsSnap = await getDocs(query(visitsRef, where('kind', '==', 'page_view')))
  const qrScansSnap = await getDocs(query(visitsRef, where('is_qr_scan', '==', true)))
  return {
    visits: pageViewsSnap.size,
    qrScans: qrScansSnap.size,
  }
}
