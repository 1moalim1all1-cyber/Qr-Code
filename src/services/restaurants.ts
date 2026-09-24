import {
  collection, doc, addDoc, getDoc, getDocs, query, where, limit, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateSlug } from '@/lib/slug'
import { normalizePhone } from '@/lib/phone'
import type { BusinessType, Restaurant } from '@/types/database'

const restaurantsRef = collection(db, 'restaurants')
const FREE_TRIAL_DAYS = 10

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function clearPublicMenuShape() {
  if (typeof document === 'undefined') return
  delete document.documentElement.dataset.menuPage
  delete document.documentElement.dataset.menuShape
}

export async function createRestaurant(
  ownerId: string,
  name: string,
  registration?: { clientName?: string; clientContact?: string; businessType?: BusinessType; businessTypeName?: string }
) {
  const existing = await getRestaurantByOwner(ownerId)
  if (existing) return existing

  const slug = generateSlug(name)
  const trialStart = new Date()
  const trialEnd = addDays(trialStart, FREE_TRIAL_DAYS)
  const businessType = registration?.businessType ?? 'restaurant'

  let docRef
  try {
    docRef = await addDoc(restaurantsRef, {
      owner_id: ownerId,
      slug,
      name,
      business_type: businessType,
      business_type_name: registration?.businessTypeName ?? null,
      menu_template: 'three_d',
      menu_shape: 'rounded',
      show_on_home: true,
      description: null,
      logo_url: null,
      cover_url: null,
      phone: registration?.clientContact ? normalizePhone(registration.clientContact) : null,
      whatsapp: registration?.clientContact ? normalizePhone(registration.clientContact) : null,
      email: null,
      website: null,
      address: null,
      google_maps_url: null,
      working_hours: {},
      status: 'active',
      is_open: true,
      theme: { primaryColor: '#E8A33D', font: 'Tajawal', mode: 'light' },
      default_language: 'ar',
      supported_languages: ['ar', 'en'],
      rating: 0,
      managed_by_admin: false,
      client_name: registration?.clientName ?? null,
      client_contact: registration?.clientContact ? normalizePhone(registration.clientContact) : null,
      payment_status: 'unpaid',
      amount_paid: 0,
      payment_note: 'فترة تجريبية مجانية 10 أيام',
      registration_source: 'self_service',
      subscription_start: trialStart.toISOString(),
      subscription_end: trialEnd.toISOString(),
      subscription_days: FREE_TRIAL_DAYS,
      trial_days: FREE_TRIAL_DAYS,
      last_renewed_at: null,
      created_at: serverTimestamp(),
    })
  } catch (err) {
    console.error('[createRestaurant] failed writing restaurants/{id}:', err)
    throw new Error(`تعذّر إنشاء المطعم (restaurants): ${err instanceof Error ? err.message : String(err)}`)
  }

  try {
    await addDoc(collection(db, 'restaurants', docRef.id, 'subscriptions'), {
      owner_id: ownerId, plan: 'free', status: 'trialing', price: 0,
      starts_at: trialStart.toISOString(), ends_at: trialEnd.toISOString(), duration_days: FREE_TRIAL_DAYS,
    })
  } catch (err) {
    console.error('[createRestaurant] failed writing subscriptions:', err)
    throw new Error(`تعذّر إنشاء الاشتراك (subscriptions): ${err instanceof Error ? err.message : String(err)}`)
  }

  const snap = await getDoc(docRef)
  return { id: snap.id, ...snap.data() } as unknown as Restaurant
}

export async function getRestaurantByOwner(ownerId: string) {
  clearPublicMenuShape()
  const q = query(restaurantsRef, where('owner_id', '==', ownerId), limit(1))
  let snap
  try { snap = await getDocs(q) } catch (err) {
    console.error('[getRestaurantByOwner] failed reading restaurants:', err)
    throw new Error(`تعذّر تحميل بيانات المطعم (قراءة restaurants): ${err instanceof Error ? err.message : String(err)}`)
  }
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as unknown as Restaurant
}

export async function getRestaurantById(id: string) {
  clearPublicMenuShape()
  const snap = await getDoc(doc(db, 'restaurants', id))
  if (!snap.exists()) throw new Error('Restaurant not found')
  return { id: snap.id, ...snap.data() } as unknown as Restaurant
}

export async function createRestaurantByAdmin(input: {
  name: string
  clientName: string
  clientContact: string
  amountPaid: number
  paymentNote?: string
  businessType?: BusinessType
  businessTypeName?: string
}) {
  const slug = generateSlug(input.name)
  const normalizedContact = input.clientContact ? normalizePhone(input.clientContact) : null
  const docRef = await addDoc(restaurantsRef, {
    owner_id: null, slug, name: input.name,
    business_type: input.businessType ?? 'restaurant',
    business_type_name: input.businessTypeName ?? null,
    menu_template: 'three_d',
    menu_shape: 'rounded',
    show_on_home: true,
    description: null, logo_url: null, cover_url: null,
    phone: normalizedContact, whatsapp: normalizedContact,
    email: null, website: null, address: null, google_maps_url: null,
    working_hours: {}, status: 'active', is_open: true,
    theme: { primaryColor: '#E8A33D', font: 'Tajawal', mode: 'light' },
    default_language: 'ar', supported_languages: ['ar', 'en'], rating: 0,
    managed_by_admin: true, client_name: input.clientName || null, client_contact: normalizedContact,
    payment_status: input.amountPaid > 0 ? 'paid' : 'unpaid', amount_paid: input.amountPaid,
    payment_note: input.paymentNote ?? '', registration_source: 'admin_manual', created_at: serverTimestamp(),
  })
  const snap = await getDoc(docRef)
  return { id: snap.id, ...snap.data() } as unknown as Restaurant
}

export async function setPaymentStatus(id: string, status: 'paid' | 'unpaid', amountPaid: number, paymentNote?: string) {
  await updateDoc(doc(db, 'restaurants', id), {
    payment_status: status, amount_paid: amountPaid,
    ...(paymentNote !== undefined ? { payment_note: paymentNote } : {}),
  })
}

export async function listFeaturedRestaurants(max: number = 6) {
  const q = query(restaurantsRef, where('status', '==', 'active'), limit(Math.max(max * 3, max)))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as unknown as Restaurant)
    .filter((restaurant) => restaurant.show_on_home !== false)
    .filter((restaurant) => !restaurant.subscription_end || new Date(restaurant.subscription_end).getTime() > Date.now())
    .slice(0, max)
}

export async function getRestaurantBySlug(slug: string) {
  const q = query(restaurantsRef, where('slug', '==', slug), where('status', '==', 'active'), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('Restaurant not found')
  const d = snap.docs[0]
  const restaurant = { id: d.id, ...d.data() } as unknown as Restaurant
  if (restaurant.subscription_end && new Date(restaurant.subscription_end).getTime() <= Date.now()) {
    throw new Error('انتهت مدة الاشتراك')
  }
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.menuPage = 'true'
    document.documentElement.dataset.menuShape = restaurant.menu_shape || 'rounded'
  }
  return restaurant
}

export async function updateRestaurant(id: string, patch: Partial<Restaurant>) {
  try { await updateDoc(doc(db, 'restaurants', id), patch) }
  catch (err) {
    console.error('[updateRestaurant] failed updating restaurants/{id}:', err)
    throw new Error(`تعذّر حفظ بيانات المطعم: ${err instanceof Error ? err.message : String(err)}`)
  }
}
