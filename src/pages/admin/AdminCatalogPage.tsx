import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ImagePlus, PackagePlus, Search } from 'lucide-react'
import ImageUpload from '@/components/ui/ImageUpload'
import { PRODUCT_CATALOG } from '@/data/productCatalog'
import {
  createCatalogProduct,
  listCatalogAdminRecords,
  saveCatalogAdminRecord,
  type CatalogAdminRecord,
} from '@/services/catalogAdmin'
import type { BusinessType } from '@/types/database'

export default function AdminCatalogPage() {
  const [records, setRecords] = useState<CatalogAdminRecord[]>([])
  const [search, setSearch] = useState('')
  const [businessType, setBusinessType] = useState<Extract<BusinessType, 'supermarket' | 'cosmetics'>>('supermarket')
  const [message, setMessage] = useState<string | null>(null)
  const [custom, setCustom] = useState({ name: '', category: '', brand: '', unit: '', barcode: '', description: '', imageUrl: '' })

  async function load() {
    setRecords(await listCatalogAdminRecords())
  }

  useEffect(() => { load() }, [])

  const recordMap = useMemo(() => new Map(records.map((r) => [r.id, r])), [records])
  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = PRODUCT_CATALOG.filter((p) => p.businessType === businessType)
    const customItems = records
      .filter((r) => r.custom && r.business_type === businessType && r.name && r.category)
      .map((r) => ({ id: r.id, businessType, category: r.category!, name: r.name!, brand: r.brand || undefined, unit: r.unit || undefined, barcode: r.barcode || undefined, description: r.description || undefined, imageUrl: r.image_url || '' }))
    return [...base, ...customItems].filter((p) => !q || [p.name, p.category, p.brand, p.barcode].some((v) => String(v || '').toLowerCase().includes(q)))
  }, [records, businessType, search])

  async function changeImage(id: string, url: string | null) {
    await saveCatalogAdminRecord(id, { image_url: url })
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === id)
      if (exists) return prev.map((r) => r.id === id ? { ...r, image_url: url } : r)
      return [...prev, { id, image_url: url }]
    })
    setMessage('تم حفظ صورة المنتج')
  }

  async function addProduct() {
    if (!custom.name.trim() || !custom.category.trim()) {
      setMessage('اكتب اسم المنتج والقسم')
      return
    }
    const id = `${businessType}-${Date.now()}`
    await createCatalogProduct({
      id,
      businessType,
      name: custom.name,
      category: custom.category,
      brand: custom.brand,
      unit: custom.unit,
      barcode: custom.barcode,
      description: custom.description,
      imageUrl: custom.imageUrl || null,
    })
    setCustom({ name: '', category: '', brand: '', unit: '', barcode: '', description: '', imageUrl: '' })
    setMessage('تمت إضافة المنتج للكتالوج العام')
    await load()
  }

  return (
    <div className="min-h-screen bg-paper-dim" dir="rtl">
      <header className="bg-paper border-b border-stone-light/30 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link to="/admin" className="text-stone"><ArrowRight size={20} /></Link>
          <div><h1 className="font-display text-xl font-semibold">إدارة كتالوج المنتجات</h1><p className="text-xs text-stone">إنت اللي بتعتمد الصورة الدقيقة لكل منتج قبل ما تظهر للعملاء</p></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-7">
        <div className="grid sm:grid-cols-[auto_1fr] gap-3 mb-6">
          <div className="flex gap-2">
            <button onClick={() => setBusinessType('supermarket')} className={`rounded-xl px-4 py-3 text-sm ${businessType === 'supermarket' ? 'bg-ink text-paper' : 'bg-paper border'}`}>سوبر ماركت</button>
            <button onClick={() => setBusinessType('cosmetics')} className={`rounded-xl px-4 py-3 text-sm ${businessType === 'cosmetics' ? 'bg-ink text-paper' : 'bg-paper border'}`}>مستحضرات تجميل</button>
          </div>
          <div className="relative"><Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المنتج أو القسم أو البراند" className="w-full rounded-2xl border bg-paper py-3 pr-10 pl-4" /></div>
        </div>

        <div className="rounded-3xl bg-paper border p-5 mb-8">
          <div className="flex items-center gap-2 mb-4"><PackagePlus className="text-saffron-dim" /><h2 className="font-semibold">إضافة منتج جديد للكتالوج</h2></div>
          <div className="grid md:grid-cols-3 gap-3">
            <input className="rounded-xl border p-3" placeholder="اسم المنتج" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
            <input className="rounded-xl border p-3" placeholder="القسم" value={custom.category} onChange={(e) => setCustom({ ...custom, category: e.target.value })} />
            <input className="rounded-xl border p-3" placeholder="البراند" value={custom.brand} onChange={(e) => setCustom({ ...custom, brand: e.target.value })} />
            <input className="rounded-xl border p-3" placeholder="الحجم / الوزن" value={custom.unit} onChange={(e) => setCustom({ ...custom, unit: e.target.value })} />
            <input className="rounded-xl border p-3" placeholder="الباركود" value={custom.barcode} onChange={(e) => setCustom({ ...custom, barcode: e.target.value })} />
            <input className="rounded-xl border p-3" placeholder="الوصف" value={custom.description} onChange={(e) => setCustom({ ...custom, description: e.target.value })} />
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <ImageUpload label="صورة المنتج" value={custom.imageUrl || null} onChange={(url) => setCustom({ ...custom, imageUrl: url || '' })} folder="catalog" fit="contain" />
            <button onClick={addProduct} className="rounded-xl bg-zaytoon text-paper px-6 py-3 font-semibold">إضافة للكتالوج</button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const record = recordMap.get(item.id)
            const approvedImage = record?.image_url || ''
            return (
              <article key={item.id} className="rounded-3xl bg-paper border border-stone-light/30 p-4">
                <div className="flex items-center justify-between gap-3 mb-3"><div><h3 className="font-semibold">{item.name}</h3><p className="text-xs text-stone mt-1">{item.category}{item.brand ? ` • ${item.brand}` : ''}</p></div><ImagePlus size={18} className={approvedImage ? 'text-zaytoon' : 'text-stone-light'} /></div>
                <ImageUpload label={approvedImage ? 'الصورة المعتمدة' : 'ارفع الصورة الصحيحة'} value={approvedImage || null} onChange={(url) => changeImage(item.id, url)} folder={`catalog/${businessType}`} fit="contain" />
                {!approvedImage && <p className="text-xs text-sumac mt-3">مش هتظهر صورة للعميل لحد ما تعتمد صورة هنا.</p>}
              </article>
            )
          })}
        </div>

        {message && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-ink text-paper px-5 py-3 text-sm shadow-xl">{message}</div>}
      </main>
    </div>
  )
}
