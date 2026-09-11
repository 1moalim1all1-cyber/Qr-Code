import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, QrCode, Eye, UtensilsCrossed, Building2, Settings, ClipboardList, Gift, CalendarClock, MessageCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/auth'
import { getRestaurantByOwner } from '@/services/restaurants'
import type { Restaurant } from '@/types/database'

const SUPPORT_WHATSAPP = '201006923454'

const statCards = [
  { icon: Eye, label: 'عدد الزيارات', value: '—' },
  { icon: QrCode, label: 'مرات مسح QR', value: '—' },
  { icon: UtensilsCrossed, label: 'عدد الأصناف', value: '—' },
  { icon: Building2, label: 'عدد الفروع', value: '—' },
]

function daysLeft(end?: string | null) {
  if (!end) return null
  const diff = new Date(`${end}T23:59:59`).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      getRestaurantByOwner(user.uid)
        .then(setRestaurant)
        .catch((err) => setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني'))
    }
  }, [user])

  const subscriptionEnd = profile?.subscription_end || restaurant?.subscription_end || null
  const remaining = daysLeft(subscriptionEnd)
  const renewalUrl = useMemo(() => {
    const business = restaurant?.name || profile?.requested_business_name || 'النشاط'
    const msg = `السلام عليكم، أنا ${profile?.full_name || 'عميل'} وعايز أجدد اشتراك ${business}${subscriptionEnd ? `، تاريخ الانتهاء ${subscriptionEnd}` : ''}.`
    return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`
  }, [profile, restaurant, subscriptionEnd])

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone">أهلاً بيك، {profile?.full_name ?? '...'}</p>
            <h1 className="font-display text-lg font-semibold">{restaurant?.name ?? (error ? 'حصل خطأ' : 'جارِ تحميل بيانات المطعم...')}</h1>
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-stone hover:text-sumac transition-colors"><LogOut size={16} /> تسجيل الخروج</button>
        </div>
      </header>

      {error && <div className="max-w-6xl mx-auto px-6 pt-4"><div className="rounded-xl bg-sumac/10 text-sumac text-sm px-4 py-3">{error}</div></div>}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {restaurant?.status === 'pending' && <div className="mb-6 rounded-xl bg-saffron/10 border border-saffron/30 px-4 py-3 text-sm text-saffron-dim">حسابك قيد المراجعة من فريق المنصة — هيتفعل قريب وتقدر تستقبل زوار على منيوك.</div>}

        {subscriptionEnd && remaining !== null && (
          <div className={`mb-6 rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${remaining < 0 ? 'bg-sumac/10 border-sumac/30' : remaining <= 7 ? 'bg-saffron/10 border-saffron/30' : 'bg-zaytoon/10 border-zaytoon/20'}`}>
            <div>
              <p className="font-semibold flex items-center gap-2"><CalendarClock size={18} /> ميعاد تجديد الاشتراك</p>
              <p className="text-sm text-stone mt-1">تاريخ الانتهاء: {subscriptionEnd} — {remaining < 0 ? `الاشتراك منتهي من ${Math.abs(remaining)} يوم` : remaining === 0 ? 'ينتهي اليوم' : `متبقي ${remaining} يوم`}</p>
            </div>
            {remaining <= 7 && <a href={renewalUrl} target="_blank" rel="noreferrer" className="rounded-full bg-zaytoon text-paper px-5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"><MessageCircle size={17} /> اطلب التجديد</a>}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => <div key={s.label} className="rounded-2xl bg-paper p-5 border border-stone-light/30"><s.icon className="text-zaytoon mb-3" size={22} /><p className="text-2xl font-display font-semibold">{s.value}</p><p className="text-sm text-stone mt-1">{s.label}</p></div>)}
        </div>

        <div className="rounded-2xl bg-paper p-6 border border-stone-light/30 mb-4">
          <h2 className="font-display text-lg font-semibold mb-4">جهّز منيوك بالكامل</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className={restaurant?.logo_url ? 'text-zaytoon' : 'text-stone'} /> أضف اللوجو والغلاف</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-stone" /> أضف الأقسام والأصناف</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-stone" /> جهّز العروض</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-stone" /> حمّل QR وشاركه</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Link to="/dashboard/orders" className="block rounded-2xl bg-sumac text-paper p-6 hover:opacity-90 transition-opacity"><p className="font-display font-semibold flex items-center gap-2"><ClipboardList size={18} className="text-saffron" /> الطلبات</p><p className="text-paper/80 text-sm mt-1">تابع طلبات العملاء الحية وحدّث حالتها</p></Link>
          <Link to="/dashboard/settings" className="block rounded-2xl bg-paper border border-stone-light/30 p-6 hover:border-saffron/40 transition-colors"><p className="font-display font-semibold flex items-center gap-2"><Settings size={18} className="text-saffron-dim" /> بيانات المطعم</p><p className="text-stone text-sm mt-1">اللوجو، الغلاف، أرقام التواصل والعنوان</p></Link>
          <Link to="/dashboard/menu" className="block rounded-2xl bg-ink text-paper p-6 hover:bg-ink-soft transition-colors"><p className="font-display font-semibold flex items-center gap-2"><UtensilsCrossed size={18} className="text-saffron" /> إدارة الأقسام والأصناف</p><p className="text-stone-light text-sm mt-1">أضف أقسام مطعمك وأصنافه وابدأ ببناء المنيو</p></Link>
          <Link to="/dashboard/qr" className="block rounded-2xl bg-zaytoon text-paper p-6 hover:bg-zaytoon-dim transition-colors"><p className="font-display font-semibold flex items-center gap-2"><QrCode size={18} className="text-saffron" /> كود QR الخاص بالمنيو</p><p className="text-paper/80 text-sm mt-1">خصّص الشكل واللون وحمّله جاهز للطباعة</p></Link>
          <Link to="/dashboard/offers" className="block rounded-2xl bg-paper border border-stone-light/30 p-6 hover:border-saffron/40 transition-colors"><p className="font-display font-semibold flex items-center gap-2"><Gift size={18} className="text-saffron-dim" /> العروض والكوبونات</p><p className="text-stone text-sm mt-1">أنشئ عروض وأكواد خصم لعملائك</p></Link>
        </div>
      </main>
    </div>
  )
}
