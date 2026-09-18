import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, QrCode, Eye, UtensilsCrossed, Building2, Settings, ClipboardList, Gift, CalendarClock, MessageCircle, CheckCircle2, Cuboid, PackagePlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/auth'
import { getRestaurantByOwner } from '@/services/restaurants'
import type { Restaurant } from '@/types/database'

const SUPPORT_WHATSAPP = '201039177959'

const statCards = [
  { icon: Eye, label: 'عدد الزيارات', value: '—' },
  { icon: QrCode, label: 'مرات مسح QR', value: '—' },
  { icon: UtensilsCrossed, label: 'عدد الأصناف', value: '—' },
  { icon: Building2, label: 'عدد الفروع', value: '—' },
]

function getCountdown(end?: string | null) {
  if (!end) return null
  const target = new Date(end).getTime()
  if (Number.isNaN(target)) return null
  const now = Date.now()
  const diff = Math.max(0, target - now)
  return {
    expired: target <= now,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [error, setError] = useState<string | null>(null)
  const subscriptionEnd = profile?.subscription_end || restaurant?.subscription_end || null
  const [countdown, setCountdown] = useState(() => getCountdown(subscriptionEnd))

  useEffect(() => {
    if (user) {
      getRestaurantByOwner(user.uid)
        .then(setRestaurant)
        .catch((err) => setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني'))
    }
  }, [user])

  useEffect(() => {
    setCountdown(getCountdown(subscriptionEnd))
    if (!subscriptionEnd) return
    const timer = window.setInterval(() => setCountdown(getCountdown(subscriptionEnd)), 1000)
    return () => window.clearInterval(timer)
  }, [subscriptionEnd])

  const renewalUrl = useMemo(() => {
    const business = restaurant?.name || profile?.requested_business_name || 'النشاط'
    const msg = `السلام عليكم، أنا ${profile?.full_name || 'عميل'} وعايز أجدد اشتراك ${business}${subscriptionEnd ? `، الاشتراك الحالي ينتهي ${new Date(subscriptionEnd).toLocaleString('ar-EG')}` : ''}.`
    return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`
  }, [profile, restaurant, subscriptionEnd])

  const isTrial = Number(profile?.trial_days || restaurant?.trial_days || 0) > 0 && !profile?.last_renewed_at && !restaurant?.last_renewed_at
  const hasReadyCatalog = restaurant?.business_type === 'supermarket' || restaurant?.business_type === 'cosmetics'

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone">أهلاً بيك، {profile?.full_name ?? '...'}</p>
            <h1 className="font-display text-lg font-semibold">{restaurant?.name ?? (error ? 'حصل خطأ' : 'جارِ تحميل بيانات النشاط...')}</h1>
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-stone hover:text-sumac transition-colors"><LogOut size={16} /> تسجيل الخروج</button>
        </div>
      </header>

      {error && <div className="max-w-6xl mx-auto px-6 pt-4"><div className="rounded-xl bg-sumac/10 text-sumac text-sm px-4 py-3">{error}</div></div>}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {countdown && (
          <div className={`mb-6 rounded-3xl border p-5 ${countdown.expired ? 'bg-sumac/10 border-sumac/30' : isTrial ? 'bg-saffron/10 border-saffron/30' : 'bg-zaytoon/10 border-zaytoon/20'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <p className="font-semibold flex items-center gap-2"><CalendarClock size={18} /> {isTrial ? 'الفترة التجريبية المجانية — 10 أيام' : 'مدة الاشتراك'}</p>
                <p className="text-sm text-stone mt-1">{countdown.expired ? 'انتهت المدة الحالية — جدّد الاشتراك لاستمرار الخدمة.' : `ينتهي في ${new Date(subscriptionEnd!).toLocaleString('ar-EG')}`}</p>
              </div>
              {!countdown.expired && (
                <div className="grid grid-cols-4 gap-2 min-w-[280px]" dir="ltr">
                  <CountdownBox value={countdown.days} label="يوم" />
                  <CountdownBox value={countdown.hours} label="ساعة" />
                  <CountdownBox value={countdown.minutes} label="دقيقة" />
                  <CountdownBox value={countdown.seconds} label="ثانية" />
                </div>
              )}
              {(countdown.expired || countdown.days <= 7) && <a href={renewalUrl} target="_blank" rel="noreferrer" className="rounded-full bg-zaytoon text-paper px-5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"><MessageCircle size={17} /> اطلب التجديد</a>}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => <div key={s.label} className="rounded-2xl bg-paper p-5 border border-stone-light/30"><s.icon className="text-zaytoon mb-3" size={22} /><p className="text-2xl font-display font-semibold">{s.value}</p><p className="text-sm text-stone mt-1">{s.label}</p></div>)}
        </div>

        <div className="rounded-2xl bg-paper p-6 border border-stone-light/30 mb-4">
          <h2 className="font-display text-lg font-semibold mb-4">جهّز نشاطك بالكامل</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className={restaurant?.logo_url ? 'text-zaytoon' : 'text-stone'} /> أضف اللوجو والغلاف</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-stone" /> أضف الأقسام والمنتجات</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-stone" /> جهّز العروض</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-stone" /> حمّل QR وشاركه</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Link to="/dashboard/design" className="block rounded-2xl bg-gradient-to-br from-ink to-ink-soft text-paper p-6 shadow-xl hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><Cuboid size={18} className="text-saffron" /> شكل الصفحة 3D والقوالب</p><p className="text-stone-light text-sm mt-1">اختار من 4 أشكال وغيّرهم في أي وقت</p></Link>
          {hasReadyCatalog && <Link to="/dashboard/catalog" className="block rounded-2xl bg-saffron/15 border border-saffron/30 p-6 hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><PackagePlus size={18} className="text-saffron-dim" /> كتالوج المنتجات الجاهز</p><p className="text-stone text-sm mt-1">اختار منتجاتك وحط السعر بدل ما تبدأ من الصفر</p></Link>}
          <Link to="/dashboard/orders" className="block rounded-2xl bg-sumac text-paper p-6 hover:opacity-90 transition-opacity"><p className="font-display font-semibold flex items-center gap-2"><ClipboardList size={18} className="text-saffron" /> الطلبات</p><p className="text-paper/80 text-sm mt-1">تابع طلبات العملاء الحية وحدّث حالتها</p></Link>
          <Link to="/dashboard/settings" className="block rounded-2xl bg-paper border border-stone-light/30 p-6 hover:border-saffron/40 transition-colors"><p className="font-display font-semibold flex items-center gap-2"><Settings size={18} className="text-saffron-dim" /> بيانات النشاط</p><p className="text-stone text-sm mt-1">اللوجو، الغلاف، أرقام التواصل والعنوان</p></Link>
          <Link to="/dashboard/menu" className="block rounded-2xl bg-ink text-paper p-6 hover:bg-ink-soft transition-colors"><p className="font-display font-semibold flex items-center gap-2"><UtensilsCrossed size={18} className="text-saffron" /> إدارة الأقسام والمنتجات</p><p className="text-stone-light text-sm mt-1">أضف أقسامك ومنتجاتك وعدّل الأسعار</p></Link>
          <Link to="/dashboard/qr" className="block rounded-2xl bg-zaytoon text-paper p-6 hover:bg-zaytoon-dim transition-colors"><p className="font-display font-semibold flex items-center gap-2"><QrCode size={18} className="text-saffron" /> كود QR الخاص بالصفحة</p><p className="text-paper/80 text-sm mt-1">خصّص الشكل واللون وحمّله جاهز للطباعة</p></Link>
          <Link to="/dashboard/offers" className="block rounded-2xl bg-paper border border-stone-light/30 p-6 hover:border-saffron/40 transition-colors"><p className="font-display font-semibold flex items-center gap-2"><Gift size={18} className="text-saffron-dim" /> العروض والكوبونات</p><p className="text-stone text-sm mt-1">أنشئ عروض وأكواد خصم لعملائك</p></Link>
        </div>
      </main>
    </div>
  )
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-ink text-paper px-3 py-3 text-center">
      <div className="font-display text-2xl font-bold tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="text-[11px] text-stone-light mt-1">{label}</div>
    </div>
  )
}
