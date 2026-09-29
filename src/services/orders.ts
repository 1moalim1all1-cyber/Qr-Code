import { collection, addDoc, getDoc, getDocs, doc, setDoc, updateDoc, query, orderBy, serverTimestamp, onSnapshot, runTransaction } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { normalizeCustomerPhone } from '@/services/loyalty'
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
  deliveryZoneName?: string
  loyaltyRedeemPoints?: number
  loyaltyDiscount?: number
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
    delivery_zone_name: input.deliveryZoneName ?? null,
    tax: input.tax,
    total: input.total,
    order_type: input.orderType,
    customer_name: input.customerName ?? null,
    customer_phone: input.customerPhone ?? null,
    customer_address: input.customerAddress ?? null,
    customer_latitude: input.customerLatitude ?? null,
    customer_longitude: input.customerLongitude ?? null,
    customer_map_url: input.customerMapUrl ?? null,
    loyalty_redeem_points: Math.max(0, Number(input.loyaltyRedeemPoints || 0)),
    loyalty_discount: Math.max(0, Number(input.loyaltyDiscount || 0)),
    loyalty_awarded: false,
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

async function applyLoyaltyForCompletedOrder(restaurantId: string, orderId: string) {
  const restaurantRef = doc(db, 'restaurants', restaurantId)
  const orderRef = doc(db, 'restaurants', restaurantId, 'orders', orderId)

  await runTransaction(db, async (transaction) => {
    const [restaurantSnap, orderSnap] = await Promise.all([
      transaction.get(restaurantRef),
      transaction.get(orderRef),
    ])
    if (!restaurantSnap.exists() || !orderSnap.exists()) return

    const restaurantData = restaurantSnap.data()
    const orderData = orderSnap.data()
    const loyalty = restaurantData.growth?.loyalty

    // الولاء لا يعمل نهائيًا إلا لو صاحب المتجر فعّله وحفظ الإعداد.
    if (loyalty?.enabled !== true || orderData.loyalty_awarded === true) return

    const phone = normalizeCustomerPhone(orderData.customer_phone)
    if (!phone) {
      transaction.update(orderRef, { loyalty_awarded: true, loyalty_points_earned: 0 })
      return
    }

    const pointsPerEgp = Math.max(0, Number(loyalty.points_per_egp || 0))
    const requestedRedeem = Math.max(0, Number(orderData.loyalty_redeem_points || 0))
    const eligiblePaid = Math.max(0, Number(orderData.total || 0) - Number(orderData.delivery_fee || 0))
    const earned = Math.floor(eligiblePaid * pointsPerEgp)
    const customerRef = doc(db, 'restaurants', restaurantId, 'loyalty_customers', phone)
    const customerSnap = await transaction.get(customerRef)
    const existing = customerSnap.exists() ? customerSnap.data() : {}
    const currentPoints = Math.max(0, Number(existing.points || 0))
    const redeemed = Math.min(currentPoints, requestedRedeem)
    const nextPoints = Math.max(0, currentPoints - redeemed + earned)

    transaction.set(customerRef, {
      points: nextPoints,
      total_earned: Math.max(0, Number(existing.total_earned || 0)) + earned,
      total_redeemed: Math.max(0, Number(existing.total_redeemed || 0)) + redeemed,
      last_order_id: orderId,
      updated_at: serverTimestamp(),
    }, { merge: true })

    transaction.update(orderRef, {
      loyalty_awarded: true,
      loyalty_points_earned: earned,
      loyalty_points_redeemed: redeemed,
    })
  })
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

  if (status === 'completed') {
    await applyLoyaltyForCompletedOrder(restaurantId, orderId)
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
