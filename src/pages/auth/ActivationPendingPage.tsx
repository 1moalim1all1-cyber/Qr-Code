import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, LogOut, MessageCircle, ShieldCheck, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentUserProfile, signOut } from '@/services/auth'
import { getRestaurantByOwner } from '@/services/restaurants'
import type { AccountStatus, AppUser, Restaurant } from '@/types/database'

const ACTIVATION_WHATSAPP = '201039177959'

function inferStatus(profileStatus: AccountStatus | undefined, restaurant: Restaurant | null): AccountStatus {
  if (profileStatus) return profileStatus
  if (restaurant?.status === 'active') return 'active'
  if (restaurant?.status === 'suspended') return 'suspended'
  if (restaurant?.status === 'rejected') return 'rejected'
  return 'pending'
}

function subscriptionExpired(profile: AppUser | null, restaurant: Restaurant | null) {
  const end = profile?.subscription_end || restaurant?.subscription_end
  if (!end) return false
  const time = new Date(end).getTime()
  return Number.isFinite(time) && time <= Date.now()
}

export default function ActivationPendingPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [freshProfile, setFreshProfile] = useState<AppUser | null>((profile as AppUser | null) ?? null)
  const [loading, setLoading] = useState(true)

  async function refreshStatus() {
    if (!user) return
    setLoading(true)
    try {
      await refreshProfile()
      const [r, p] = await Promise.all([
        getRestaurantByOwner(user.uid).catch(() => null),
        getCurrentUserProfile(user.uid).catch(() => null),
      ])
      setRestaurant(r)
      setFreshProfile((p as AppUser | null) ?? null)
      if (p && inferStatus((p as AppUser).account_status, r) === 'active' && r?.status === 'active' && !subscriptionExpired(p as AppUser, r)) {
        navigate('/dashboard', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    Promise.all([
      getRestaurantByOwner(user.uid).catch(() => null),
      getCurrentUserProfile(user.uid).catch(() => null),
    ])
      .then(([r, p]) => {
        setRestaurant(r)
        setFreshProfile((p as AppUser | null) ?? null)
        if (p && inferStatus((p as AppUser).account_status, r) === 'active' && r?.status === 'active' && !subscriptionExpired(p as AppUser, r)) {
          navigate('/dashboard', { replace: true })
        }
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  const currentProfile = freshProfile || (profile as AppUser | null)
  const expired = subscriptionExpired(currentProfile, restaurant)

  const whatsappUrl = useMemo(() => {
    const name = currentProfile?.full_name || restaurant?.client_name || 'عميل جديد'
    const restaurantName = currentProfile?.requested_business_name || restaurant?.name || 'النشاط'
    const phone = currentProfile?.phone || restaurant?.client_contact || ''
    const message = [
      'السلام عليكم،',
      `أنا ${name} وصاحب النشاط: ${restaurantName}.`,
      phone ? `رقم الحساب: ${phone}.` : '',
      expired
        ? 'الفترة التجريبية/الاشتراك انتهى وعايز أجدد الخدمة. برجاء إرسال تفاصيل التجديد والدفع.'
        : 'عايز أفعّل الحساب، وبرجاء إرسال تفاصيل الدفع المطلوبة.',
    ].filter(Boolean).join('\n')
    return `https://wa.me/${ACTIVATION_WHATSAPP}?text=${encodeURIComponent(message)}`
  }, [currentProfile, restaurant, expired])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-paper text-stone">جارِ التحقق من حالة الحساب...</div>
  }

  const status = inferStatus(currentProfile?.account_status, restaurant)
  const rejected = status === 'rejected'
  const suspended = status === 'suspended'

  return (
    <div className="min-h-screen bg-paper-dim px-5 py-10 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl bg-paper border border-stone-light/30 p-7 sm:p-9 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-saffron/15 flex items-center justify-center mb-5">
          {rejected || expired ? <XCircle className="text-sumac" size={30} /> : suspended ? <ShieldCheck className="text-sumac" size={30} /> : <Clock3 className="text-saffron-dim" size={30} />}
        </div>

        <h1 className="font-display text-2xl font-semibold text-center">
          {expired ? 'انتهت المدة المجانية أو الاشتراك' : rejected ? 'تم رفض طلب التسجيل' : suspended ? 'الحساب موقوف حاليًا' : 'حسابك في انتظار التفعيل'}
        </h1>
        <p className="text-stone text-center mt-3 leading-7">
          {expired
            ? 'كانت عندك فترة تجريبية مجانية لمدة 10 أيام. للتكملة، جدّد حسابك بعدد الأيام المناسب ليك.'
            : rejected
              ? (currentProfile?.rejection_reason || 'تواصل مع الإدارة لمعرفة سبب الرفض.')
              : suspended
                ? 'تواصل مع الإدارة لمعرفة سبب الإيقاف وإعادة تفعيل الحساب.'
                : 'تواصل مع الإدارة على واتساب لاستكمال التفعيل.'}
        </p>

        {expired && (
          <div className="mt-6 rounded-2xl bg-sumac/10 border border-sumac/20 p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-zaytoon" /> حصلت على 10 أيام تجربة مجانية كاملة</div>
            <div className="flex items-center gap-2"><MessageCircle size={17} className="text-saffron-dim" /> التجديد متاح بأي عدد أيام تحدده الإدارة</div>
          </div>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full rounded-full px-6 py-3.5 font-semibold bg-zaytoon text-paper flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <MessageCircle size={19} />
          {expired ? 'تجديد الاشتراك على واتساب' : 'التواصل مع الإدارة على واتساب'}
        </a>

        <button onClick={refreshStatus} className="mt-3 w-full rounded-full px-6 py-3 font-semibold border border-stone-light/40 hover:bg-paper-dim">تحديث حالة الحساب</button>

        <button onClick={() => signOut()} className="mt-6 mx-auto flex items-center gap-2 text-sm text-stone hover:text-ink transition-colors"><LogOut size={15} /> تسجيل الخروج</button>
      </div>
    </div>
  )
}
