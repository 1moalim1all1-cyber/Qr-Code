import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ChefHat, PackageCheck, XCircle, Clock, ArrowRight, Gift } from 'lucide-react'
import { getRestaurantBySlug } from '@/services/restaurants'
import { subscribeToOrderStatus } from '@/services/orders'
import type { OrderStatusPublic, OrderStatus } from '@/types/database'

const STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'pending', label: 'استلمنا طلبك', icon: Clock },
  { status: 'preparing', label: 'بيتحضّر دلوقتي', icon: ChefHat },
  { status: 'ready', label: 'جاهز', icon: PackageCheck },
  { status: 'completed', label: 'اتسلّم', icon: CheckCircle2 },
]

const ORDER_TYPE_LABEL: Record<string, string> = {
  dine_in: 'داخل المطعم',
  pickup: 'استلام',
  delivery: 'دليفري',
  whatsapp: 'واتساب',
}

type LoyaltyOrderStatus = OrderStatusPublic & {
  loyalty_points_earned?: number
  loyalty_points_redeemed?: number
  loyalty_balance?: number | null
}

export default function OrderTrackingPage() {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>()
  const [status, setStatus] = useState<LoyaltyOrderStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug || !orderId) return
    let unsubscribe: (() => void) | undefined

    getRestaurantBySlug(slug)
      .then((r) => {
        unsubscribe = subscribeToOrderStatus(r.id, orderId, (s) => {
          setStatus(s as LoyaltyOrderStatus | null)
          setLoading(false)
        })
      })
      .catch(() => setLoading(false))

    return () => unsubscribe?.()
  }, [slug, orderId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-ink text-paper">جارِ التحميل...</div>
  }

  if (!status) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ink text-paper text-center px-6 gap-2">
        <h1 className="font-display text-xl font-semibold">الطلب ده مش موجود</h1>
        <p className="text-stone-light text-sm">تأكد من الرابط، أو إن الطلب لسه مسجّل.</p>
        {slug && (
          <Link to={`${import.meta.env.BASE_URL}m/${slug}`} className="text-saffron-dim text-sm mt-2 flex items-center gap-1">
            <ArrowRight size={14} /> ارجع للمنيو
          </Link>
        )}
      </div>
    )
  }

  const isCancelled = status.status === 'cancelled'
  const currentStepIndex = STEPS.findIndex((s) => s.status === status.status)
  const earned = Math.max(0, Number(status.loyalty_points_earned || 0))
  const redeemed = Math.max(0, Number(status.loyalty_points_redeemed || 0))
  const balance = status.loyalty_balance == null ? null : Math.max(0, Number(status.loyalty_balance || 0))
  const showLoyalty = status.status === 'completed' && (earned > 0 || redeemed > 0 || balance != null)

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <p className="text-center text-sm text-stone-light mb-1">{status.restaurant_name}</p>
        <h1 className="font-display text-2xl font-bold text-center mb-1">تتبّع طلبك</h1>
        <p className="text-center text-xs text-stone-light mb-8">
          {ORDER_TYPE_LABEL[status.order_type] ?? status.order_type}
          {status.table_label ? ` · طاولة ${status.table_label}` : ''}
        </p>

        {isCancelled ? (
          <div className="rounded-2xl bg-sumac/10 border border-sumac/20 p-6 text-center mb-8">
            <XCircle size={32} className="text-sumac mx-auto mb-2" />
            <p className="font-medium text-sumac">اتلغى الطلب ده</p>
            <p className="text-xs text-stone-light mt-1">لو ده غريب، كلّم المطعم مباشرة.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 mb-8">
            {STEPS.map((step, i) => {
              const done = i <= currentStepIndex
              const isCurrent = i === currentStepIndex
              return (
                <div key={step.status} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 1.4, repeat: isCurrent ? Infinity : 0 }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        done ? 'bg-saffron text-paper' : 'bg-white/5 text-stone-light'
                      }`}
                    >
                      <step.icon size={16} />
                    </motion.div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 ${i < currentStepIndex ? 'bg-saffron' : 'bg-stone-light/40'}`} />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className={`text-sm font-medium ${done ? 'text-paper' : 'text-stone-light'}`}>{step.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-sm font-medium mb-1">تفاصيل الطلب</p>
          <p className="text-xs text-stone-light leading-relaxed mb-3">{status.items_summary}</p>
          <div className="flex justify-between text-sm font-display font-semibold border-t border-saffron/30 pt-3">
            <span>الإجمالي</span>
            <span>{status.total} ج.م</span>
          </div>
        </div>

        {showLoyalty && (
          <div className="rounded-2xl bg-saffron/10 border border-saffron/20 p-4 mt-4">
            <div className="flex items-center gap-2 text-saffron mb-2">
              <Gift size={18} />
              <p className="font-semibold text-sm">نقاط الولاء</p>
            </div>
            {earned > 0 && <div className="flex justify-between text-sm py-1"><span className="text-stone-light">نقاط مكتسبة</span><strong>+{earned.toLocaleString('ar-EG')}</strong></div>}
            {redeemed > 0 && <div className="flex justify-between text-sm py-1"><span className="text-stone-light">نقاط مستخدمة</span><strong>-{redeemed.toLocaleString('ar-EG')}</strong></div>}
            {balance != null && <div className="flex justify-between text-sm pt-2 mt-1 border-t border-saffron/20"><span>رصيدك الحالي</span><strong className="text-saffron">{balance.toLocaleString('ar-EG')} نقطة</strong></div>}
          </div>
        )}

        {slug && (
          <Link
            to={`${import.meta.env.BASE_URL}m/${slug}`}
            className="block text-center text-sm text-saffron-dim mt-6 hover:underline"
          >
            رجّعني للمنيو
          </Link>
        )}
      </div>
    </div>
  )
}
