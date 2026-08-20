import {
  collection, doc, addDoc, getDoc, getDocs, query, where, limit, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateSlug } from '@/lib/slug'
import type { Restaurant } from '@/types/database'

const restaurantsRef = collection(db, 'restaurants')

export async function createRestaurant(ownerId: string, name: string) {
  // Safety net: never create a second restaurant for an owner who already
  // has one (e.g. a retried sign-up after a network hiccup). Reuse the
  // existing one instead — this is what previously caused an account to
  // randomly see one of several duplicate restaurants.
  const existing = await getRestaurantByOwner(ownerId)
  if (existing) return existing

  const slug = generateSlug(name)

  let docRef
  try {
    docRef = await addDoc(restaurantsRef, {
      owner_id: ownerId,
      slug,
      name,
      description: null,
      logo_url: null,
      cover_url: null,
      phone: null,
      whatsapp: null,
      email: null,
      website: null,
      address: null,
      google_maps_url: null,
      working_hours: {},
      status: 'active', // instant activation — no manual admin approval needed for self-registered accounts
      is_open: true,
      theme: { primaryColor: '#E8A33D', font: 'Tajawal', mode: 'light' },
      default_language: 'ar',
      supported_languages: ['ar', 'en'],
      rating: 0,
      created_at: serverTimestamp(),
    })
  } catch (err) {
    console.error('[createRestaurant] failed writing restaurants/{id}:', err)
    throw new Error(`تعذّر إنشاء المطعم (restaurants): ${err instanceof Error ? err.message : String(err)}`)
  }

  // New restaurants start on the free plan. owner_id is stored directly on
  // the subscription doc too, so the create security rule can check it
  // without a get() lookup on the just-created restaurant doc (that lookup
  // could otherwise race Firestore's own write-then-read consistency).
  try {
    await addDoc(collection(db, 'restaurants', docRef.id, 'subscriptions'), {
      owner_id: ownerId,
      plan: 'free',
      status: 'trialing',
      price: 0,
      starts_at: serverTimestamp(),
    })
  } catch (err) {
    console.error('[createRestaurant] failed writing subscriptions:', err)
    throw new Error(`تعذّر إنشاء الاشتراك (subscriptions): ${err instanceof Error ? err.message : String(err)}`)
  }

  const snap = await getDoc(docRef)
  return { id: snap.id, ...snap.data() } as unknown as Restaurant
}

export async function getRestaurantByOwner(ownerId: string) {
  const q = query(restaurantsRef, where('owner_id', '==', ownerId), limit(1))
  let snap
  try {
    snap = await getDocs(q)
  } catch (err) {
    console.error('[getRestaurantByOwner] failed reading restaurants:', err)
    throw new Error(`تعذّر تحميل بيانات المطعم (قراءة restaurants): ${err instanceof Error ? err.message : String(err)}`)
  }
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as unknown as Restaurant
}

export async function getRestaurantById(id: string) {
  const snap = await getDoc(doc(db, 'restaurants', id))
  if (!snap.exists()) throw new Error('Restaurant not found')
  return { id: snap.id, ...snap.data() } as unknown as Restaurant
}

// Admin-created restaurant on behalf of a walk-in client who paid for a
// one-off QR (no login needed on their side — the admin manages it).
// `owner_id` stays null until/unless the client is later given real access.
export async function createRestaurantByAdmin(input: {
  name: string
  clientName: string
  clientContact: string
  amountPaid: number
  paymentNote?: string
}) {
  const slug = generateSlug(input.name)
  const docRef = await addDoc(restaurantsRef, {
    owner_id: null,
    slug,
    name: input.name,
    description: null,
    logo_url: null,
    cover_url: null,
    phone: input.clientContact || null,
    whatsapp: input.clientContact || null,
    email: null,
    website: null,
    address: null,
    google_maps_url: null,
    working_hours: {},
    status: 'active', // admin-created restaurants go live immediately
    is_open: true,
    theme: { primaryColor: '#E8A33D', font: 'Tajawal', mode: 'light' },
    default_language: 'ar',
    supported_languages: ['ar', 'en'],
    rating: 0,
    managed_by_admin: true,
    client_name: input.clientName,
    client_contact: input.clientContact,
    payment_status: input.amountPaid > 0 ? 'paid' : 'unpaid',
    amount_paid: input.amountPaid,
    payment_note: input.paymentNote ?? '',
    created_at: serverTimestamp(),
  })

  const snap = await getDoc(docRef)
  return { id: snap.id, ...snap.data() } as unknown as Restaurant
}

export async function setPaymentStatus(
  id: string,
  status: 'paid' | 'unpaid',
  amountPaid: number,
  paymentNote?: string
) {
  await updateDoc(doc(db, 'restaurants', id), {
    payment_status: status,
    amount_paid: amountPaid,
    ...(paymentNote !== undefined ? { payment_note: paymentNote } : {}),
  })
}

// Public showcase for the landing page — a handful of active restaurants
// that have at least a name and logo/cover, so the homepage can show real
// menus from real platform users instead of only mockups.
export async function listFeaturedRestaurants(max: number = 6) {
  const q = query(restaurantsRef, where('status', '==', 'active'), limit(max))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Restaurant[]
}

export async function getRestaurantBySlug(slug: string) {
  const q = query(restaurantsRef, where('slug', '==', slug), where('status', '==', 'active'), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('Restaurant not found')
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as unknown as Restaurant
}

export async function updateRestaurant(id: string, patch: Partial<Restaurant>) {
  try {
    await updateDoc(doc(db, 'restaurants', id), patch)
  } catch (err) {
    console.error('[updateRestaurant] failed updating restaurants/{id}:', err)
    throw new Error(`تعذّر حفظ بيانات المطعم: ${err instanceof Error ? err.message : String(err)}`)
  }
}
