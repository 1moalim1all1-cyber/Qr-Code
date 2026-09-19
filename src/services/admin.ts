import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  collectionGroup,
  limit,
} from 'firebase/firestore'
import { updateEmail } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app, auth, db } from '@/lib/firebase'
import { normalizePhone, phoneToPseudoEmail } from '@/lib/phone'
import { createRestaurant } from '@/services/restaurants'
import type { AccountStatus, AppUser, Restaurant, RestaurantStatus } from '@/types/database'

export interface AdminClientRecord {
  user: AppUser
  restaurant: Restaurant | null
  standalone?: boolean
}

function isStandaloneUserId(userId: string) {
  return userId.startsWith('restaurant:')
}

function parseSubscriptionEnd(end?: string | null) {
  if (!end) return null
  const parsed = new Date(end)
  if (!Number.isNaN(parsed.getTime())) return parsed
  const dateOnly = new Date(`${end}T23:59:59`)
  return Number.isNaN(dateOnly.getTime()) ? null : dateOnly
}

function addDays(base: Date, days: number) {
  const result = new Date(base)
  result.setDate(result.getDate() + days)
  return result
}

export async function listAllRestaurants() {
  const snap = await getDocs(query(collection(db, 'restaurants'), orderBy('name', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Restaurant[]
}

export async function listAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as AppUser[]
}

export async function listAdminClients(): Promise<AdminClientRecord[]> {
  const [users, restaurants] = await Promise.all([listAllUsers(), listAllRestaurants()])
  const ownerUsers = users.filter((u) => u.role === 'owner')
  const ownerUserIds = new Set(ownerUsers.map((u) => u.id))
  const restaurantByOwner = new Map(
    restaurants.filter((r) => r.owner_id).map((r) => [r.owner_id as string, r]),
  )

  const registered: AdminClientRecord[] = ownerUsers
    .map((rawUser) => {
      const restaurant = restaurantByOwner.get(rawUser.id) ?? null
      const inferredStatus: AccountStatus = rawUser.account_status ||
        (restaurant?.status === 'active' ? 'active' : restaurant?.status === 'suspended' ? 'suspended' : restaurant?.status === 'rejected' ? 'rejected' : 'pending')
      const user: AppUser = {
        ...rawUser,
        account_status: inferredStatus,
        requested_business_name: rawUser.requested_business_name || restaurant?.name || null,
        payment_status: rawUser.payment_status || restaurant?.payment_status || 'unpaid',
        amount_paid: rawUser.amount_paid ?? Number(restaurant?.amount_paid || 0),
        payment_note: rawUser.payment_note ?? restaurant?.payment_note ?? '',
        subscription_start: rawUser.subscription_start ?? restaurant?.subscription_start ?? null,
        subscription_end: rawUser.subscription_end ?? restaurant?.subscription_end ?? null,
        subscription_days: rawUser.subscription_days ?? restaurant?.subscription_days ?? null,
        subscription_months: rawUser.subscription_months ?? restaurant?.subscription_months ?? null,
        trial_days: rawUser.trial_days ?? restaurant?.trial_days ?? null,
        last_renewed_at: rawUser.last_renewed_at ?? restaurant?.last_renewed_at ?? null,
      }
      return { user, restaurant, standalone: false }
    })

  // Also surface restaurants that were created while logged in as admin (or whose
  // owner_id no longer points to an owner account). Those restaurants used to be
  // skipped because they had an owner_id, but that id belonged to a super admin.
  const standalone: AdminClientRecord[] = restaurants
    .filter((r) => !r.owner_id || !ownerUserIds.has(r.owner_id))
    .map((restaurant) => ({
      standalone: true,
      restaurant,
      user: {
        id: `restaurant:${restaurant.id}`,
        full_name: restaurant.client_name || 'عميل إدارة',
        phone: restaurant.client_contact || restaurant.phone || null,
        role: 'owner',
        avatar_url: null,
        account_status: restaurant.status as AccountStatus,
        requested_business_name: restaurant.name,
        rejection_reason: null,
        payment_status: restaurant.payment_status || 'unpaid',
        amount_paid: Number(restaurant.amount_paid || 0),
        payment_note: restaurant.payment_note || '',
        subscription_start: restaurant.subscription_start ?? null,
        subscription_end: restaurant.subscription_end ?? null,
        subscription_days: restaurant.subscription_days ?? null,
        subscription_months: restaurant.subscription_months ?? null,
        trial_days: restaurant.trial_days ?? null,
        last_renewed_at: restaurant.last_renewed_at ?? null,
        created_at: '',
      },
    }))

  return [...registered, ...standalone]
    .sort((a, b) => (a.user.full_name || '').localeCompare(b.user.full_name || '', 'ar'))
}

export async function createMissingRestaurantForClient(client: AdminClientRecord) {
  if (client.restaurant) return client.restaurant
  if (isStandaloneUserId(client.user.id)) throw new Error('العميل ده نشاط مستقل بالفعل')

  const businessName = client.user.requested_business_name?.trim() || client.user.full_name || 'نشاط جديد'
  const restaurant = await createRestaurant(client.user.id, businessName, {
    clientName: client.user.full_name,
    clientContact: client.user.phone || '',
  })

  const patch: Record<string, unknown> = {
    status: client.user.account_status === 'suspended' ? 'suspended' : client.user.account_status === 'rejected' ? 'rejected' : 'active',
    payment_status: client.user.payment_status || 'unpaid',
    amount_paid: Number(client.user.amount_paid || 0),
    payment_note: client.user.payment_note || 'تم إنشاء النشاط المفقود من لوحة الإدارة',
  }

  if (client.user.subscription_start) patch.subscription_start = client.user.subscription_start
  if (client.user.subscription_end) patch.subscription_end = client.user.subscription_end
  if (client.user.subscription_days != null) patch.subscription_days = client.user.subscription_days
  if (client.user.trial_days != null) patch.trial_days = client.user.trial_days
  if (client.user.last_renewed_at != null) patch.last_renewed_at = client.user.last_renewed_at

  await updateDoc(doc(db, 'restaurants', restaurant.id), patch)
  return { ...restaurant, ...patch } as Restaurant
}

export async function deleteClientCompletely(client: AdminClientRecord) {
  const functions = getFunctions(app)
  const removeClient = httpsCallable<{
    uid?: string
    restaurantId?: string
  }, { ok: boolean }>(functions, 'deleteClientCompletely')

  const payload: { uid?: string; restaurantId?: string } = {}
  if (!isStandaloneUserId(client.user.id)) payload.uid = client.user.id
  if (client.restaurant?.id) payload.restaurantId = client.restaurant.id

  if (!payload.uid && !payload.restaurantId) throw new Error('مفيش بيانات كفاية لحذف العميل')
  await removeClient(payload)
}

export async function changeMyLoginPhone(phone: string) {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('لازم تسجل دخول الأول')

  const normalized = normalizePhone(phone)
  const digits = normalized.replace(/\D/g, '')
  if (!/^201\d{9}$/.test(digits)) {
    throw new Error('اكتب رقم مصري صحيح مثل 01012345678')
  }

  const localPhone = `0${digits.slice(2)}`
  const loginEmail = phoneToPseudoEmail(phone)

  try {
    await updateEmail(currentUser, loginEmail)
  } catch (err) {
    const code = (err as { code?: string })?.code
    if (code === 'auth/email-already-in-use') throw new Error('الرقم ده مستخدم في حساب تاني بالفعل')
    if (code === 'auth/requires-recent-login') throw new Error('سجّل خروج وادخل تاني بالرقم الحالي، وبعدها غيّر الرقم مباشرة')
    throw err
  }

  await updateDoc(doc(db, 'users', currentUser.uid), { phone: localPhone })
  return { ok: true, phone: localPhone, loginEmail }
}

export async function setRestaurantStatus(id: string, status: RestaurantStatus) {
  await updateDoc(doc(db, 'restaurants', id), { status })
}

export async function setRestaurantHomepageVisibility(id: string, visible: boolean) {
  await updateDoc(doc(db, 'restaurants', id), { show_on_home: visible })
}

export async function setUserAccountStatus(userId: string, status: AccountStatus, rejectionReason?: string) {
  if (isStandaloneUserId(userId)) return
  await updateDoc(doc(db, 'users', userId), {
    account_status: status,
    rejection_reason: status === 'rejected' ? rejectionReason || 'تم رفض طلب التسجيل بواسطة الإدارة' : null,
  })
}

export async function updateAdminClient(input: {
  userId: string
  restaurantId?: string | null
  fullName: string
  phone: string
  businessName: string
  paymentStatus: 'paid' | 'unpaid'
  amountPaid: number
  paymentNote: string
}) {
  const patch = {
    full_name: input.fullName,
    phone: input.phone,
    requested_business_name: input.businessName,
    payment_status: input.paymentStatus,
    amount_paid: input.amountPaid,
    payment_note: input.paymentNote,
  }

  if (!isStandaloneUserId(input.userId)) {
    await updateDoc(doc(db, 'users', input.userId), patch)
  }

  if (input.restaurantId) {
    await updateDoc(doc(db, 'restaurants', input.restaurantId), {
      name: input.businessName,
      client_name: input.fullName,
      client_contact: input.phone,
      phone: input.phone,
      whatsapp: input.phone,
      payment_status: input.paymentStatus,
      amount_paid: input.amountPaid,
      payment_note: input.paymentNote,
    })
  }
}

export async function renewClient(input: {
  userId: string
  restaurantId?: string | null
  days: number
  amountPaid?: number
  paymentNote?: string
}) {
  const days = Math.max(1, Math.floor(input.days))
  const clients = await listAdminClients()
  const client = clients.find((c) => c.user.id === input.userId)
  const currentEnd = parseSubscriptionEnd(client?.user.subscription_end)
  const now = new Date()
  const base = currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd : now
  const newEnd = addDays(base, days)
  const start = client?.user.subscription_start || now.toISOString()
  const renewalPatch = {
    subscription_start: start,
    subscription_end: newEnd.toISOString(),
    subscription_days: days,
    trial_days: 0,
    last_renewed_at: now.toISOString(),
    payment_status: 'paid' as const,
    ...(input.amountPaid !== undefined ? { amount_paid: input.amountPaid } : {}),
    ...(input.paymentNote !== undefined ? { payment_note: input.paymentNote } : {}),
  }

  if (!isStandaloneUserId(input.userId)) {
    await updateDoc(doc(db, 'users', input.userId), renewalPatch)
  }
  if (input.restaurantId) {
    await updateDoc(doc(db, 'restaurants', input.restaurantId), renewalPatch)
  }
}

export async function approveClient(userId: string, restaurantId?: string | null) {
  if (!isStandaloneUserId(userId)) {
    await updateDoc(doc(db, 'users', userId), {
      account_status: 'active',
      payment_status: 'paid',
      rejection_reason: null,
    })
  }
  if (restaurantId) {
    await updateDoc(doc(db, 'restaurants', restaurantId), {
      status: 'active',
      payment_status: 'paid',
    })
  }
}

export async function rejectClient(userId: string, restaurantId: string | null | undefined, reason: string) {
  await setUserAccountStatus(userId, 'rejected', reason)
  if (restaurantId) await setRestaurantStatus(restaurantId, 'rejected')
}

export async function suspendClient(userId: string, restaurantId?: string | null) {
  await setUserAccountStatus(userId, 'suspended')
  if (restaurantId) await setRestaurantStatus(restaurantId, 'suspended')
}

export async function restoreClient(userId: string, restaurantId?: string | null) {
  await setUserAccountStatus(userId, 'active')
  if (restaurantId) await setRestaurantStatus(restaurantId, 'active')
}

export function getSubscriptionDaysLeft(end?: string | null) {
  const endDate = parseSubscriptionEnd(end)
  if (!endDate) return null
  const diff = endDate.getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

export async function getPlatformStats() {
  const clients = await listAdminClients()
  const totalRestaurants = clients.filter((c) => c.restaurant).length
  const active = clients.filter((c) => c.user.account_status === 'active').length
  const pending = clients.filter((c) => c.user.account_status === 'pending').length
  const rejected = clients.filter((c) => c.user.account_status === 'rejected').length
  const suspended = clients.filter((c) => c.user.account_status === 'suspended').length
  const totalRevenue = clients.reduce((sum, c) => sum + Number(c.user.amount_paid || c.restaurant?.amount_paid || 0), 0)
  const expiringSoon = clients.filter((c) => {
    const days = getSubscriptionDaysLeft(c.user.subscription_end)
    return days !== null && days >= 0 && days <= 7
  }).length
  const expired = clients.filter((c) => {
    const days = getSubscriptionDaysLeft(c.user.subscription_end)
    return days !== null && days < 0
  }).length

  let totalVisitsSample = 0
  try {
    const visitsSnap = await getDocs(query(collectionGroup(db, 'visits'), limit(500)))
    totalVisitsSample = visitsSnap.size
  } catch {
    // Non-blocking analytics fallback.
  }

  return {
    totalClients: clients.length,
    totalRestaurants,
    active,
    pending,
    rejected,
    suspended,
    totalRevenue,
    expiringSoon,
    expired,
    totalVisitsSample,
  }
}
