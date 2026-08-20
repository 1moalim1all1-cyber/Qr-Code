import { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Clock, ChefHat, CheckCircle2, XCircle, Phone, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurantByOwner, getRestaurantById } from '@/services/restaurants'
import { subscribeToOrders, updateOrderStatus } from '@/services/orders'
import { playNewOrderChime } from '@/lib/notifySound'
import type { Order, OrderStatus, Restaurant } from '@/types/database'

const STATUS_FLOW: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed']

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'جديد',
  preparing: 'بيتحضّر',
  ready: 'جاهز',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-saffron/15 text-saffron-dim',
  preparing: 'bg-zaytoon/15 text-zaytoon',
  ready: 'bg-sumac/15 text-sumac',
  completed: 'bg-stone-light/30 text-stone',
  cancelled: 'bg-sumac/10 text-sumac',
}

const ORDER_TYPE_LABEL: Record<Order['order_type'], string> = {
  dine_in: 'داخل المطعم',
  pickup: 'استلام',
  delivery: 'دليفري',
  whatsapp: 'واتساب',
}

interface OrdersPageProps {
  restaurantIdOverride?: string
  backTo?: string
}

export default function OrdersPage({ restaurantIdOverride, backTo = '/dashboard' }: OrdersPageProps) {
  const { user } = useAuth()
  const params = useParams<{ id?: string }>()
  const adminRestaurantId = restaurantIdOverride ?? params.id
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'active' | 'all'>('active')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newOrderToast, setNewOrderToast] = useState(false)
  const knownOrderIds = useRef<Set<string> | null>(null)

  useEffect(() => {
    const fetcher = adminRestaurantId ? getRestaurantById(adminRestaurantId) : user ? getRestaurantByOwner(user.uid) : null
    if (!fetcher) return

    let unsubscribe: (() => void) | undefined

    fetcher
      .then((r) => {
        setRestaurant(r)
        if (!r) {
          setLoading(false)
          return
        }
        unsubscribe = subscribeToOrders(r.id, (data) => {
          // Detect genuinely NEW orders (not the first load) to trigger the
          // chime + toast — comparing against previously-seen order IDs.
          if (knownOrderIds.current) {
            const isNewOrder = data.some((o) => !knownOrderIds.current!.has(o.id))
            if (isNewOrder) {
              playNewOrderChime()
              setNewOrderToast(true)
              setTimeout(() => setNewOrderToast(false), 4000)
            }
          }
          knownOrderIds.current = new Set(data.map((o) => o.id))
          setOrders(data)
          setLoading(false)
        })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
        setLoading(false)
      })

    return () => unsubscribe?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, adminRestaurantId])

  async function handleStatusChange(order: Order, status: OrderStatus) {
    if (!restaurant) return
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)))
    try {
      await updateOrderStatus(restaurant.id, order.id, status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    }
  }

  const visible = filter === 'active' ? orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled') : orders

  return (
    <div className="min-h-screen bg-paper-dim">
      {newOrderToast && (
        <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:left-4 z-50 rounded-2xl bg-ink text-paper shadow-2xl px-5 py-3.5 flex items-center gap-2">
          <Bell size={16} className="text-saffron" />
          <span className="text-sm font-medium">طلب جديد وصل! 🎉</span>
        </div>
      )}

      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to={backTo} className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="font-display text-lg font-semibold">
            الطلبات {restaurant && adminRestaurantId ? `— ${restaurant.name}` : ''}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setFilter('active')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === 'active' ? 'bg-ink text-paper' : 'bg-paper text-ink border border-stone-light/30'
            }`}
          >
            الحالية
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-ink text-paper' : 'bg-paper text-ink border border-stone-light/30'
            }`}
          >
            الكل
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-sumac/10 text-sumac text-sm px-4 py-3 mb-4">{error}</div>
        )}

        {loading ? (
          <p className="text-center text-stone py-10">جارِ التحميل...</p>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl bg-paper border border-dashed border-stone-light/50 p-10 text-center text-stone">
            مفيش طلبات هنا لسه.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((o) => (
              <div key={o.id} className="rounded-2xl bg-paper border border-stone-light/30 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status]}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                      <span className="text-xs text-stone">{ORDER_TYPE_LABEL[o.order_type]}</span>
                      {o.table_label && <span className="text-xs text-stone">· طاولة {o.table_label}</span>}
                    </div>
                    {(o.customer_name || o.customer_phone) && (
                      <p className="text-sm text-stone mt-1 flex items-center gap-1">
                        {o.customer_name}
                        {o.customer_phone && (
                          <a href={`tel:${o.customer_phone}`} className="flex items-center gap-1 text-saffron-dim">
                            <Phone size={12} /> {o.customer_phone}
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                  <span className="font-display font-semibold">{o.total} ج.م</span>
                </div>

                <ul className="text-sm text-stone mb-3 space-y-0.5">
                  {o.items.map((it, i) => (
                    <li key={i}>
                      {it.quantity}× {it.name}
                      {it.extras.length > 0 && <span className="text-stone-light"> ({it.extras.map((e) => e.name).join('، ')})</span>}
                    </li>
                  ))}
                </ul>

                {o.status !== 'completed' && o.status !== 'cancelled' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {STATUS_FLOW.filter((s) => s !== o.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(o, s)}
                        className="flex items-center gap-1 text-xs rounded-full bg-paper-dim px-3 py-1.5 hover:bg-stone-light/30 transition-colors"
                      >
                        {s === 'preparing' && <ChefHat size={12} />}
                        {s === 'ready' && <Clock size={12} />}
                        {s === 'completed' && <CheckCircle2 size={12} />}
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                    <button
                      onClick={() => handleStatusChange(o, 'cancelled')}
                      className="flex items-center gap-1 text-xs rounded-full bg-sumac/10 text-sumac px-3 py-1.5 hover:bg-sumac/20 transition-colors"
                    >
                      <XCircle size={12} /> إلغاء
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
