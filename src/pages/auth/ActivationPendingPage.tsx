import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, LogOut, MessageCircle, ShieldCheck, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/auth'
import { getRestaurantByOwner } from '@/services/restaurants'
import type { AccountStatus, Restaurant } from '@/types/database'

const ACTIVATION_WHATSAPP = '201039177959'

function inferStatus(profileStatus: AccountStatus | undefined, restaurant: Restaurant | null): AccountStatus {
  if (profileStatus) return profileStatus
  if (restaurant?.status === 'active') return 'active'
  if (restaurant?.status === 'suspended') return 'suspended'
  if (restaurant?.status === 'rejected') return 'rejected'
  return 'pending'
}

export default function ActivationPendingPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshStatus() {
    if (!user) return
    setLoading(true)
    try {
      await refreshProfile()
      const r = await getRestaurantByOwner(user.uid).catch(() => null)
      setRestaurant(r)
      if (inferStatus(profile?.account_status, r) === 'active' && r?.status === 'active') {
        navigate('/dashboard', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    getRestaurantByOwner(user.uid)
      .then((r) => {
        setRestaurant(r)
        if (inferStatus(profile?.account_status, r) === 'active' && r?.status === 'active') {
          navigate('/dashboard', { replace: true })
        }
      })
      .catch(() => setRestaurant(null))
      .finally(() => setLoading(false))
  }, [user, profile?.account_status, navigate])

  const whatsappUrl = useMemo(() => {
    const name = profile?.full_name || restaurant?.client_name || 'عميل جديد'
    const restaurantName = profile?.requested_business_name || restaurant?.name || 'النشاط'
    const phone = profile?.phone || restaurant?.client_contact || ''
    const message = [
      'السلام عليكم،',
      `أنا ${name} وسجلت حساب للنشاط: ${restaurantName}.`,
      phone ? `رقم الحساب: ${phone}.` : '',
      'عايز أفعّل الحساب، وبرجاء إرسال تفاصيل دفع الرسوم المطلوبة.',
    ].filter(Boolean).join('\n')
    return `https://wa.me/${ACTIVATION_WHATSAPP}?text=${encodeURIComponent(message)}`
  }, [profile, restaurant])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-paper text-stone">جارِ التحقق من حالة الحساب...</div>
  }

  const status = inferStatus(profile?.account_status, restaurant)
  const rejected = status === 'rejected'
  const suspended = status === 'suspended'

  return (
    <div className="min-h-screen bg-paper-dim px-5 py-10 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl bg-paper border border-stone-light/30 p-7 sm:p-9 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-saffron/15 flex items-center justify-center mb-5">
          {rejected ? <XCircle className="text-sumac" size={30} /> : suspended ? <ShieldCheck className="text-sumac" size={30} /> : <Clock3 className="text-saffron-dim" size={30} />}
        </div>

        <h1 className="font-display text-2xl font-semibold text-center">
          {rejected ? 'تم رفض طلب التسجيل' : suspended ? 'الحساب موقوف حاليًا' : 'حسابك في انتظار التفعيل'}
        </h1>
        <p className="text-stone text-center mt-3 leading-7">
          {rejected
            ? (profile?.rejection_reason || 'تواصل مع الإدارة لمعرفة سبب الرفض.')
            : suspended
              ? 'تواصل مع الإدارة لمعرفة سبب الإيقاف وإعادة تفعيل الحساب.'
              : 'تم تسجيل طلبك بنجاح. أرسل رسالة للإدارة على واتساب واستكمل دفع الرسوم، وبعد المراجعة سيتم تفعيل الحساب.'}
        </p>

        {!rejected && !suspended && (
          <div className="mt-6 rounded-2xl bg-paper-dim p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-zaytoon" /> تم تسجيل طلبك</div>
            <div className="flex items-center gap-2"><MessageCircle size={17} className="text-saffron-dim" /> أرسل رسالة التفعيل على 01039177959</div>
            <div className="flex items-center gap-2"><ShieldCheck size={17} className="text-stone" /> الإدارة تراجع الدفع وتقبل الحساب</div>
          </div>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full rounded-full px-6 py-3.5 font-semibold bg-zaytoon text-paper flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <MessageCircle size={19} />
          التواصل مع الإدارة على واتساب
        </a>

        <button
          onClick={refreshStatus}
          className="mt-3 w-full rounded-full px-6 py-3 font-semibold border border-stone-light/40 hover:bg-paper-dim"
        >
          تحديث حالة الحساب
        </button>

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
