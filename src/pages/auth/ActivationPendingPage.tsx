import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, LogOut, MessageCircle, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/auth'
import { getRestaurantByOwner } from '@/services/restaurants'
import type { Restaurant } from '@/types/database'

const ACTIVATION_WHATSAPP = '201006923454'

export default function ActivationPendingPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getRestaurantByOwner(user.uid)
      .then((r) => {
        setRestaurant(r)
        if (r?.status === 'active') navigate('/dashboard', { replace: true })
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  const whatsappUrl = useMemo(() => {
    const name = profile?.full_name || restaurant?.client_name || 'عميل جديد'
    const restaurantName = restaurant?.name || 'المطعم'
    const phone = profile?.phone || restaurant?.client_contact || ''
    const message = [
      'السلام عليكم،',
      `أنا ${name} وسجلت حساب للمطعم/الكافيه: ${restaurantName}.`,
      phone ? `رقم الحساب: ${phone}.` : '',
      'عايز أفعّل الحساب، وبرجاء إرسال تفاصيل دفع الرسوم المطلوبة.',
    ].filter(Boolean).join('\n')
    return `https://wa.me/${ACTIVATION_WHATSAPP}?text=${encodeURIComponent(message)}`
  }, [profile, restaurant])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-paper text-stone">جارِ التحقق من حالة الحساب...</div>
  }

  const suspended = restaurant?.status === 'suspended'

  return (
    <div className="min-h-screen bg-paper-dim px-5 py-10 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl bg-paper border border-stone-light/30 p-7 sm:p-9 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-saffron/15 flex items-center justify-center mb-5">
          {suspended ? <ShieldCheck className="text-sumac" size={30} /> : <Clock3 className="text-saffron-dim" size={30} />}
        </div>

        <h1 className="font-display text-2xl font-semibold text-center">
          {suspended ? 'الحساب موقوف حاليًا' : 'حسابك في انتظار التفعيل'}
        </h1>
        <p className="text-stone text-center mt-3 leading-7">
          {suspended
            ? 'تواصل مع الإدارة لمعرفة سبب الإيقاف وإعادة تفعيل الحساب.'
            : 'تم إنشاء حسابك بنجاح. لتفعيل لوحة التحكم ونشر المنيو، أرسل طلب التفعيل للإدارة على واتساب ثم استكمل دفع الرسوم.'}
        </p>

        <div className="mt-6 rounded-2xl bg-paper-dim p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-zaytoon" /> تم إنشاء الحساب</div>
          <div className="flex items-center gap-2"><MessageCircle size={17} className="text-saffron-dim" /> أرسل رسالة التفعيل على 01006923454</div>
          <div className="flex items-center gap-2"><ShieldCheck size={17} className="text-stone" /> الإدارة تراجع الدفع وتفعّل الحساب</div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full rounded-full px-6 py-3.5 font-semibold bg-zaytoon text-paper flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <MessageCircle size={19} />
          إرسال طلب التفعيل على واتساب
        </a>

        <p className="text-xs text-stone text-center mt-3">الرسالة مكتوبة تلقائيًا ببيانات حسابك.</p>

        <button
          onClick={() => signOut()}
          className="mt-6 mx-auto flex items-center gap-2 text-sm text-stone hover:text-ink transition-colors"
        >
          <LogOut size={15} /> تسجيل الخروج
        </button>
      </div>
    </div>
  )
}
