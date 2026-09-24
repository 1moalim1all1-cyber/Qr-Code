import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ImagePlus, LoaderCircle, PackagePlus, Pencil, Plus, Save, Search, Sparkles, Trash2, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'
import { getRestaurantByOwner } from '@/services/restaurants'
import { listCategories } from '@/services/categories'
import { createProduct, deleteProduct, listProducts, updateProduct } from '@/services/products'
import type { Category, Product, ProductSpecification, ProductVariant, Restaurant } from '@/types/database'
import ImageUpload from '@/components/ui/ImageUpload'

type VariantDraft = { id: string; label: string; price: string; compareAt: string; stock: string; options: string; sku: string }
type SpecDraft = { name: string; value: string }

const emptyForm = {
  name: '', description: '', categoryId: '', brand: '', barcode: '', price: '', compareAtPrice: '',
  colors: '', badges: '', featured: false, available: true, isNew: false, bestSeller: false,
}

export default function ProductStudioPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState<string[]>([])
  const [specs, setSpecs] = useState<SpecDraft[]>([])
  const [variants, setVariants] = useState<VariantDraft[]>([])

  async function load(restaurantId: string) {
    const [cats, prods] = await Promise.all([listCategories(restaurantId), listProducts(restaurantId)])
    setCategories(cats)
    setProducts(prods)
  }

  useEffect(() => {
    if (!user) return
    getRestaurantByOwner(user.uid)
      .then(async (r) => {
        setRestaurant(r)
        if (r) await load(r.id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر تحميل بيانات النشاط'))
      .finally(() => setLoading(false))
  }, [user])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => [p.name.ar, p.brand, p.barcode, p.description?.ar].some((v) => String(v || '').toLowerCase().includes(q)))
  }, [products, search])

  function resetForm() {
    setEditing(null)
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' })
    setImages([])
    setSpecs([])
    setVariants([])
    setError(null)
  }

  function startEdit(product: Product) {
    setEditing(product)
    setForm({
      name: product.name.ar,
      description: product.description?.ar || '',
      categoryId: product.category_id || categories[0]?.id || '',
      brand: product.brand || '',
      barcode: product.barcode || '',
      price: String(product.price ?? ''),
      compareAtPrice: String(product.compare_at_price ?? product.price ?? ''),
      colors: (product.colors || []).join('، '),
      badges: (product.badges || []).join('، '),
      featured: Boolean(product.is_featured),
      available: product.is_available !== false,
      isNew: Boolean(product.is_new),
      bestSeller: Boolean(product.is_best_seller),
    })
    setImages((product.images || []).map((i) => i.url))
    setSpecs((product.specifications || []).map((s) => ({ name: s.name, value: s.value })))
    setVariants((product.variants || []).map((v) => ({
      id: v.id,
      label: v.label || '',
      price: String(v.price ?? ''),
      compareAt: v.compare_at_price == null ? '' : String(v.compare_at_price),
      stock: v.stock == null ? '' : String(v.stock),
      sku: v.sku || '',
      options: Object.entries(v.options || {}).map(([k, val]) => `${k}=${val}`).join(', '),
    })))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function parseOptions(text: string) {
    const entries = text.split(',').map((x) => x.trim()).filter(Boolean).map((part) => {
      const [key, ...rest] = part.split('=')
      return [key?.trim(), rest.join('=').trim()] as const
    }).filter(([k, v]) => k && v)
    return Object.fromEntries(entries)
  }

  async function saveProduct() {
    if (!restaurant) return
    if (!form.name.trim()) return setError('اكتب اسم المنتج')
    if (!form.categoryId) return setError('اختار القسم')
    const price = Number(form.price)
    if (!Number.isFinite(price) || price < 0) return setError('اكتب سعر صحيح')

    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const compareAt = form.compareAtPrice.trim() ? Number(form.compareAtPrice) : null
      const discountPercent = compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : null
      const normalizedSpecs: ProductSpecification[] = specs.filter((s) => s.name.trim() && s.value.trim()).map((s) => ({ name: s.name.trim(), value: s.value.trim() }))
      const normalizedVariants: ProductVariant[] = variants.filter((v) => v.label.trim() || v.options.trim()).map((v, index) => ({
        id: v.id || `variant-${Date.now()}-${index}`,
        label: v.label.trim() || null,
        options: parseOptions(v.options),
        price: Number(v.price) || price,
        compare_at_price: v.compareAt.trim() ? Number(v.compareAt) : null,
        stock: v.stock.trim() === '' ? null : Math.max(0, Math.floor(Number(v.stock) || 0)),
        sku: v.sku.trim() || null,
        is_available: v.stock.trim() === '' || Number(v.stock) > 0,
        image_url: null,
      }))
      const colors = form.colors.split('،').map((x) => x.trim()).filter(Boolean)
      const badges = form.badges.split('،').map((x) => x.trim()).filter(Boolean)
      const optionNames = Array.from(new Set(normalizedVariants.flatMap((v) => Object.keys(v.options))))
      const payload = {
        category_id: form.categoryId,
        barcode: form.barcode.trim() || null,
        brand: form.brand.trim() || null,
        name: { ar: form.name.trim(), en: '' },
        description: { ar: form.description.trim(), en: '' },
        price,
        discount_price: compareAt && compareAt > price ? price : null,
        compare_at_price: compareAt,
        discount_percent: discountPercent,
        is_available: form.available,
        is_best_seller: form.bestSeller,
        is_new: form.isNew,
        is_spicy: false,
        is_vegetarian: false,
        is_featured: form.featured,
        images: images.map((url, index) => ({ id: `img-${Date.now()}-${index}`, url, sort_order: index })),
        ingredients: [], allergens: [], extras: [], sizes: [],
        colors, badges, specifications: normalizedSpecs, variants: normalizedVariants,
        variant_options: optionNames.map((name) => ({ id: name, label: name, value: name })),
      }

      if (editing) await updateProduct(restaurant.id, editing.id, payload)
      else await createProduct(restaurant.id, auth.currentUser?.uid ?? restaurant.owner_id, payload)
      await load(restaurant.id)
      setMessage(editing ? 'تم تحديث المنتج بنجاح' : 'تمت إضافة المنتج بنجاح')
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر حفظ المنتج')
    } finally {
      setSaving(false)
    }
  }

  async function removeProduct(product: Product) {
    if (!restaurant || !window.confirm(`حذف ${product.name.ar}؟`)) return
    await deleteProduct(restaurant.id, product.id)
    await load(restaurant.id)
    if (editing?.id === product.id) resetForm()
  }

  if (loading) return <div className="min-h-screen bg-[#f4efe7] flex items-center justify-center gap-2"><LoaderCircle className="animate-spin" /> جارِ التحميل...</div>
  if (!restaurant) return <div className="min-h-screen bg-[#f4efe7] flex items-center justify-center">تعذّر العثور على النشاط.</div>

  return (
    <div className="min-h-screen bg-[#f4efe7]" dir="rtl">
      <header className="sticky top-0 z-30 bg-[#11120f] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link to="/dashboard/menu" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><ArrowRight size={19} /></Link>
          <div className="flex-1"><p className="text-xs text-white/40">{restaurant.name}</p><h1 className="font-display text-xl font-bold flex items-center gap-2"><Sparkles size={19} className="text-[#d7b66f]" /> إدارة المنتجات الاحترافية</h1></div>
          <a href={`${import.meta.env.BASE_URL}m/${restaurant.slug}`} target="_blank" rel="noreferrer" className="rounded-xl bg-[#d7b66f] text-[#171714] px-4 py-2 text-sm font-bold">عرض المتجر</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-6 grid xl:grid-cols-[430px_1fr] gap-6 items-start">
        <section className="rounded-[28px] bg-white border border-black/5 shadow-sm p-5 xl:sticky xl:top-24">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div><h2 className="font-display text-lg font-bold">{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2><p className="text-xs text-stone mt-1">كل الحقول الإضافية اختيارية.</p></div>
            {editing && <button onClick={resetForm} className="rounded-full bg-stone-100 px-3 py-2 text-xs">إلغاء التعديل</button>}
          </div>

          <div className="space-y-4">
            <Field label="اسم المنتج *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="مثال: iPhone 17 Pro Max" /></Field>
            <Field label="الوصف"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-20" placeholder="256GB – Titanium" /></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="القسم *"><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input"><option value="">اختار القسم</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.ar}</option>)}</select></Field><Field label="الماركة"><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" placeholder="Apple" /></Field></div>
            <div className="grid grid-cols-2 gap-3"><Field label="السعر الحالي *"><input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" /></Field><Field label="السعر قبل الخصم"><input type="number" min="0" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="input" /></Field></div>
            <Field label="باركود / SKU عام"><input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="input" /></Field>

            <div className="rounded-2xl bg-[#f8f5ef] p-4"><div className="flex items-center justify-between mb-3"><div><p className="font-bold text-sm">صور المنتج</p><p className="text-[11px] text-stone mt-1">ارفع أكتر من صورة، وأول صورة هي الرئيسية.</p></div><ImagePlus size={18} className="text-[#a78545]" /></div><div className="flex gap-2 flex-wrap">{images.map((url, i) => <div key={`${url}-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border"><img src={url} className="w-full h-full object-cover" alt="" /><button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 left-1 bg-black/70 text-white rounded-full p-1"><X size={11} /></button></div>)}<ImageUpload label="" value={null} onChange={(url) => url && setImages([...images, url])} folder={`restaurants/${restaurant.id}/products`} aspect="square" /></div></div>

            <div className="grid grid-cols-2 gap-3"><Field label="الألوان"><input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="input" placeholder="أسود، أبيض، أزرق" /></Field><Field label="Badges"><input value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} className="input" placeholder="عرض، حصري" /></Field></div>

            <EditorBox title="المواصفات" subtitle="مثال: الرام = 8GB">
              {specs.map((s, i) => <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2"><input value={s.name} onChange={(e) => setSpecs(specs.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} className="input" placeholder="المواصفة" /><input value={s.value} onChange={(e) => setSpecs(specs.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} className="input" placeholder="القيمة" /><button onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}><X size={16} /></button></div>)}
              <button onClick={() => setSpecs([...specs, { name: '', value: '' }])} className="small-action"><Plus size={14} /> إضافة مواصفة</button>
            </EditorBox>

            <EditorBox title="Variants" subtitle="كل سعة/مقاس/لون ممكن يكون له سعر ومخزون مختلف.">
              {variants.map((v, i) => <div key={v.id || i} className="rounded-2xl border border-black/8 p-3 space-y-2"><div className="grid grid-cols-2 gap-2"><input value={v.label} onChange={(e) => setVariants(variants.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} className="input" placeholder="مثال: 256GB أسود" /><input value={v.options} onChange={(e) => setVariants(variants.map((x, idx) => idx === i ? { ...x, options: e.target.value } : x))} className="input" placeholder="السعة=256GB, اللون=أسود" /></div><div className="grid grid-cols-3 gap-2"><input type="number" value={v.price} onChange={(e) => setVariants(variants.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x))} className="input" placeholder="السعر" /><input type="number" value={v.stock} onChange={(e) => setVariants(variants.map((x, idx) => idx === i ? { ...x, stock: e.target.value } : x))} className="input" placeholder="المخزون" /><input value={v.sku} onChange={(e) => setVariants(variants.map((x, idx) => idx === i ? { ...x, sku: e.target.value } : x))} className="input" placeholder="SKU" /></div><div className="flex justify-between"><input type="number" value={v.compareAt} onChange={(e) => setVariants(variants.map((x, idx) => idx === i ? { ...x, compareAt: e.target.value } : x))} className="input max-w-[180px]" placeholder="السعر قبل الخصم" /><button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-600 text-xs flex items-center gap-1"><Trash2 size={13} /> حذف الاختيار</button></div></div>)}
              <button onClick={() => setVariants([...variants, { id: `draft-${Date.now()}`, label: '', price: form.price, compareAt: '', stock: '', options: '', sku: '' }])} className="small-action"><Plus size={14} /> إضافة Variant</button>
            </EditorBox>

            <div className="grid grid-cols-2 gap-2 text-sm"><Toggle label="Featured" checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} /><Toggle label="متوفر" checked={form.available} onChange={(v) => setForm({ ...form, available: v })} /><Toggle label="جديد" checked={form.isNew} onChange={(v) => setForm({ ...form, isNew: v })} /><Toggle label="الأكثر مبيعًا" checked={form.bestSeller} onChange={(v) => setForm({ ...form, bestSeller: v })} /></div>

            {error && <div className="rounded-xl bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
            {message && <div className="rounded-xl bg-green-50 text-green-700 px-3 py-2 text-sm">{message}</div>}
            <button onClick={saveProduct} disabled={saving} className="w-full rounded-2xl bg-[#171714] text-white py-3.5 font-bold flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <LoaderCircle size={17} className="animate-spin" /> : editing ? <Save size={17} /> : <PackagePlus size={17} />}{editing ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
          </div>
        </section>

        <section>
          <div className="rounded-[28px] bg-[#11120f] text-white p-5 mb-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><p className="text-xs text-white/40">إجمالي المنتجات</p><p className="text-3xl font-bold mt-1">{products.length}</p></div><div className="relative sm:w-96"><Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المنتج أو الماركة أو الباركود" className="w-full rounded-xl bg-white/10 border border-white/10 py-2.5 pr-10 pl-3 text-sm outline-none" /></div></div></div>

          <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filtered.map((product) => {
              const image = product.images?.[0]?.url
              const oldPrice = product.compare_at_price && product.compare_at_price > product.price ? product.compare_at_price : null
              return <article key={product.id} className="rounded-[26px] bg-white border border-black/5 overflow-hidden shadow-sm hover:-translate-y-1 transition-transform"><div className="aspect-[4/3] bg-[#eee8df] relative overflow-hidden">{image ? <img src={image} alt={product.name.ar} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-stone"><ImagePlus /></div>}{product.is_featured && <span className="absolute top-3 right-3 bg-[#171714] text-[#ead19a] rounded-full px-2.5 py-1 text-[10px]">Featured</span>}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-xs text-stone">{product.brand || categories.find((c) => c.id === product.category_id)?.name.ar || 'منتج'}</p><h3 className="font-bold mt-1 truncate">{product.name.ar}</h3></div><span className={`text-[10px] rounded-full px-2 py-1 ${product.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{product.is_available ? 'متوفر' : 'غير متوفر'}</span></div><div className="mt-3 flex items-end gap-2"><span className="font-bold text-lg">{product.price} ج.م</span>{oldPrice && <span className="text-xs text-stone line-through">{oldPrice}</span>}{product.discount_percent ? <span className="text-xs text-red-600">-{product.discount_percent}%</span> : null}</div>{product.variants && product.variants.length > 0 && <p className="text-xs text-stone mt-2">{product.variants.length} اختيارات مختلفة</p>}<div className="mt-4 pt-3 border-t flex gap-2"><button onClick={() => startEdit(product)} className="flex-1 rounded-xl bg-[#f3ede3] py-2 text-xs font-bold flex items-center justify-center gap-1"><Pencil size={13} /> تعديل</button><button onClick={() => removeProduct(product)} className="w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><Trash2 size={14} /></button></div></div></article>
            })}
          </div>
          {filtered.length === 0 && <div className="text-center text-stone py-20">مفيش منتجات مطابقة.</div>}
        </section>
      </main>

      <style>{`.input{width:100%;border:1px solid rgba(0,0,0,.12);border-radius:12px;padding:.65rem .8rem;background:white;outline:none;font-size:.875rem}.input:focus{border-color:#d7b66f;box-shadow:0 0 0 3px rgba(215,182,111,.12)}.small-action{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;background:#171714;color:white;padding:.55rem .8rem;font-size:.75rem;font-weight:700}`}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="text-sm font-semibold block mb-1.5">{label}</span>{children}</label> }
function EditorBox({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <div className="rounded-2xl border border-black/8 p-4"><div className="mb-3"><p className="text-sm font-bold">{title}</p><p className="text-[11px] text-stone mt-1">{subtitle}</p></div><div className="space-y-2">{children}</div></div> }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="rounded-xl border border-black/8 px-3 py-2.5 flex items-center gap-2 bg-white"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}</label> }
