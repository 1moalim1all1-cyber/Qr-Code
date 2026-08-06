import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Order, OrderItem, OrderType, OrderStatus } from '@/types/database'

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
  return docRef.id
}

export async function listOrders(restaurantId: string) {
  const q = query(ordersRef(restaurantId), orderBy('created_at', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Order[]
}

export async function updateOrderStatus(restaurantId: string, orderId: string, status: OrderStatus) {
  await updateDoc(doc(db, 'restaurants', restaurantId, 'orders', orderId), { status })
}
