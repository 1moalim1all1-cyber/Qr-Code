import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Store, CheckCircle2, Clock, Ban, Eye, ExternalLink, Plus, UtensilsCrossed, QrCode, Wallet, ClipboardList } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/auth'
import { listAllRestaurants, setRestaurantStatus, getPlatformStats } from '@/services/admin'
import { setPaymentStatus } from '@/services/restaurants'
import type { Restaurant, RestaurantStatus } from '@/types/database'

const STATUS_LABEL: Record<RestaurantStatus, string> = {
  active: 'مفعّل',
  pending: 'قيد المراجعة',
  suspended: 'موقوف',
}

const STATUS_STYLE: Record<RestaurantStatus, string> = {
  active: 'bg-zaytoon/15 text-zaytoon',
  pending: 'bg-saffron/15 text-saffron-dim',
  suspended: 'bg-sumac/15 text-sumac',
}

export default function AdminDashboardPage() {
  const { profile } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [stats, setStats] = useState({ totalRestaurants: 0, active: 0, pending: 0, suspended: 0, totalVisitsSample: 0 })
  const [filter, setFilter] = useState<'all' | RestaurantStatus>('all')
  const [loading, setLoading] = useState(true)

  async function load() {
    const [list, s] = await Promise.all([listAllRestaurants(), getPlatformStats()])
    setRestaurants(list)
    setStats(s)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleStatusChange(id: string, status: RestaurantStatus) {
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    await setRestaurantStatus(id, status)
  }

  async function handleTogglePayment(r: Restaurant) {
    const next = r.payment_status === 'paid' ? 'unpaid' : 'paid'
    setRestaurants((prev) => prev.map((x) => (x.id === r.id ? { ...x, payment_status: next } : x)))
    await setPaymentStatus(r.id, next, r.amount_paid ?? 0, r.payment_note)
  }

  const visible = filter === 'all' ? restaurants : restaurants.filter((r) => r.status === filter)

  const statCards = [
    { icon: Store, label: 'إجمالي المطاعم', value: stats.totalRestaurants },
    { icon: CheckCircle2, label: 'مفعّلة', value: stats.active },
    { icon: Clock, label: 'قيد المراجعة', value: stats.pending },
    { icon: Ban, label: 'موقوفة', value: stats.suspended },
  ]

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-light">لوحة السوبر أدمن</p>
            <h1 className="font-display text-lg font-semibold">أهلاً، {profile?.full_name ?? '...'}</h1>
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-stone-light hover:text-paper transition-colors">
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Link
          to="/admin/clients/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-saffron text-ink font-semibold py-4 mb-6 hover:bg-saffron-dim transition-colors"
        >
          <Plus size={18} />
          إنشاء QR جديد لعميل
        </Link>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-2xl bg-paper p-5 border border-stone-light/30">
              <s.icon className="text-saffron-dim mb-3" size={22} />
              <p className="text-2xl font-display font-semibold">{s.value}</p>
              <p className="text-sm text-stone mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          {(['all', 'pending', 'active', 'suspended'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f ? 'bg-ink text-paper' : 'bg-paper text-ink border border-stone-light/30 hover:bg-paper-dim'
              }`}
            >
              {f === 'all' ? 'الكل' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-paper border border-stone-light/30 overflow-hidden">
          {loading ? (
            <p className="text-center text-stone py-10">جارِ التحميل...</p>
          ) : visible.length === 0 ? (
            <p className="text-center text-stone py-10">مفيش مطاعم في القسم ده.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-stone border-b border-stone-light/30">
                  <th className="px-4 py-3 font-medium">المطعم</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                  <th className="px-4 py-3 font-medium">الدفع</th>
                  <th className="px-4 py-3 font-medium">المنيو</th>
                  <th className="px-4 py-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-b border-stone-light/20 last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {r.name}
                      {r.managed_by_admin && (
                        <span className="block text-xs font-normal text-stone mt-0.5">
                          {r.client_name || 'عميل بدون اسم'} {r.client_contact ? `· ${r.client_contact}` : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.managed_by_admin ? (
                        <button
                          onClick={() => handleTogglePayment(r)}
                          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            r.payment_status === 'paid' ? 'bg-zaytoon/15 text-zaytoon' : 'bg-sumac/15 text-sumac'
                          }`}
                        >
                          <Wallet size={12} />
                          {r.payment_status === 'paid' ? `مدفوع${r.amount_paid ? ` (${r.amount_paid} ج.م)` : ''}` : 'غير مدفوع'}
                        </button>
                      ) : (
                        <span className="text-stone-light text-xs">حساب صاحب مطعم</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`${import.meta.env.BASE_URL}m/${r.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-saffron-dim hover:underline"
                      >
                        <Eye size={13} /> عرض <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          to={`/admin/clients/${r.id}/menu`}
                          className="flex items-center gap-1 text-xs rounded-full bg-paper-dim px-3 py-1.5 hover:bg-stone-light/30 transition-colors"
                        >
                          <UtensilsCrossed size={12} /> المنيو
                        </Link>
                        <Link
                          to={`/admin/clients/${r.id}/qr`}
                          className="flex items-center gap-1 text-xs rounded-full bg-paper-dim px-3 py-1.5 hover:bg-stone-light/30 transition-colors"
                        >
                          <QrCode size={12} /> QR
                        </Link>
                        <Link
                          to={`/admin/clients/${r.id}/orders`}
                          className="flex items-center gap-1 text-xs rounded-full bg-paper-dim px-3 py-1.5 hover:bg-stone-light/30 transition-colors"
                        >
                          <ClipboardList size={12} /> الطلبات
                        </Link>
                        {r.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(r.id, 'active')}
                            className="text-xs rounded-full bg-zaytoon/15 text-zaytoon px-3 py-1.5 hover:bg-zaytoon/25 transition-colors"
                          >
                            تفعيل
                          </button>
                        )}
                        {r.status !== 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(r.id, 'suspended')}
                            className="text-xs rounded-full bg-sumac/15 text-sumac px-3 py-1.5 hover:bg-sumac/25 transition-colors"
                          >
                            إيقاف
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
