import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, Plus, Minus, Trash2, Tag, Check, UtensilsCrossed, ShoppingBag, Truck, MessageCircle, MapPin, LocateFixed, Gift } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { createOrder } from '@/services/orders'
import { validateCoupon } from '@/services/coupons'
import { getLoyaltyBalance, normalizeCustomerPhone } from '@/services/loyalty'
import type { Restaurant, OrderType } from '@/types/database'

const ORDER_TYPES: { value: OrderType; label: string; icon: typeof UtensilsCrossed }[] = [
  { value: 'dine_in', label: 'داخل المطعم', icon: UtensilsCrossed },
  { value: 'pickup', label: 'استلام', icon: ShoppingBag },
  { value: 'delivery', label: 'دليفري', icon: Truck },
  { value: 'whatsapp', label: 'واتساب', icon: MessageCircle },
]

type LocationStatus = 'idle' | 'loading' | 'success' | 'error'
type DeliveryZone = { id: string; name: string; fee: number; min_order: number; active: boolean }
type GrowthRestaurant = Restaurant & {
  growth?: {
    loyalty?: { enabled?: boolean; points_per_egp?: number; reward_threshold?: number; reward_value?: number }
    delivery_zones?: DeliveryZone[]
  }
}

export default function CartSheet({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const { lines, updateQuantity, removeItem, clearCart, subtotal } = useCart()
  const growth = (restaurant as GrowthRestaurant).growth
  const loyaltyConfig = growth?.loyalty
  const loyaltyEnabled = loyaltyConfig?.enabled === true
  const activeZones = useMemo(() => (growth?.delivery_zones ?? []).filter((zone) => zone.active !== false), [growth?.delivery_zones])

  const [orderType, setOrderType] = useState<OrderType>('dine_in')
  const [tableLabel, setTableLabel] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerLatitude, setCustomerLatitude] = useState<number | null>(null)
  const [customerLongitude, setCustomerLongitude] = useState<number | null>(null)
  const [customerMapUrl, setCustomerMapUrl] = useState('')
  const [selectedZoneId, setSelectedZoneId] = useState('')
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')
  const [locationMessage, setLocationMessage] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState<{ code: string; percent: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null)
  const [loyaltyPhone, setLoyaltyPhone] = useState('')
  const [checkingLoyalty, setCheckingLoyalty] = useState(false)
  const [useLoyalty, setUseLoyalty] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const selectedZone = activeZones.find((zone) => zone.id === selectedZoneId) ?? null
  const deliveryFee = (orderType === 'delivery' || orderType === 'whatsapp') ? Math.max(0, Number(selectedZone?.fee || 0)) : 0
  const couponDiscountAmount = couponDiscount ? Math.round((subtotal * couponDiscount.percent) / 100) : 0
  const afterCoupon = Math.max(0, subtotal - couponDiscountAmount)
  const rewardThreshold = Math.max(1, Number(loyaltyConfig?.reward_threshold || 100))
  const rewardValue = Math.max(0, Number(loyaltyConfig?.reward_value || 0))
  const availableRewardUnits = loyaltyPoints == null ? 0 : Math.floor(loyaltyPoints / rewardThreshold)
  const maxUsefulUnits = rewardValue > 0 && afterCoupon > 0 ? Math.ceil(afterCoupon / rewardValue) : 0
  const rewardUnitsUsed = useLoyalty ? Math.min(availableRewardUnits, maxUsefulUnits) : 0
  const loyaltyPointsToRedeem = rewardUnitsUsed * rewardThreshold
  const loyaltyDiscountAmount = Math.min(afterCoupon, rewardUnitsUsed * rewardValue)
  const total = Math.max(0, afterCoupon - loyaltyDiscountAmount + deliveryFee)
  const earnedPointsPreview = loyaltyEnabled ? Math.floor(Math.max(0, total - deliveryFee) * Math.max(0, Number(loyaltyConfig?.points_per_egp || 0))) : 0

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

  async function checkLoyalty() {
    if (!loyaltyEnabled) return
    const normalized = normalizeCustomerPhone(customerPhone)
    if (!normalized) {
      setSubmitError('اكتب رقم تليفون صحيح علشان نعرض نقاط الولاء.')
      return
    }
    setCheckingLoyalty(true)
    setSubmitError(null)
    try {
      const balance = await getLoyaltyBalance(restaurant.id, customerPhone)
      setLoyaltyPoints(balance.points)
      setLoyaltyPhone(normalized)
      setUseLoyalty(false)
    } catch {
      setSubmitError('تعذّر تحميل نقاط الولاء دلوقتي. جرّب تاني.')
    } finally {
      setCheckingLoyalty(false)
    }
  }

  function requestCustomerLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      setLocationMessage('المتصفح ده مش بيدعم تحديد الموقع. اكتب العنوان بالتفصيل.')
      return
    }
    setLocationStatus('loading')
    setLocationMessage('جارِ تحديد موقعك الحالي...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6))
        const longitude = Number(position.coords.longitude.toFixed(6))
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
        setCustomerLatitude(latitude)
        setCustomerLongitude(longitude)
        setCustomerMapUrl(mapUrl)
        setLocationStatus('success')
        setLocationMessage('تم تحديد موقعك بنجاح ✓')
        setSubmitError(null)
      },
      (error) => {
        setCustomerLatitude(null)
        setCustomerLongitude(null)
        setCustomerMapUrl('')
        setLocationStatus('error')
        if (error.code === error.PERMISSION_DENIED) setLocationMessage('اسمح للموقع باستخدام الـ GPS من إعدادات المتصفح، أو اكتب العنوان بالتفصيل.')
        else if (error.code === error.TIMEOUT) setLocationMessage('تحديد الموقع أخد وقت طويل. جرّب تاني أو اكتب العنوان بالتفصيل.')
        else setLocationMessage('مقدرناش نحدد موقعك حاليًا. جرّب تاني أو اكتب العنوان بالتفصيل.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  function selectOrderType(type: OrderType) {
    setOrderType(type)
    setSubmitError(null)
    if ((type === 'delivery' || type === 'whatsapp') && locationStatus === 'idle') requestCustomerLocation()
  }

  async function handleSubmit() {
    if (lines.length === 0) return
    if ((orderType === 'delivery' || orderType === 'whatsapp') && !customerAddress.trim()) {
      setSubmitError('اكتب عنوان التوصيل قبل تأكيد الطلب.')
      return
    }
    if ((orderType === 'delivery' || orderType === 'whatsapp') && activeZones.length > 0 && !selectedZone) {
      setSubmitError('اختار منطقة التوصيل الأول.')
      return
    }
    if (selectedZone && subtotal < Math.max(0, Number(selectedZone.min_order || 0))) {
      setSubmitError(`الحد الأدنى للطلب في ${selectedZone.name} هو ${selectedZone.min_order} ج.م.`)
      return
    }
    if (useLoyalty && normalizeCustomerPhone(customerPhone) !== loyaltyPhone) {
      setSubmitError('رقم التليفون اتغير. اضغط «اعرف نقاطي» تاني قبل استخدام النقاط.')
      return
    }

    const whatsappNumber = normalizeWhatsappNumber(restaurant.whatsapp)
    let whatsappWindow: Window | null = null
    if (orderType === 'whatsapp') {
      if (!whatsappNumber) {
        setSubmitError('رقم واتساب المطعم غير مضبوط. راجع رقم الواتساب من إعدادات المنيو.')
        return
      }
      whatsappWindow = window.open('about:blank', '_blank')
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const items = lines.map((l) => ({
        product_id: l.product_id,
        name: l.name,
        price: l.price,
        quantity: l.quantity,
        extras: l.extras,
        size: l.size,
        notes: l.notes,
        image_url: l.image_url ?? null,
      }))

      const orderId = await createOrder(restaurant.id, {
        items,
        subtotal,
        deliveryFee,
        tax: 0,
        total,
        orderType,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerAddress: customerAddress.trim() || undefined,
        customerLatitude: customerLatitude ?? undefined,
        customerLongitude: customerLongitude ?? undefined,
        customerMapUrl: customerMapUrl || undefined,
        deliveryZoneName: selectedZone?.name,
        loyaltyRedeemPoints: loyaltyEnabled ? loyaltyPointsToRedeem : 0,
        loyaltyDiscount: loyaltyEnabled ? loyaltyDiscountAmount : 0,
        tableLabel: orderType === 'dine_in' ? tableLabel || undefined : undefined,
        restaurantName: restaurant.name,
      })

      if (orderType === 'whatsapp' && whatsappNumber) {
        const message = buildWhatsappMessage(
          restaurant.name,
          items,
          total,
          customerName,
          customerPhone,
          customerAddress,
          customerMapUrl,
          orderType,
          tableLabel,
          selectedZone?.name || '',
          deliveryFee,
          loyaltyDiscountAmount,
        )
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
        if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.location.href = whatsappUrl
        else window.location.href = whatsappUrl
      }

      setPlacedOrderId(orderId)
      clearCart()
    } catch (err) {
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close()
      setSubmitError(err instanceof Error ? err.message : 'حصل خطأ أثناء إرسال الطلب، حاول تاني')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-ink/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }} className="w-full sm:max-w-md bg-ink text-paper rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-ink flex items-center justify-between px-5 py-4 border-b border-saffron/30 z-10">
          <h2 className="font-display text-lg font-semibold">سلتك</h2>
          <button onClick={onClose} className="text-stone-light hover:text-paper" aria-label="إغلاق"><X size={20} /></button>
        </div>

        {placedOrderId ? (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zaytoon/15 flex items-center justify-center"><Check size={26} className="text-zaytoon" /></div>
            <h3 className="font-display text-lg font-semibold">تم إرسال طلبك</h3>
            <p className="text-stone-light text-sm">المطعم استلم طلبك وهيتواصل معاك لو محتاج أي تفاصيل.</p>
            {loyaltyEnabled && earnedPointsPreview > 0 && <p className="text-sm text-saffron flex items-center gap-1"><Gift size={15} /> بعد اكتمال الطلب هتكسب تقريبًا {earnedPointsPreview} نقطة</p>}
            <Link to={`${import.meta.env.BASE_URL}m/${restaurant.slug}/order/${placedOrderId}`} onClick={onClose} className="mt-2 rounded-full bg-saffron text-ink px-6 py-2.5 text-sm font-semibold hover:bg-saffron-dim transition-colors flex items-center gap-1.5"><MapPin size={15} /> تتبّع طلبك</Link>
            <button onClick={onClose} className="text-sm text-stone-light hover:text-paper underline underline-offset-2">تمام، رجّعني للمنيو</button>
          </div>
        ) : lines.length === 0 ? (
          <div className="p-10 text-center text-stone-light">سلتك فاضية.</div>
        ) : (
          <div className="p-5">
            <div className="flex flex-col gap-3 mb-5">
              {lines.map((l) => (
                <div key={l.lineId} className="flex items-start gap-3">
                  {l.image_url && <img src={l.image_url} alt={l.name} className="w-14 h-14 rounded-xl object-cover bg-white/5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{l.name}{l.size && <span className="text-stone-light font-normal"> — {l.size}</span>}</p>
                    {(l.extras ?? []).length > 0 && <p className="text-xs text-stone-light mt-0.5">{(l.extras ?? []).map((e) => e.name).join('، ')}</p>}
                    {l.notes && <p className="text-xs text-stone-light mt-0.5 italic">"{l.notes}"</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => updateQuantity(l.lineId, l.quantity - 1)} className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center"><Minus size={12} /></button>
                      <span className="text-sm w-4 text-center">{l.quantity}</span>
                      <button onClick={() => updateQuantity(l.lineId, l.quantity + 1)} className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center"><Plus size={12} /></button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-display font-semibold">{(l.price + (l.extras ?? []).reduce((s, e) => s + e.price, 0)) * l.quantity} ج.م</span>
                    <button onClick={() => removeItem(l.lineId)} className="text-stone-light hover:text-sumac" aria-label="حذف"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 relative"><Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-light" size={14} /><input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="كود خصم (اختياري)" className="w-full rounded-full bg-white/5 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40" /></div>
              <button onClick={handleApplyCoupon} disabled={checkingCoupon} className="rounded-full bg-white/5 px-4 py-2 text-sm font-medium hover:bg-stone-light/30 disabled:opacity-60">تطبيق</button>
            </div>
            {couponError && <p className="text-xs text-sumac -mt-3 mb-4">{couponError}</p>}
            {couponDiscount && <p className="text-xs text-zaytoon -mt-3 mb-4">تم تطبيق كوبون {couponDiscount.code} (خصم {couponDiscount.percent}%)</p>}

            <p className="text-sm font-medium mb-2">طريقة الاستلام</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {ORDER_TYPES.map((t) => <button key={t.value} onClick={() => selectOrderType(t.value)} className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs transition-colors ${orderType === t.value ? 'bg-saffron text-ink' : 'bg-white/5 text-paper hover:bg-stone-light/30'}`}><t.icon size={16} />{t.label}</button>)}
            </div>

            {orderType === 'dine_in' && <input value={tableLabel} onChange={(e) => setTableLabel(e.target.value)} placeholder="رقم الطاولة (اختياري)" className="w-full rounded-xl border border-saffron/50 bg-white/5 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-saffron/40" />}

            {(orderType === 'pickup' || orderType === 'delivery' || orderType === 'whatsapp') && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="اسمك" className="rounded-xl border border-saffron/50 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40" />
                <input value={customerPhone} onChange={(e) => { setCustomerPhone(e.target.value); setUseLoyalty(false); if (normalizeCustomerPhone(e.target.value) !== loyaltyPhone) setLoyaltyPoints(null) }} placeholder="رقم تليفونك" dir="ltr" className="rounded-xl border border-saffron/50 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40" />
              </div>
            )}

            {(orderType === 'delivery' || orderType === 'whatsapp') && (
              <div className="mb-3 space-y-2">
                {activeZones.length > 0 && (
                  <select value={selectedZoneId} onChange={(e) => { setSelectedZoneId(e.target.value); setSubmitError(null) }} className="w-full rounded-xl border border-saffron/50 bg-ink px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40">
                    <option value="">اختر منطقة التوصيل *</option>
                    {activeZones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name} — توصيل {zone.fee} ج.م{zone.min_order > 0 ? ` — حد أدنى ${zone.min_order} ج.م` : ''}</option>)}
                  </select>
                )}
                <div className="relative"><MapPin className="absolute right-3 top-3 text-stone-light" size={15} /><textarea value={customerAddress} onChange={(e) => { setCustomerAddress(e.target.value); setSubmitError(null) }} placeholder="عنوان التوصيل بالتفصيل *" rows={2} className="w-full rounded-xl border border-saffron/50 bg-white/5 pr-9 pl-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-saffron/40" /></div>
                <button type="button" onClick={requestCustomerLocation} disabled={locationStatus === 'loading'} className="w-full rounded-xl border border-saffron/40 bg-white/5 px-3 py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-60"><LocateFixed size={16} />{locationStatus === 'loading' ? 'جارِ تحديد موقعك...' : locationStatus === 'success' ? 'تحديث موقعي الحالي' : 'حدد موقعي الحالي GPS'}</button>
                {locationMessage && <p className={`text-xs px-1 ${locationStatus === 'success' ? 'text-zaytoon' : locationStatus === 'error' ? 'text-sumac' : 'text-stone-light'}`}>{locationMessage}</p>}
                {customerMapUrl && <a href={customerMapUrl} target="_blank" rel="noreferrer" className="text-xs text-saffron-dim underline underline-offset-2 inline-flex items-center gap-1"><MapPin size={12} /> فتح الموقع المحدد على الخريطة</a>}
              </div>
            )}

            {loyaltyEnabled && (orderType === 'pickup' || orderType === 'delivery' || orderType === 'whatsapp') && (
              <div className="mb-4 rounded-2xl border border-saffron/30 bg-saffron/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-sm font-semibold flex items-center gap-1.5"><Gift size={15} className="text-saffron" /> نقاط الولاء</p><p className="text-xs text-stone-light mt-1">البرنامج مفعّل من صاحب المتجر.</p></div>
                  <button type="button" onClick={checkLoyalty} disabled={checkingLoyalty} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold disabled:opacity-50">{checkingLoyalty ? 'جارِ الفحص...' : 'اعرف نقاطي'}</button>
                </div>
                {loyaltyPoints != null && (
                  <div className="mt-3 rounded-xl bg-white/5 p-3">
                    <div className="flex items-center justify-between"><span className="text-sm">رصيدك</span><b className="text-saffron">{loyaltyPoints.toLocaleString('ar-EG')} نقطة</b></div>
                    {availableRewardUnits > 0 && rewardValue > 0 ? (
                      <label className="mt-2 flex items-center justify-between gap-3 text-sm cursor-pointer"><span>استخدم نقاطي في الطلب {loyaltyDiscountAmount > 0 ? `(-${loyaltyDiscountAmount} ج.م)` : ''}</span><input type="checkbox" checked={useLoyalty} onChange={(e) => setUseLoyalty(e.target.checked)} className="w-5 h-5" /></label>
                    ) : <p className="text-xs text-stone-light mt-2">تحتاج {rewardThreshold.toLocaleString('ar-EG')} نقطة علشان تستبدل مكافأة.</p>}
                  </div>
                )}
                {earnedPointsPreview > 0 && <p className="text-xs text-zaytoon mt-2">الطلب ده ممكن يكسبك {earnedPointsPreview.toLocaleString('ar-EG')} نقطة بعد ما المتجر يعلّمه مكتمل.</p>}
              </div>
            )}

            <div className="border-t border-saffron/30 pt-3 mb-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-light"><span>الإجمالي الفرعي</span><span>{subtotal} ج.م</span></div>
              {couponDiscountAmount > 0 && <div className="flex justify-between text-zaytoon"><span>خصم الكوبون</span><span>-{couponDiscountAmount} ج.م</span></div>}
              {loyaltyDiscountAmount > 0 && <div className="flex justify-between text-zaytoon"><span>خصم نقاط الولاء</span><span>-{loyaltyDiscountAmount} ج.م</span></div>}
              {deliveryFee > 0 && <div className="flex justify-between text-stone-light"><span>رسوم التوصيل{selectedZone ? ` — ${selectedZone.name}` : ''}</span><span>+{deliveryFee} ج.م</span></div>}
              <div className="flex justify-between font-display font-semibold text-base pt-1.5 border-t border-saffron/20"><span>الإجمالي</span><span>{total} ج.م</span></div>
            </div>

            {submitError && <p className="text-sm text-sumac bg-sumac/10 rounded-xl px-3 py-2 mb-3">{submitError}</p>}
            <button onClick={handleSubmit} disabled={submitting} className="w-full rounded-full bg-saffron text-ink font-semibold py-3.5 hover:bg-saffron-dim active:scale-[0.98] transition-all disabled:opacity-60">{submitting ? 'جارِ الإرسال...' : orderType === 'whatsapp' ? 'إرسال عبر واتساب' : 'تأكيد الطلب'}</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function normalizeWhatsappNumber(value?: string | null) {
  if (!value) return ''
  let digits = value.replace(/[^0-9]/g, '')
  if (!digits) return ''
  if (digits.startsWith('0020')) digits = digits.slice(2)
  if (digits.startsWith('01') && digits.length === 11) digits = `20${digits}`
  else if (digits.startsWith('1') && digits.length === 10) digits = `20${digits}`
  return digits
}

function buildWhatsappMessage(
  restaurantName: string,
  items: { name: string; quantity: number; price: number; extras: { name: string; price: number }[]; size?: string; notes?: string; image_url?: string | null }[],
  total: number,
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  customerMapUrl: string,
  orderType: OrderType,
  tableLabel: string,
  deliveryZoneName: string,
  deliveryFee: number,
  loyaltyDiscount: number,
) {
  const typeLabel = ORDER_TYPES.find((type) => type.value === orderType)?.label ?? orderType
  const lines = items.map((it) => {
    const sizeText = it.size ? ` - ${it.size}` : ''
    const extrasText = (it.extras ?? []).length ? ` (${(it.extras ?? []).map((e) => e.name).join('، ')})` : ''
    const notesText = it.notes ? ` | ملاحظة: ${it.notes}` : ''
    const imageText = it.image_url ? `\n  صورة السلعة: ${it.image_url}` : ''
    return `- ${it.name}${sizeText}${extrasText} × ${it.quantity}${notesText}${imageText}`
  })

  return [
    `طلب جديد من ${restaurantName}`,
    `نوع الطلب: ${typeLabel}`,
    customerName ? `الاسم: ${customerName}` : '',
    customerPhone ? `التليفون: ${customerPhone}` : '',
    deliveryZoneName ? `منطقة التوصيل: ${deliveryZoneName}` : '',
    customerAddress ? `العنوان: ${customerAddress}` : '',
    customerMapUrl ? `الموقع على الخريطة: ${customerMapUrl}` : '',
    orderType === 'dine_in' && tableLabel ? `الطاولة: ${tableLabel}` : '',
    '',
    ...lines,
    '',
    loyaltyDiscount > 0 ? `خصم نقاط الولاء: -${loyaltyDiscount} ج.م` : '',
    deliveryFee > 0 ? `رسوم التوصيل: ${deliveryFee} ج.م` : '',
    `الإجمالي: ${total} ج.م`,
  ].filter(Boolean).join('\n')
}
