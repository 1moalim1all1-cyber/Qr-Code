import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type SiteAnalyticsEvent =
  | 'register_started'
  | 'register_step_2'
  | 'register_step_3'
  | 'register_completed'
  | 'register_failed'
  | 'homepage_cta_click'
  | 'homepage_demo_click'
  | 'homepage_whatsapp_click'
  | 'business_type_cta_click'

export interface SiteAnalyticsRecord {
  id: string
  event: SiteAnalyticsEvent | string
  source?: string | null
  path?: string | null
  details?: Record<string, unknown>
  created_at?: unknown
}

const analyticsRef = collection(db, 'site_analytics')

export async function logSiteAnalytics(event: SiteAnalyticsEvent, details?: Record<string, unknown>) {
  try {
    await addDoc(analyticsRef, {
      event,
      path: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : null,
      source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('src') || 'direct' : 'unknown',
      details: details || {},
      created_at: serverTimestamp(),
    })
  } catch {
    // Analytics must never block registration or the public site.
  }
}

export async function listSiteAnalytics() {
  const snap = await getDocs(analyticsRef)
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }) as SiteAnalyticsRecord)
}
