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

  const allItems = useMemo(() => {
    if (!restaurant || (restaurant.business_type !== 'supermarket' && restaurant.business_type !== 'cosmetics')) return []
    return PRODUCT_CATALOG.filter((p) => p.businessType === restaurant.business_type)
  }, [restaurant])

  const items = useMemo(() => {
    const term = search.trim().toLowerCase()
    return allItems.filter((p) => !term || [p.name, p.category, p.brand, p.barcode, p.description].some((v) => String(v || '').toLowerCase().includes(term)))
  }, [allItems, search])

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogProduct[]>()
    items.forEach((item) => {
      const list = map.get(item.category) || []
      list.push(item)
      map.set(item.category, list)
    })
    return Array.from(map.entries())
  }, [items])

  const selectedItems = allItems.filter((p) => selected[p.id])
  const missingPrices = selectedItems.filter((p) => !Number.isFinite(Number(prices[p.id])) || Number(prices[p.id]) <= 0)

  function toggleCategory(categoryItems: CatalogProduct[]) {
    const allSelected = categoryItems.every((p) => selected[p.id])
    const next = { ...selected }
    categoryItems.forEach((p) => { next[p.id] = !allSelected })
    setSelected(next)
  }

  async function importSelected() {
    if (!restaurant || selectedItems.length === 0) return
    if (missingPrices.length > 0) {
      setMessage(`اكتب سعر ${missingPrices[0].name} وباقي المنتجات المحددة قبل الإضافة`)
      return
    }
    setSaving(true); setMessage(null)
    try {
      await importCatalogProducts(restaurant, selectedItems, prices)
      setMessage(`تمت إضافة ${selectedItems.length} منتج للمتجر بالصور والبيانات والأسعار`)
      setSelected({})
      setPrices({})
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
          <div><h1 className="font-display text-lg font-semibold">كتالوج المنتجات الجاهز</h1><p className="text-xs text-stone">المنتج جاهز بالاسم والصورة والقسم والوصف — اختاره واكتب السعر فقط</p></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-7">
        <div className="rounded-3xl bg-ink text-paper p-6 mb-6 shadow-xl" style={{ transform: 'perspective(900px) rotateX(1deg)', boxShadow: '0 24px 60px rgba(0,0,0,.18)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs"><Sparkles size={14} /> أسرع تجهيز للمتجر</span><h2 className="font-display text-2xl font-bold mt-3">اختار المنتج واكتب سعرك بس</h2><p className="text-stone-light mt-2">إحنا مجهزين الاسم والصورة والوصف والقسم والحجم. وإنت تحدد المنتجات الموجودة عندك وسعر البيع.</p></div>
            <div className="flex gap-2"><div className="rounded-2xl bg-white/5 px-5 py-4 text-center"><div className="text-3xl font-bold">{allItems.length}</div><div className="text-xs text-stone-light">منتج جاهز</div></div><div className="rounded-2xl bg-white/5 px-5 py-4 text-center"><div className="text-3xl font-bold">{selectedItems.length}</div><div className="text-xs text-stone-light">محدد</div></div></div>
          </div>
        </div>

        <div className="relative mb-7"><Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو القسم أو الوصف أو الباركود" className="w-full rounded-2xl border border-stone-light/30 bg-paper py-3 pr-11 pl-4 outline-none focus:border-saffron" /></div>

        <div className="space-y-9">
          {grouped.map(([category, categoryItems]) => {
            const categorySelected = categoryItems.every((p) => selected[p.id])
            return (
              <section key={category}>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div><h2 className="font-display text-xl font-semibold">{category}</h2><p className="text-xs text-stone mt-1">{categoryItems.length} منتج جاهز</p></div>
                  <button onClick={() => toggleCategory(categoryItems)} className={`rounded-full px-4 py-2 text-xs font-semibold ${categorySelected ? 'bg-zaytoon text-paper' : 'bg-paper border border-stone-light/30'}`}>{categorySelected ? 'إلغاء تحديد القسم' : 'اختار القسم كله'}</button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryItems.map((item) => {
                    const active = !!selected[item.id]
                    return (
                      <article key={item.id} className={`overflow-hidden rounded-3xl border bg-paper transition-all ${active ? 'border-saffron shadow-xl -translate-y-1' : 'border-stone-light/30'}`}>
                        <button onClick={() => setSelected({ ...selected, [item.id]: !active })} className="relative block w-full text-right">
                          <div className="aspect-square bg-paper-dim overflow-hidden">
                            <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                          </div>
                          <span className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${active ? 'bg-zaytoon text-paper' : 'bg-paper/90 text-stone'}`}><CheckCircle2 size={21} /></span>
                        </button>
                        <div className="p-4">
                          <p className="font-semibold leading-6">{item.name}</p>
                          <p className="text-xs text-stone mt-1">{item.unit || item.category}</p>
                          {item.description && <p className="text-xs text-stone mt-2 leading-5 min-h-10">{item.description}</p>}
                          {item.brand && <p className="text-[11px] text-stone-light mt-1">البراند: {item.brand}</p>}
                          {item.barcode && <p className="text-[11px] text-stone-light mt-1">باركود: {item.barcode}</p>}
                          <div className="mt-4">
                            <label className="text-xs font-medium">سعر البيع عندك</label>
                            <div className="relative mt-1"><input type="number" min="0.01" step="0.01" value={prices[item.id] ?? ''} onFocus={() => !active && setSelected({ ...selected, [item.id]: true })} onChange={(e) => setPrices({ ...prices, [item.id]: Number(e.target.value) })} placeholder="اكتب السعر" className="w-full rounded-xl border border-stone-light/30 py-2.5 pr-3 pl-14 outline-none focus:border-saffron" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone">ج.م</span></div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <div className="sticky bottom-3 z-20 mt-8 rounded-2xl bg-ink/95 backdrop-blur text-paper p-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm"><span className="font-bold text-saffron">{selectedItems.length}</span> منتج محدد {missingPrices.length > 0 && <span className="text-sumac">• ناقص سعر {missingPrices.length}</span>}</div>
          <button disabled={saving || selectedItems.length === 0 || missingPrices.length > 0} onClick={importSelected} className="w-full sm:w-auto rounded-xl bg-zaytoon text-paper px-6 py-3 font-semibold disabled:opacity-40">{saving ? 'جارِ الإضافة...' : `إضافة ${selectedItems.length} منتج لمتجري`}</button>
        </div>

        <section className="mt-10 rounded-3xl bg-paper border border-stone-light/30 p-6">
          <div className="flex items-center gap-2 mb-2"><Barcode className="text-saffron-dim" /><h2 className="font-display text-xl font-semibold">المنتج مش موجود؟ ضيفه</h2></div>
          <p className="text-sm text-stone mb-5">المنتجات الجاهزة فوق محتاجة منك السعر فقط. استخدم الجزء ده بس لو المنتج مش موجود أصلًا في الكتالوج.</p>
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
