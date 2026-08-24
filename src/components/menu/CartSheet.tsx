import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, Plus, Minus, Trash2, Tag, Check, UtensilsCrossed, ShoppingBag, Truck, MessageCircle, MapPin } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { createOrder } from '@/services/orders'
import { validateCoupon } from '@/services/coupons'
import type { Restaurant, OrderType } from '@/types/database'

const ORDER_TYPES: { value: OrderType; label: string; icon: typeof UtensilsCrossed }[] = [
  { value: 'dine_in', label: 'داخل المطعم', icon: UtensilsCrossed },
  { value: 'pickup', label: 'استلام', icon: ShoppingBag },
  { value: 'delivery', label: 'دليفري', icon: Truck },
  { value: 'whatsapp', label: 'واتساب', icon: MessageCircle },
]

export default function CartSheet({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const { lines, updateQuantity, removeItem, clearCart, subtotal } = useCart()
  const [orderType, setOrderType] = useState<OrderType>('dine_in')
  const [tableLabel, setTableLabel] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState<{ code: string; percent: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)

  const discountAmount = couponDiscount ? Math.round((subtotal * couponDiscount.percent) / 100) : 0
  const total = Math.max(0, subtotal - discountAmount)

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCheckingCoupon(true)
    setCouponError(null)
    try {
      const coupon = await validateCoupon(restaurant.id, couponCode)
      if (!coupon) {
        setCouponError('الكوبون ده مش موجود أو منتهي')
        setCouponDiscount(null)
      } else {
        setCouponDiscount({ code: coupon.code, percent: coupon.discount_percent })
      }
    } finally {
      setCheckingCoupon(false)
    }
  }

  async function handleSubmit() {
    if (lines.length === 0) return
    setSubmitting(true)
    try {
      const items = lines.map((l) => ({
        product_id: l.product_id,
        name: l.name,
        price: l.price,
        quantity: l.quantity,
        extras: l.extras,
        size: l.size,
        notes: l.notes,
      }))

      const orderId = await createOrder(restaurant.id, {
        items,
        subtotal,
        deliveryFee: 0,
        tax: 0,
        total,
        orderType,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        tableLabel: orderType === 'dine_in' ? tableLabel || undefined : undefined,
        restaurantName: restaurant.name,
      })

      if (orderType === 'whatsapp' && restaurant.whatsapp) {
        const message = buildWhatsappMessage(restaurant.name, items, total, customerName)
        window.open(`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
      }

      setPlacedOrderId(orderId)
      clearCart()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-ink/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full sm:max-w-md bg-ink text-paper rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-ink flex items-center justify-between px-5 py-4 border-b border-saffron/30 z-10">
          <h2 className="font-display text-lg font-semibold">سلتك</h2>
          <button onClick={onClose} className="text-stone-light hover:text-paper" aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        {placedOrderId ? (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zaytoon/15 flex items-center justify-center">
              <Check size={26} className="text-zaytoon" />
            </div>
            <h3 className="font-display text-lg font-semibold">تم إرسال طلبك</h3>
            <p className="text-stone-light text-sm">المطعم استلم طلبك وهيتواصل معاك لو محتاج أي تفاصيل.</p>
            <Link
              to={`${import.meta.env.BASE_URL}m/${restaurant.slug}/order/${placedOrderId}`}
              onClick={onClose}
              className="mt-2 rounded-full bg-saffron text-ink px-6 py-2.5 text-sm font-semibold hover:bg-saffron-dim transition-colors flex items-center gap-1.5"
            >
              <MapPin size={15} /> تتبّع طلبك
            </Link>
            <button onClick={onClose} className="text-sm text-stone-light hover:text-paper underline underline-offset-2">
              تمام، رجّعني للمنيو
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="p-10 text-center text-stone-light">سلتك فاضية.</div>
        ) : (
          <div className="p-5">
            {/* Items */}
            <div className="flex flex-col gap-3 mb-5">
              {lines.map((l) => (
                <div key={l.lineId} className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {l.name}
                      {l.size && <span className="text-stone-light font-normal"> — {l.size}</span>}
                    </p>
                    {l.extras.length > 0 && (
                      <p className="text-xs text-stone-light mt-0.5">{l.extras.map((e) => e.name).join('، ')}</p>
                    )}
                    {l.notes && <p className="text-xs text-stone-light mt-0.5 italic">"{l.notes}"</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => updateQuantity(l.lineId, l.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-4 text-center">{l.quantity}</span>
                      <button
                        onClick={() => updateQuantity(l.lineId, l.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-display font-semibold">
                      {(l.price + l.extras.reduce((s, e) => s + e.price, 0)) * l.quantity} ج.م
                    </span>
                    <button onClick={() => removeItem(l.lineId)} className="text-stone-light hover:text-sumac" aria-label="حذف">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 relative">
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-light" size={14} />
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="كود خصم (اختياري)"
                  className="w-full rounded-full bg-white/5 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                disabled={checkingCoupon}
                className="rounded-full bg-white/5 px-4 py-2 text-sm font-medium hover:bg-stone-light/30 disabled:opacity-60"
              >
                تطبيق
              </button>
            </div>
            {couponError && <p className="text-xs text-sumac -mt-3 mb-4">{couponError}</p>}
            {couponDiscount && (
              <p className="text-xs text-zaytoon -mt-3 mb-4">تم تطبيق كوبون {couponDiscount.code} (خصم {couponDiscount.percent}%)</p>
            )}

            {/* Order type */}
            <p className="text-sm font-medium mb-2">طريقة الاستلام</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {ORDER_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setOrderType(t.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs transition-colors ${
                    orderType === t.value ? 'bg-ink text-paper' : 'bg-white/5 text-paper hover:bg-stone-light/30'
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>

            {orderType === 'dine_in' && (
              <input
                value={tableLabel}
                onChange={(e) => setTableLabel(e.target.value)}
                placeholder="رقم الطاولة (اختياري)"
                className="w-full rounded-xl border border-saffron/50 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-saffron/40"
              />
            )}
            {(orderType === 'pickup' || orderType === 'delivery' || orderType === 'whatsapp') && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="اسمك"
                  className="rounded-xl border border-saffron/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
                />
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="رقم تليفونك"
                  dir="ltr"
                  className="rounded-xl border border-saffron/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
                />
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-saffron/30 pt-3 mb-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-light">
                <span>الإجمالي الفرعي</span>
                <span>{subtotal} ج.م</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-zaytoon">
                  <span>الخصم</span>
                  <span>-{discountAmount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between font-display font-semibold text-base pt-1.5 border-t border-saffron/20">
                <span>الإجمالي</span>
                <span>{total} ج.م</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-full bg-saffron text-ink font-semibold py-3.5 hover:bg-saffron-dim active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {submitting ? 'جارِ الإرسال...' : orderType === 'whatsapp' ? 'إرسال عبر واتساب' : 'تأكيد الطلب'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function buildWhatsappMessage(
  restaurantName: string,
  items: { name: string; quantity: number; price: number; extras: { name: string; price: number }[] }[],
  total: number,
  customerName: string
) {
  const lines = items.map((it) => {
    const extrasText = it.extras.length ? ` (${it.extras.map((e) => e.name).join('، ')})` : ''
    return `- ${it.name}${extrasText} × ${it.quantity}`
  })
  return [
    `طلب جديد من ${restaurantName}`,
    customerName ? `الاسم: ${customerName}` : '',
    '',
    ...lines,
    '',
    `الإجمالي: ${total} ج.م`,
  ]
    .filter(Boolean)
    .join('\n')
}
