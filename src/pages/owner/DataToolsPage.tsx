import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Download, FileSpreadsheet, FolderInput, Save, Undo2, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'
import { getRestaurantByOwner } from '@/services/restaurants'
import { createCategory, listCategories } from '@/services/categories'
import { createProduct, listProducts, updateProduct } from '@/services/products'
import type { Category, Product, Restaurant } from '@/types/database'

interface UndoEntry {
  label: string
  values: Array<{ id: string; patch: { category_id?: string | null; price?: number; is_available?: boolean } }>
}

function downloadText(filename: string, text: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value: unknown) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      values.push(current.trim())
      current = ''
    } else current += char
  }
  values.push(current.trim())
  return values
}

export default function DataToolsPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [moveCategoryId, setMoveCategoryId] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [undo, setUndo] = useState<UndoEntry | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function load() {
    if (!user) return
    setError(null)
    const r = await getRestaurantByOwner(user.uid)
    setRestaurant(r)
    if (!r) return
    const [cats, items] = await Promise.all([listCategories(r.id), listProducts(r.id)])
    setCategories(cats)
    setProducts(items)
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'تعذّر تحميل البيانات'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const selectedProducts = useMemo(() => products.filter((p) => selectedIds.has(p.id)), [products, selectedIds])

  function flash(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2600)
  }

  function exportJson() {
    if (!restaurant) return
    const payload = {
      exported_at: new Date().toISOString(),
      restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug, business_type: restaurant.business_type },
      categories,
      products,
    }
    downloadText(`egy-menu-backup-${restaurant.slug || restaurant.id}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8')
    flash('تم تنزيل النسخة الاحتياطية JSON')
  }

  function exportCsv() {
    const header = ['name_ar', 'name_en', 'price', 'discount_price', 'category', 'description_ar', 'visible', 'barcode', 'brand']
    const rows = products.map((p) => {
      const category = categories.find((c) => c.id === p.category_id)?.name.ar ?? ''
      return [p.name.ar, p.name.en ?? '', p.price, p.discount_price ?? '', category, p.description?.ar ?? '', p.is_available ? '1' : '0', p.barcode ?? '', p.brand ?? '']
        .map(csvCell)
        .join(',')
    })
    downloadText(`egy-menu-products-${restaurant?.slug || 'menu'}.csv`, `\uFEFF${header.join(',')}\n${rows.join('\n')}`, 'text/csv;charset=utf-8')
    flash('تم تنزيل ملف CSV ويفتح عادي في Excel')
  }

  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !restaurant) return
    setBusy(true)
    setError(null)
    try {
      const text = await file.text()
      const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
      if (lines.length < 2) throw new Error('الملف فاضي أو مفيهوش بيانات')
      const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
      const indexOf = (...names: string[]) => names.map((name) => headers.indexOf(name)).find((i) => i >= 0) ?? -1
      const nameIndex = indexOf('name_ar', 'name', 'اسم', 'اسم المنتج')
      const priceIndex = indexOf('price', 'السعر')
      const categoryIndex = indexOf('category', 'القسم')
      const descIndex = indexOf('description_ar', 'description', 'الوصف')
      const visibleIndex = indexOf('visible', 'is_available', 'متاح')
      const barcodeIndex = indexOf('barcode', 'باركود')
      const brandIndex = indexOf('brand', 'البراند')
      if (nameIndex < 0 || priceIndex < 0 || categoryIndex < 0) throw new Error('لازم الملف يحتوي على name_ar و price و category')

      const liveUid = auth.currentUser?.uid ?? restaurant.owner_id ?? null
      const categoryMap = new Map(categories.map((c) => [c.name.ar.trim().toLowerCase(), c.id]))
      let created = 0
      for (let i = 1; i < lines.length; i += 1) {
        const row = parseCsvLine(lines[i])
        const name = row[nameIndex]?.trim()
        const categoryName = row[categoryIndex]?.trim()
        const price = Number(row[priceIndex])
        if (!name || !categoryName || !Number.isFinite(price)) continue
        const key = categoryName.toLowerCase()
        let categoryId = categoryMap.get(key)
        if (!categoryId) {
          categoryId = await createCategory(restaurant.id, liveUid, categoryName, '', categoryMap.size)
          categoryMap.set(key, categoryId)
        }
        await createProduct(restaurant.id, liveUid, {
          category_id: categoryId,
          name: { ar: name, en: '' },
          description: { ar: descIndex >= 0 ? row[descIndex] || '' : '' },
          price,
          discount_price: null,
          is_available: visibleIndex < 0 ? true : !['0', 'false', 'no', 'لا'].includes(String(row[visibleIndex] || '').trim().toLowerCase()),
          is_best_seller: false,
          is_new: false,
          is_spicy: false,
          is_vegetarian: false,
          barcode: barcodeIndex >= 0 ? row[barcodeIndex] || null : null,
          brand: brandIndex >= 0 ? row[brandIndex] || null : null,
          images: [],
          ingredients: [],
          allergens: [],
          extras: [],
          sizes: [],
        })
        created += 1
      }
      await load()
      flash(`تم استيراد ${created} منتج من CSV`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر استيراد الملف')
    } finally {
      setBusy(false)
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function moveSelected() {
    if (!restaurant || !moveCategoryId || selectedProducts.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const previous = selectedProducts.map((p) => ({ id: p.id, patch: { category_id: p.category_id } }))
      await Promise.all(selectedProducts.map((p) => updateProduct(restaurant.id, p.id, { category_id: moveCategoryId })))
      setUndo({ label: `نقل ${selectedProducts.length} منتج`, values: previous })
      await load()
      setSelectedIds(new Set())
      flash(`تم نقل ${selectedProducts.length} منتج للقسم الجديد`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر نقل المنتجات')
    } finally {
      setBusy(false)
    }
  }

  async function undoLast() {
    if (!restaurant || !undo) return
    setBusy(true)
    setError(null)
    try {
      await Promise.all(undo.values.map((entry) => updateProduct(restaurant.id, entry.id, entry.patch)))
      const label = undo.label
      setUndo(null)
      await load()
      flash(`تم التراجع عن: ${label}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر التراجع عن آخر تعديل')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f1ece3]" dir="rtl">
      <header className="bg-[#11120f] text-white border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="text-white/55 hover:text-white"><ArrowRight size={20} /></Link>
          <div className="flex-1"><h1 className="font-display text-lg font-bold">استيراد وتصدير وإدارة جماعية</h1><p className="text-xs text-white/45 mt-1">انقل بياناتك بسهولة وخد نسخة احتياطية قبل أي تعديل كبير</p></div>
          {undo && <button disabled={busy} onClick={undoLast} className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 text-xs flex items-center gap-2"><Undo2 size={15} /> تراجع: {undo.label}</button>}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-6 py-7">
        {error && <div className="mb-4 rounded-2xl bg-sumac/10 text-sumac border border-sumac/20 px-4 py-3 text-sm">{error}</div>}
        {message && <div className="mb-4 rounded-2xl bg-zaytoon/10 text-zaytoon border border-zaytoon/20 px-4 py-3 text-sm">{message}</div>}

        <section className="grid md:grid-cols-3 gap-4 mb-7">
          <button onClick={exportJson} className="text-right rounded-3xl bg-[#11120f] text-white p-6 shadow-xl hover:-translate-y-1 transition-transform"><Download className="text-[#d7b66f] mb-4" /><h2 className="font-display font-bold">نسخة احتياطية كاملة</h2><p className="text-sm text-white/45 mt-2">ينزل الأقسام والمنتجات في ملف JSON واحد</p></button>
          <button onClick={exportCsv} className="text-right rounded-3xl bg-white border border-black/5 p-6 shadow-sm hover:-translate-y-1 transition-transform"><FileSpreadsheet className="text-[#6f7a5b] mb-4" /><h2 className="font-display font-bold">تصدير Excel / CSV</h2><p className="text-sm text-stone mt-2">ملف بسيط تفتحه وتعدله في Excel</p></button>
          <button disabled={busy} onClick={() => inputRef.current?.click()} className="text-right rounded-3xl bg-[#d7b66f]/18 border border-[#d7b66f]/30 p-6 hover:-translate-y-1 transition-transform disabled:opacity-50"><Upload className="text-[#8d7444] mb-4" /><h2 className="font-display font-bold">استيراد CSV</h2><p className="text-sm text-stone mt-2">يضيف المنتجات ويعمل الأقسام الناقصة تلقائيًا</p></button>
          <input ref={inputRef} onChange={importCsv} type="file" accept=".csv,text/csv" className="hidden" />
        </section>

        <section className="rounded-3xl bg-white border border-black/5 p-5 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div><p className="text-sm text-[#8d7444] font-semibold">نقل جماعي</p><h2 className="font-display text-xl font-bold mt-1">حدد المنتجات وانقلها لقسم تاني مرة واحدة</h2></div>
            <div className="flex gap-2 items-center"><select value={moveCategoryId} onChange={(e) => setMoveCategoryId(e.target.value)} className="rounded-xl border border-stone-light/40 px-3 py-2 text-sm bg-white"><option value="">اختار القسم الجديد</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.ar}</option>)}</select><button disabled={busy || selectedProducts.length === 0 || !moveCategoryId} onClick={moveSelected} className="rounded-xl bg-[#11120f] text-white px-4 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-40"><FolderInput size={16} /> نقل المحدد</button></div>
          </div>

          <div className="rounded-2xl border border-stone-light/30 overflow-hidden">
            <div className="grid grid-cols-[44px_1fr_120px_160px] gap-2 bg-[#f6f2eb] px-4 py-3 text-xs font-semibold text-stone"><span></span><span>المنتج</span><span>السعر</span><span>القسم</span></div>
            {products.length === 0 ? <div className="p-8 text-center text-stone">مفيش منتجات لسه.</div> : products.map((p) => {
              const category = categories.find((c) => c.id === p.category_id)
              const selected = selectedIds.has(p.id)
              return <label key={p.id} className={`grid grid-cols-[44px_1fr_120px_160px] gap-2 items-center px-4 py-3 border-t border-stone-light/20 text-sm cursor-pointer ${selected ? 'bg-saffron/5' : 'bg-white'}`}><input type="checkbox" checked={selected} onChange={() => toggleSelected(p.id)} className="w-4 h-4 accent-[#d7b66f]" /><span className="font-medium truncate">{p.name.ar}</span><span>{p.price} ج.م</span><span className="text-stone truncate">{category?.name.ar || 'بدون قسم'}</span></label>
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap"><p className="text-sm text-stone">محدد: <strong>{selectedProducts.length}</strong> منتج</p><div className="flex gap-2"><button onClick={() => setSelectedIds(new Set(products.map((p) => p.id)))} className="rounded-full bg-paper-dim px-3 py-2 text-xs">تحديد الكل</button><button onClick={() => setSelectedIds(new Set())} className="rounded-full bg-paper-dim px-3 py-2 text-xs">إلغاء التحديد</button></div></div>
        </section>

        <section className="mt-6 rounded-3xl bg-[#11120f] text-white p-5 sm:p-6">
          <div className="flex items-center gap-3"><Save className="text-[#d7b66f]" /><div><h3 className="font-display font-bold">أفضل عادة قبل تعديل كبير</h3><p className="text-sm text-white/45 mt-1">نزّل نسخة JSON الأول. لو حصل أي خطأ يبقى عندك نسخة كاملة من بيانات المنيو.</p></div></div>
        </section>
      </main>
    </div>
  )
}
