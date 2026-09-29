import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import {
  ArrowRight, BarChart3, Boxes, Gift, MapPinned, Plus, Save, Trash2, Users, WalletCards,
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurantByOwner, updateRestaurant } from '@/services/restaurants'
import { listOrders } from '@/services/orders'
import { listProducts } from '@/services/products'
import type { Order, Product, Restaurant } from '@/types/database'

type DeliveryZone = {
  id: string
  name: string
  fee: number
  min_order: number
  active: boolean
}

type GrowthConfig = {
  loyalty?: {
    enabled?: boolean
    points_per_egp?: number
    reward_threshold?: number
    reward_value?: number
  }
  delivery_zones?: DeliveryZone[]
}

type GrowthRestaurant = Restaurant & { growth?: GrowthConfig }
type InventoryProduct = Product & { stock_quantity?: number; reorder_point?: number }

type CustomerRow = {
  key: string
  name: string
  phone: string
  orders: number
  spend: number
  lastOrder: string
}

function getOrderDate(order: Order) {
  const raw = order.created_at as unknown
  if (raw && typeof raw === 'object' && 'toDate' in raw && typeof (raw as { toDate: () => Date }).toDate === 'function') {
    return (raw as { toDate: () => Date }).toDate()
  }
  const parsed = new Date(String(raw || ''))
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

function money(value: number) {
  return `${Math.round(value).toLocaleString('ar-EG')} ج.م`
}

export default function GrowthPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<GrowthRestaurant | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loyalty, setLoyalty] = useState({ enabled: true, points_per_egp: 1, reward_threshold: 100, reward_value: 10 })
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [inventory, setInventory] = useState<Record<string, { stock: string; reorder: string }>>({})

  useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      try {
        const r = (await getRestaurantByOwner(user.uid)) as GrowthRestaurant | null
        if (!r || !active) return
        const [orderRows, productRows] = await Promise.all([listOrders(r.id), listProducts(r.id)])
        if (!active) return
        setRestaurant(r)
        setOrders(orderRows)
        setProducts(productRows as InventoryProduct[])
        const savedLoyalty = r.growth?.loyalty
        setLoyalty({
          enabled: savedLoyalty?.enabled ?? true,
          points_per_egp: Number(savedLoyalty?.points_per_egp ?? 1),
          reward_threshold: Number(savedLoyalty?.reward_threshold ?? 100),
          reward_value: Number(savedLoyalty?.reward_value ?? 10),
        })
        setZones(r.growth?.delivery_zones ?? [])
        const stockState: Record<string, { stock: string; reorder: string }> = {}
        ;(productRows as InventoryProduct[]).forEach((p) => {
          stockState[p.id] = {
            stock: p.stock_quantity == null ? '' : String(p.stock_quantity),
            reorder: p.reorder_point == null ? '5' : String(p.reorder_point),
          }
        })
        setInventory(stockState)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'حصل خطأ أثناء تحميل البيانات')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [user])

  const completed = useMemo(() => orders.filter((o) => o.status === 'completed'), [orders])
  const sales = useMemo(() => completed.reduce((sum, o) => sum + Number(o.total || 0), 0), [completed])
  const avgOrder = completed.length ? sales / completed.length : 0

  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>()
    orders.forEach((o) => {
      const phone = (o.customer_phone || '').trim()
      const name = (o.customer_name || 'عميل بدون اسم').trim()
      if (!phone && !o.customer_name) return
      const key = phone || name
      const existing = map.get(key) || { key, name, phone, orders: 0, spend: 0, lastOrder: '' }
      existing.orders += 1
      if (o.status === 'completed') existing.spend += Number(o.total || 0)
      const date = getOrderDate(o)
      if (!existing.lastOrder || date > new Date(existing.lastOrder)) existing.lastOrder = date.toISOString()
      map.set(key, existing)
    })
    return [...map.values()].sort((a, b) => b.spend - a.spend)
  }, [orders])

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>()
    completed.forEach((o) => o.items.forEach((item) => {
      const row = map.get(item.product_id) || { name: item.name, qty: 0, revenue: 0 }
      row.qty += Number(item.quantity || 0)
      row.revenue += Number(item.price || 0) * Number(item.quantity || 0)
      map.set(item.product_id, row)
    }))
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5)
  }, [completed])

  const lowStock = useMemo(() => products.filter((p) => {
    const row = inventory[p.id]
    if (!row || row.stock === '') return false
    const stock = Number(row.stock)
    const reorder = Number(row.reorder || 0)
    return Number.isFinite(stock) && Number.isFinite(reorder) && stock <= reorder
  }).length, [products, inventory])

  async function saveGrowthSettings() {
    if (!restaurant) return
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const growth: GrowthConfig = {
        ...(restaurant.growth ?? {}),
        loyalty,
        delivery_zones: zones,
      }
      await updateRestaurant(restaurant.id, { growth } as unknown as Partial<Restaurant>)
      setRestaurant({ ...restaurant, growth })
      setMessage('تم حفظ إعدادات الولاء ومناطق التوصيل ✓')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function saveInventory() {
    if (!restaurant) return
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await Promise.all(products.map(async (p) => {
        const row = inventory[p.id]
        if (!row) return
        const stock = row.stock === '' ? null : Math.max(0, Number(row.stock))
        const reorder = row.reorder === '' ? 0 : Math.max(0, Number(row.reorder))
        await updateDoc(doc(db, 'restaurants', restaurant.id, 'products', p.id), {
          stock_quantity: Number.isFinite(stock as number) ? stock : null,
          reorder_point: Number.isFinite(reorder) ? reorder : 0,
        })
      }))
      setProducts((prev) => prev.map((p) => ({
        ...p,
        stock_quantity: inventory[p.id]?.stock === '' ? undefined : Number(inventory[p.id]?.stock || 0),
        reorder_point: Number(inventory[p.id]?.reorder || 0),
      })))
      setMessage('تم حفظ المخزون وحد التنبيه ✓')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر حفظ المخزون')
    } finally {
      setSaving(false)
    }
  }

  function addZone() {
    setZones((prev) => [...prev, { id: crypto.randomUUID(), name: `منطقة ${prev.length + 1}`, fee: 0, min_order: 0, active: true }])
  }

  if (loading) return <div className="min-h-screen bg-[#f1ece3] flex items-center justify-center"><div className="w-9 h-9 rounded-full border-2 border-[#b99551] border-t-transparent animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#f1ece3]" dir="rtl">
      <header className="bg-[#11120f] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#d7b66f] font-semibold">مركز النمو والمبيعات</p>
            <h1 className="font-display text-xl sm:text-2xl font-bold mt-1">العملاء، الولاء، الإحصائيات والمخزون</h1>
          </div>
          <Link to="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10"><ArrowRight size={16} /> رجوع</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-6 py-7 space-y-6">
        {error && <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}
        {message && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm">{message}</div>}

        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Metric icon={WalletCards} label="إجمالي المبيعات" value={money(sales)} />
          <Metric icon={BarChart3} label="طلبات مكتملة" value={completed.length.toLocaleString('ar-EG')} />
          <Metric icon={Users} label="عملاء معروفون" value={customers.length.toLocaleString('ar-EG')} />
          <Metric icon={Gift} label="متوسط الطلب" value={money(avgOrder)} />
          <Metric icon={Boxes} label="مخزون منخفض" value={lowStock.toLocaleString('ar-EG')} />
        </section>

        <section className="grid xl:grid-cols-2 gap-6">
          <Card title="أفضل المنتجات" icon={BarChart3}>
            <div className="space-y-3">
              {topProducts.length === 0 ? <Empty text="لسه مفيش طلبات مكتملة كفاية للتحليل." /> : topProducts.map((p, i) => (
                <div key={`${p.name}-${i}`} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f7f3ec] px-4 py-3">
                  <div><div className="font-semibold">{p.name}</div><div className="text-xs text-stone mt-1">{p.qty.toLocaleString('ar-EG')} قطعة</div></div>
                  <div className="font-semibold">{money(p.revenue)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="برنامج الولاء" icon={Gift}>
            <div className="space-y-4">
              <label className="flex items-center justify-between rounded-2xl bg-[#f7f3ec] px-4 py-3">
                <span><b>تفعيل نقاط الولاء</b><small className="block text-stone mt-1">النقاط محسوبة تلقائيًا من الطلبات المكتملة</small></span>
                <input type="checkbox" checked={loyalty.enabled} onChange={(e) => setLoyalty((v) => ({ ...v, enabled: e.target.checked }))} className="w-5 h-5" />
              </label>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="نقطة لكل جنيه" value={loyalty.points_per_egp} onChange={(v) => setLoyalty((x) => ({ ...x, points_per_egp: Number(v) }))} />
                <Field label="حد الاستبدال" value={loyalty.reward_threshold} onChange={(v) => setLoyalty((x) => ({ ...x, reward_threshold: Number(v) }))} />
                <Field label="قيمة المكافأة ج.م" value={loyalty.reward_value} onChange={(v) => setLoyalty((x) => ({ ...x, reward_value: Number(v) }))} />
              </div>
              <button onClick={saveGrowthSettings} disabled={saving} className="rounded-xl bg-[#11120f] text-white px-4 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"><Save size={16} /> حفظ الإعدادات</button>
            </div>
          </Card>
        </section>

        <Card title="قاعدة بيانات العملاء" icon={Users}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead><tr className="text-stone border-b border-black/10"><th className="text-right py-3">العميل</th><th>الموبايل</th><th>الطلبات</th><th>إجمالي الشراء</th><th>النقاط</th><th>آخر طلب</th></tr></thead>
              <tbody>{customers.length === 0 ? <tr><td colSpan={6}><Empty text="العملاء هيظهروا هنا تلقائيًا بعد أول طلب." /></td></tr> : customers.map((c) => (
                <tr key={c.key} className="border-b border-black/5"><td className="py-3 font-semibold">{c.name}</td><td className="text-center">{c.phone || '—'}</td><td className="text-center">{c.orders}</td><td className="text-center">{money(c.spend)}</td><td className="text-center font-semibold text-[#8d7444]">{Math.floor(c.spend * Math.max(0, loyalty.points_per_egp || 0)).toLocaleString('ar-EG')}</td><td className="text-center">{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('ar-EG') : '—'}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </Card>

        <Card title="مناطق التوصيل وأسعارها" icon={MapPinned}>
          <div className="space-y-3">
            {zones.map((zone, index) => (
              <div key={zone.id} className="grid sm:grid-cols-[1.4fr_.7fr_.7fr_auto_auto] gap-2 items-end rounded-2xl bg-[#f7f3ec] p-3">
                <TextField label="اسم المنطقة" value={zone.name} onChange={(v) => setZones((rows) => rows.map((z, i) => i === index ? { ...z, name: v } : z))} />
                <Field label="التوصيل ج.م" value={zone.fee} onChange={(v) => setZones((rows) => rows.map((z, i) => i === index ? { ...z, fee: Number(v) } : z))} />
                <Field label="أقل طلب" value={zone.min_order} onChange={(v) => setZones((rows) => rows.map((z, i) => i === index ? { ...z, min_order: Number(v) } : z))} />
                <label className="flex items-center gap-2 h-10 px-2"><input type="checkbox" checked={zone.active} onChange={(e) => setZones((rows) => rows.map((z, i) => i === index ? { ...z, active: e.target.checked } : z))} /> فعال</label>
                <button onClick={() => setZones((rows) => rows.filter((_, i) => i !== index))} className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><Trash2 size={16} /></button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button onClick={addZone} className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold flex items-center gap-2"><Plus size={16} /> إضافة منطقة</button>
              <button onClick={saveGrowthSettings} disabled={saving} className="rounded-xl bg-[#11120f] text-white px-4 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"><Save size={16} /> حفظ المناطق</button>
            </div>
          </div>
        </Card>

        <Card title="إدارة المخزون" icon={Boxes}>
          <p className="text-sm text-stone mb-4">حدد كمية كل منتج وحد التنبيه. عند تحويل الطلب إلى «مكتمل» يتم خصم الكمية تلقائيًا للمنتجات اللي لها مخزون محدد.</p>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {products.map((p) => {
              const row = inventory[p.id] || { stock: '', reorder: '5' }
              const low = row.stock !== '' && Number(row.stock) <= Number(row.reorder || 0)
              return <div key={p.id} className={`grid sm:grid-cols-[1fr_130px_130px] gap-3 items-center rounded-2xl border p-3 ${low ? 'bg-amber-50 border-amber-200' : 'bg-[#f7f3ec] border-transparent'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name.ar} className="w-12 h-12 rounded-xl object-cover bg-white" /> : <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center"><Boxes size={18} /></div>}
                  <div className="min-w-0"><div className="font-semibold truncate">{p.name.ar}</div><div className="text-xs text-stone mt-1">{low ? '⚠ المخزون وصل لحد التنبيه' : 'المخزون متاح'}</div></div>
                </div>
                <TextField label="الكمية" value={row.stock} inputMode="numeric" onChange={(v) => setInventory((s) => ({ ...s, [p.id]: { ...row, stock: v } }))} />
                <TextField label="تنبيه عند" value={row.reorder} inputMode="numeric" onChange={(v) => setInventory((s) => ({ ...s, [p.id]: { ...row, reorder: v } }))} />
              </div>
            })}
          </div>
          <button onClick={saveInventory} disabled={saving} className="mt-4 rounded-xl bg-[#11120f] text-white px-4 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"><Save size={16} /> حفظ المخزون</button>
        </Card>
      </main>
    </div>
  )
}

function Card({ title, icon: Icon, children }: { title: string; icon: typeof Users; children: React.ReactNode }) {
  return <section className="rounded-[26px] bg-white border border-black/5 p-5 sm:p-6 shadow-[0_12px_35px_rgba(0,0,0,.05)]"><h2 className="font-display font-bold text-lg flex items-center gap-2 mb-4"><Icon size={19} className="text-[#9a7d45]" /> {title}</h2>{children}</section>
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="rounded-3xl bg-white border border-black/5 p-5"><div className="w-10 h-10 rounded-2xl bg-[#d7b66f]/15 flex items-center justify-center mb-3"><Icon size={19} className="text-[#8d7444]" /></div><div className="text-xs text-stone">{label}</div><div className="text-xl font-bold mt-1">{value}</div></div>
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return <label className="text-sm"><span className="block text-stone mb-1">{label}</span><input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 rounded-xl border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-[#d7b66f]/40" /></label>
}

function TextField({ label, value, onChange, inputMode }: { label: string; value: string; onChange: (value: string) => void; inputMode?: 'text' | 'numeric' }) {
  return <label className="text-sm"><span className="block text-stone mb-1">{label}</span><input value={value} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} className="w-full h-10 rounded-xl border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-[#d7b66f]/40" /></label>
}

function Empty({ text }: { text: string }) {
  return <div className="text-center text-stone text-sm py-8">{text}</div>
}
