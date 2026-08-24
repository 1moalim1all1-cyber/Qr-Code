import { collection, addDoc, getDoc, getDocs, doc, setDoc, updateDoc, query, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Order, OrderItem, OrderType, OrderStatus, OrderStatusPublic } from '@/types/database'

const ordersRef = (restaurantId: string) => collection(db, 'restaurants', restaurantId, 'orders')

export interface CreateOrderInput {
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  orderType: OrderType
  customerName?: string
  customerPhone?: string
  tableLabel?: string
  notes?: string
  restaurantName: string
}

export async function createOrder(restaurantId: string, input: CreateOrderInput) {
  const docRef = await addDoc(ordersRef(restaurantId), {
    items: input.items,
    subtotal: input.subtotal,
    delivery_fee: input.deliveryFee,
    tax: input.tax,
    total: input.total,
    order_type: input.orderType,
    customer_name: input.customerName ?? null,
    customer_phone: input.customerPhone ?? null,
    table_label: input.tableLabel ?? null,
    notes: input.notes ?? null,
    status: 'pending',
    created_at: serverTimestamp(),
  })

  // A public, non-sensitive companion doc (no customer name/phone) with the
  // SAME id as the order, so a customer can check "where's my order" via a
  // simple link without needing an account or exposing anyone else's data.
  const itemsSummary = input.items.map((it) => `${it.quantity}× ${it.name}`).join('، ')
  await setDoc(doc(db, 'restaurants', restaurantId, 'order_status', docRef.id), {
    restaurant_id: restaurantId,
    restaurant_name: input.restaurantName,
    status: 'pending',
    order_type: input.orderType,
    items_summary: itemsSummary,
    total: input.total,
    table_label: input.tableLabel ?? null,
    created_at: serverTimestamp(),
  })

  return docRef.id
}

export async function listOrders(restaurantId: string) {
  const q = query(ordersRef(restaurantId), orderBy('created_at', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Order[]
}

export async function updateOrderStatus(restaurantId: string, orderId: string, status: OrderStatus) {
  await updateDoc(doc(db, 'restaurants', restaurantId, 'orders', orderId), { status })
  await updateDoc(doc(db, 'restaurants', restaurantId, 'order_status', orderId), { status })
}

// Real-time subscription — used by OrdersPage so a restaurant owner sees new
// orders (and a notification) the moment a customer places one, without
// needing to refresh the page.
export function subscribeToOrders(restaurantId: string, onChange: (orders: Order[]) => void) {
  const q = query(ordersRef(restaurantId), orderBy('created_at', 'desc'))
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Order[]
    onChange(orders)
  })
}

// Used by the public order-tracking page — a customer polls/subscribes to
// this by the order ID they were given right after checkout.
export function subscribeToOrderStatus(
  restaurantId: string,
  orderId: string,
  onChange: (status: OrderStatusPublic | null) => void
) {
  const ref = doc(db, 'restaurants', restaurantId, 'order_status', orderId)
  return onSnapshot(
    ref,
    (snap) => onChange(snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as OrderStatusPublic) : null),
    () => onChange(null)
  )
}

export async function getOrderStatusOnce(restaurantId: string, orderId: string) {
  const snap = await getDoc(doc(db, 'restaurants', restaurantId, 'order_status', orderId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as unknown as OrderStatusPublic
}
