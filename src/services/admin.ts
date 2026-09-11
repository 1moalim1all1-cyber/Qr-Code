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
import { db } from '@/lib/firebase'
import type { AccountStatus, AppUser, Restaurant, RestaurantStatus } from '@/types/database'

export interface AdminClientRecord {
  user: AppUser
  restaurant: Restaurant | null
  standalone?: boolean
}

function isStandaloneUserId(userId: string) {
  return userId.startsWith('restaurant:')
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addMonths(base: Date, months: number) {
  const d = new Date(base)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + months)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, lastDay))
  return d
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
  const restaurantByOwner = new Map(
    restaurants.filter((r) => r.owner_id).map((r) => [r.owner_id as string, r]),
  )

  const registered: AdminClientRecord[] = users
    .filter((u) => u.role === 'owner')
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
        subscription_months: rawUser.subscription_months ?? restaurant?.subscription_months ?? null,
        last_renewed_at: rawUser.last_renewed_at ?? restaurant?.last_renewed_at ?? null,
      }
      return { user, restaurant, standalone: false }
    })

  const standalone: AdminClientRecord[] = restaurants
    .filter((r) => !r.owner_id)
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
        subscription_months: restaurant.subscription_months ?? null,
        last_renewed_at: restaurant.last_renewed_at ?? null,
        created_at: '',
      },
    }))

  return [...registered, ...standalone]
    .sort((a, b) => (a.user.full_name || '').localeCompare(b.user.full_name || '', 'ar'))
}

export async function setRestaurantStatus(id: string, status: RestaurantStatus) {
  await updateDoc(doc(db, 'restaurants', id), { status })
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
  months: number
  amountPaid?: number
  paymentNote?: string
}) {
  const clients = await listAdminClients()
  const client = clients.find((c) => c.user.id === input.userId)
  const currentEnd = client?.user.subscription_end
  const today = new Date()
  const parsedEnd = currentEnd ? new Date(`${currentEnd}T00:00:00`) : null
  const base = parsedEnd && parsedEnd.getTime() > today.getTime() ? parsedEnd : today
  const newEnd = addMonths(base, input.months)
  const start = client?.user.subscription_start || isoDate(today)
  const renewalPatch = {
    subscription_start: start,
    subscription_end: isoDate(newEnd),
    subscription_months: input.months,
    last_renewed_at: isoDate(today),
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
  if (!end) return null
  const endDate = new Date(`${end}T23:59:59`)
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
