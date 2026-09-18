import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Barcode, CheckCircle2, PackagePlus, Search, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurantByOwner } from '@/services/restaurants'
import { addCustomCatalogProduct, importCatalogProducts } from '@/services/catalog'
import { PRODUCT_CATALOG, type CatalogProduct } from '@/data/productCatalog'
import type { Restaurant } from '@/types/database'

export default function CatalogPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [custom, setCustom] = useState({ name: '', category: '', brand: '', barcode: '', unit: '', price: '' })

  useEffect(() => {
    if (!user) return
    getRestaurantByOwner(user.uid).then(setRestaurant).catch(() => setRestaurant(null))
  }, [user])

  const items = useMemo(() => {
    if (!restaurant || (restaurant.business_type !== 'supermarket' && restaurant.business_type !== 'cosmetics')) return []
    const term = search.trim().toLowerCase()
    return PRODUCT_CATALOG.filter((p) => p.businessType === restaurant.business_type)
      .filter((p) => !term || [p.name, p.category, p.brand, p.barcode].some((v) => String(v || '').toLowerCase().includes(term)))
  }, [restaurant, search])

  const selectedItems = items.filter((p) => selected[p.id])

  async function importSelected() {
    if (!restaurant || selectedItems.length === 0) return
    setSaving(true); setMessage(null)
    try {
      await importCatalogProducts(restaurant, selectedItems, prices)
      setMessage(`تمت إضافة ${selectedItems.length} منتج للمتجر بنجاح`)
      setSelected({})
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'تعذر إضافة المنتجات')
    } finally { setSaving(false) }
  }

  async function addCustom() {
    if (!restaurant || !custom.name.trim() || !custom.category.trim() || Number(custom.price) <= 0) {
      setMessage('اكتب اسم المنتج والقسم والسعر')
      return
    }
    setSaving(true); setMessage(null)
    try {
      await addCustomCatalogProduct({
        restaurant,
        name: custom.name,
        category: custom.category,
        price: Number(custom.price),
        brand: custom.brand,
        barcode: custom.barcode,
        unit: custom.unit,
      })
      setCustom({ name: '', category: '', brand: '', barcode: '', unit: '', price: '' })
      setMessage('تمت إضافة المنتج لمتجرك وإرساله للإدارة لاعتماده في الكتالوج العام')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'تعذر إضافة المنتج')
    } finally { setSaving(false) }
  }

  if (!restaurant) return <div className="min-h-screen flex items-center justify-center bg-paper">جارِ التحميل...</div>

  const supported = restaurant.business_type === 'supermarket' || restaurant.business_type === 'cosmetics'
  if (!supported) {
    return <div className="min-h-screen bg-paper p-6"><div className="max-w-xl mx-auto mt-20 rounded-3xl bg-paper-dim border p-8 text-center"><PackagePlus className="mx-auto mb-3 text-saffron-dim" /><h1 className="font-display text-xl font-semibold">الكتالوج الجاهز للسوبر ماركت ومستحضرات التجميل</h1><p className="text-stone mt-2">الميزة دي بتظهر تلقائيًا للحسابات من النوع المناسب.</p><Link to="/dashboard" className="inline-block mt-5 underline">رجوع للوحة التحكم</Link></div></div>
  }

  return (
    <div className="min-h-screen bg-paper-dim" dir="rtl">
      <header className="bg-paper border-b border-stone-light/30 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="text-stone"><ArrowRight size={20} /></Link>
          <div><h1 className="font-display text-lg font-semibold">كتالوج المنتجات الجاهز</h1><p className="text-xs text-stone">اختار المنتجات وحط سعر متجرك واضغط إضافة</p></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-7">
        <div className="rounded-3xl bg-ink text-paper p-6 mb-6 shadow-xl" style={{ transform: 'perspective(900px) rotateX(1deg)', boxShadow: '0 24px 60px rgba(0,0,0,.18)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs"><Sparkles size={14} /> إضافة سريعة</span><h2 className="font-display text-2xl font-bold mt-3">متبدأش من الصفر</h2><p className="text-stone-light mt-2">اختار المنتجات الموجودة عندك، اكتب السعر، وهيتنزلوا في أقسامهم تلقائيًا.</p></div>
            <div className="rounded-2xl bg-white/5 px-5 py-4 text-center"><div className="text-3xl font-bold">{selectedItems.length}</div><div className="text-xs text-stone-light">منتج محدد</div></div>
          </div>
        </div>

        <div className="relative mb-5"><Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو القسم أو الباركود" className="w-full rounded-2xl border border-stone-light/30 bg-paper py-3 pr-11 pl-4 outline-none focus:border-saffron" /></div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: CatalogProduct) => {
            const active = !!selected[item.id]
            return <div key={item.id} className={`rounded-3xl border bg-paper p-5 transition-all ${active ? 'border-saffron shadow-lg -translate-y-1' : 'border-stone-light/30'}`}>
              <button onClick={() => setSelected({ ...selected, [item.id]: !active })} className="w-full text-right">
                <div className="flex justify-between gap-3"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-stone mt-1">{item.category}{item.unit ? ` • ${item.unit}` : ''}</p></div><CheckCircle2 size={22} className={active ? 'text-zaytoon' : 'text-stone-light'} /></div>
              </button>
              <div className="mt-4"><label className="text-xs text-stone">سعر البيع عندك</label><input type="number" min="0" value={prices[item.id] ?? ''} onChange={(e) => setPrices({ ...prices, [item.id]: Number(e.target.value) })} placeholder="مثال: 25" className="mt-1 w-full rounded-xl border border-stone-light/30 p-2.5" /></div>
            </div>
          })}
        </div>

        <button disabled={saving || selectedItems.length === 0} onClick={importSelected} className="mt-6 w-full rounded-2xl bg-zaytoon text-paper py-3.5 font-semibold disabled:opacity-40">{saving ? 'جارِ الإضافة...' : `إضافة المنتجات المحددة (${selectedItems.length})`}</button>

        <section className="mt-10 rounded-3xl bg-paper border border-stone-light/30 p-6">
          <div className="flex items-center gap-2 mb-2"><Barcode className="text-saffron-dim" /><h2 className="font-display text-xl font-semibold">المنتج مش موجود؟ ضيفه فورًا</h2></div>
          <p className="text-sm text-stone mb-5">هيتضاف لمتجرك حالًا، ويتبعت للإدارة لاعتماده بعد كده في الكتالوج العام عشان يفيد باقي العملاء.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="اسم المنتج" className="rounded-xl border p-3" />
            <input value={custom.category} onChange={(e) => setCustom({ ...custom, category: e.target.value })} placeholder="القسم" className="rounded-xl border p-3" />
            <input value={custom.price} onChange={(e) => setCustom({ ...custom, price: e.target.value })} type="number" placeholder="السعر" className="rounded-xl border p-3" />
            <input value={custom.brand} onChange={(e) => setCustom({ ...custom, brand: e.target.value })} placeholder="البراند - اختياري" className="rounded-xl border p-3" />
            <input value={custom.barcode} onChange={(e) => setCustom({ ...custom, barcode: e.target.value })} placeholder="الباركود - اختياري" className="rounded-xl border p-3" />
            <input value={custom.unit} onChange={(e) => setCustom({ ...custom, unit: e.target.value })} placeholder="الحجم/الوزن" className="rounded-xl border p-3" />
          </div>
          <button disabled={saving} onClick={addCustom} className="mt-4 rounded-xl bg-ink text-paper px-5 py-3 font-semibold">إضافة لمتجري</button>
        </section>

        {message && <div className="mt-5 rounded-2xl bg-paper border p-4 text-sm">{message}</div>}
      </main>
    </div>
  )
}
