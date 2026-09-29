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
  customerAddress?: string
  customerLatitude?: number
  customerLongitude?: number
  customerMapUrl?: string
  tableLabel?: string
  notes?: string
  restaurantName: string
}

export async function createOrder(restaurantId: string, input: CreateOrderInput) {
  const cleanItems = input.items.map((item) => ({
    product_id: item.product_id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    extras: item.extras ?? [],
    size: item.size ?? null,
    notes: item.notes ?? null,
    image_url: item.image_url ?? null,
  }))

  const docRef = await addDoc(ordersRef(restaurantId), {
    items: cleanItems,
    subtotal: input.subtotal,
    delivery_fee: input.deliveryFee,
    tax: input.tax,
    total: input.total,
    order_type: input.orderType,
    customer_name: input.customerName ?? null,
    customer_phone: input.customerPhone ?? null,
    customer_address: input.customerAddress ?? null,
    customer_latitude: input.customerLatitude ?? null,
    customer_longitude: input.customerLongitude ?? null,
    customer_map_url: input.customerMapUrl ?? null,
    table_label: input.tableLabel ?? null,
    notes: input.notes ?? null,
    status: 'pending',
    inventory_applied: false,
    created_at: serverTimestamp(),
  })

  const itemsSummary = cleanItems.map((it) => `${it.quantity}× ${it.name}`).join('، ')
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

async function applyInventoryForOrder(
  restaurantId: string,
  items: OrderItem[],
  direction: 'subtract' | 'restore',
) {
  const quantities = new Map<string, number>()
  items.forEach((item) => {
    if (!item.product_id) return
    quantities.set(item.product_id, (quantities.get(item.product_id) || 0) + Number(item.quantity || 0))
  })

  await Promise.all([...quantities.entries()].map(async ([productId, quantity]) => {
    const productRef = doc(db, 'restaurants', restaurantId, 'products', productId)
    const productSnap = await getDoc(productRef)
    if (!productSnap.exists()) return
    const data = productSnap.data()
    if (typeof data.stock_quantity !== 'number') return
    const nextStock = direction === 'subtract'
      ? Math.max(0, data.stock_quantity - quantity)
      : data.stock_quantity + quantity
    await updateDoc(productRef, { stock_quantity: nextStock })
  }))
}

export async function updateOrderStatus(restaurantId: string, orderId: string, status: OrderStatus) {
  const orderRef = doc(db, 'restaurants', restaurantId, 'orders', orderId)
  const orderSnap = await getDoc(orderRef)

  if (orderSnap.exists()) {
    const data = orderSnap.data() as { items?: OrderItem[]; inventory_applied?: boolean }
    const items = data.items ?? []
    const inventoryApplied = data.inventory_applied === true

    if (status === 'completed' && !inventoryApplied) {
      await applyInventoryForOrder(restaurantId, items, 'subtract')
      await updateDoc(orderRef, { status, inventory_applied: true })
    } else if (status === 'cancelled' && inventoryApplied) {
      await applyInventoryForOrder(restaurantId, items, 'restore')
      await updateDoc(orderRef, { status, inventory_applied: false })
    } else {
      await updateDoc(orderRef, { status })
    }
  } else {
    await updateDoc(orderRef, { status })
  }

  await updateDoc(doc(db, 'restaurants', restaurantId, 'order_status', orderId), { status })
}

export function subscribeToOrders(restaurantId: string, onChange: (orders: Order[]) => void) {
  const q = query(ordersRef(restaurantId), orderBy('created_at', 'desc'))
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Order[]
    onChange(orders)
  })
}

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
