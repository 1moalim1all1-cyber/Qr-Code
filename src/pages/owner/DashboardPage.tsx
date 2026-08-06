import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, QrCode, Eye, UtensilsCrossed, Building2, Settings, ClipboardList } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/auth'
import { getRestaurantByOwner } from '@/services/restaurants'
import type { Restaurant } from '@/types/database'

const statCards = [
  { icon: Eye, label: 'عدد الزيارات', value: '—' },
  { icon: QrCode, label: 'مرات مسح QR', value: '—' },
  { icon: UtensilsCrossed, label: 'عدد الأصناف', value: '—' },
  { icon: Building2, label: 'عدد الفروع', value: '—' },
]

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

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone">أهلاً بيك، {profile?.full_name ?? '...'}</p>
            <h1 className="font-display text-lg font-semibold">
              {restaurant?.name ?? (error ? 'حصل خطأ' : 'جارِ تحميل بيانات المطعم...')}
            </h1>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-sm text-stone hover:text-sumac transition-colors"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="rounded-xl bg-sumac/10 text-sumac text-sm px-4 py-3">{error}</div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {restaurant?.status === 'pending' && (
          <div className="mb-6 rounded-xl bg-saffron/10 border border-saffron/30 px-4 py-3 text-sm text-saffron-dim">
            حسابك قيد المراجعة من فريق المنصة — هيتفعل قريب وتقدر تستقبل زوار على منيوك.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-2xl bg-paper p-5 border border-stone-light/30">
              <s.icon className="text-zaytoon mb-3" size={22} />
              <p className="text-2xl font-display font-semibold">{s.value}</p>
              <p className="text-sm text-stone mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-paper p-8 border border-stone-light/30 text-center text-stone">
          هنا هتلاقي قريب: الفروع، مولّد QR، والعروض.
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Link
            to="/dashboard/orders"
            className="block rounded-2xl bg-sumac text-paper p-6 hover:opacity-90 transition-opacity"
          >
            <p className="font-display font-semibold flex items-center gap-2">
              <ClipboardList size={18} className="text-saffron" />
              الطلبات
            </p>
            <p className="text-paper/80 text-sm mt-1">تابع طلبات العملاء الحية وحدّث حالتها</p>
          </Link>

          <Link
            to="/dashboard/settings"
            className="block rounded-2xl bg-paper border border-stone-light/30 p-6 hover:border-saffron/40 transition-colors"
          >
            <p className="font-display font-semibold flex items-center gap-2">
              <Settings size={18} className="text-saffron-dim" />
              بيانات المطعم
            </p>
            <p className="text-stone text-sm mt-1">اللوجو، الغلاف، أرقام التواصل والعنوان</p>
          </Link>

          <Link
            to="/dashboard/menu"
            className="block rounded-2xl bg-ink text-paper p-6 hover:bg-ink-soft transition-colors"
          >
            <p className="font-display font-semibold flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-saffron" />
              إدارة الأقسام والأصناف
            </p>
            <p className="text-stone-light text-sm mt-1">أضف أقسام مطعمك وأصنافه وابدأ ببناء المنيو</p>
          </Link>

          <Link
            to="/dashboard/qr"
            className="block rounded-2xl bg-zaytoon text-paper p-6 hover:bg-zaytoon-dim transition-colors"
          >
            <p className="font-display font-semibold flex items-center gap-2">
              <QrCode size={18} className="text-saffron" />
              كود QR الخاص بالمنيو
            </p>
            <p className="text-paper/80 text-sm mt-1">خصّص الشكل واللون وحمّله جاهز للطباعة</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
