import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type SiteAnalyticsEvent =
  | 'register_started'
  | 'register_step_2'
  | 'register_step_3'
  | 'register_completed'
  | 'register_failed'

export async function logSiteAnalytics(event: SiteAnalyticsEvent, details?: Record<string, unknown>) {
  try {
    await addDoc(collection(db, 'site_analytics'), {
      event,
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('src') || 'direct' : 'unknown',
      details: details || {},
      created_at: serverTimestamp(),
    })
  } catch {
    // Analytics must never block registration or the public site.
  }
}
