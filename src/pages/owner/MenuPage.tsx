import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'
import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Flame, Sparkles, Leaf, Star, X, Save, ImageOff } from 'lucide-react'
import { getRestaurantByOwner, getRestaurantById } from '@/services/restaurants'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '@/services/categories'
import { listProducts, createProduct, updateProduct, deleteProduct, toggleAvailability } from '@/services/products'
import type { Category, Product, Restaurant } from '@/types/database'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ui/ImageUpload'
import { categorySchema, productSchema, type CategoryForm, type ProductForm } from '@/lib/validation'

interface MenuPageProps {
  restaurantIdOverride?: string
  backTo?: string
}

export default function MenuPage({ restaurantIdOverride, backTo = '/dashboard' }: MenuPageProps) {
  const { user } = useAuth()
  const params = useParams<{ id?: string }>()
  const adminRestaurantId = restaurantIdOverride ?? params.id
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null })
  const [productModal, setProductModal] = useState<{ open: boolean; editing: Product | null }>({ open: false, editing: null })
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({})
  const [savingProductId, setSavingProductId] = useState<string | null>(null)
  const [quickName, setQuickName] = useState('')
  const [quickPrice, setQuickPrice] = useState('')
  const [quickCategoryId, setQuickCategoryId] = useState('')
  const [quickSaving, setQuickSaving] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [pageMessage, setPageMessage] = useState<string | null>(null)

  const loadCategories = useCallback(async (restaurantId: string) => {
    const data = await listCategories(restaurantId)
    setCategories(data)
    if (!activeCategoryId && data.length) setActiveCategoryId(data[0].id)
    if (!quickCategoryId && data.length) setQuickCategoryId(data[0].id)
  }, [activeCategoryId, quickCategoryId])

  const loadProducts = useCallback(async (restaurantId: string) => {
    const data = await listProducts(restaurantId)
    setProducts(data)
    setPriceDrafts(Object.fromEntries(data.map((p) => [p.id, String(p.price)])))
  }, [])

  useEffect(() => {
    const fetcher = adminRestaurantId ? getRestaurantById(adminRestaurantId) : user ? getRestaurantByOwner(user.uid) : null
    if (!fetcher) return
    fetcher
      .then((r) => {
        setRestaurant(r)
        if (r) {
          loadCategories(r.id)
          loadProducts(r.id)
        }
      })
      .catch((err) => setPageError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, adminRestaurantId])

  useEffect(() => {
    if (activeCategoryId) setQuickCategoryId(activeCategoryId)
  }, [activeCategoryId])

  const visibleProducts = activeCategoryId ? products.filter((p) => p.category_id === activeCategoryId) : products

  async function handleMoveCategory(index: number, direction: -1 | 1) {
    if (!restaurant) return
    const next = [...categories]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setCategories(next)
    try {
      await reorderCategories(restaurant.id, next.map((c) => c.id))
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('هتحذف القسم ده وكل الأصناف اللي جواه؟') || !restaurant) return
    try {
      await deleteCategory(restaurant.id, id)
      await loadCategories(restaurant.id)
      await loadProducts(restaurant.id)
      if (activeCategoryId === id) setActiveCategoryId(null)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('هتحذف الصنف ده؟') || !restaurant) return
    try {
      await deleteProduct(restaurant.id, id)
      await loadProducts(restaurant.id)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    }
  }

  async function saveQuickPrice(product: Product) {
    if (!restaurant) return
    const nextPrice = Number(priceDrafts[product.id])
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      setPageError('اكتب سعر صحيح')
      return
    }
    setSavingProductId(product.id)
    setPageError(null)
    try {
      await updateProduct(restaurant.id, product.id, { price: nextPrice })
      setProducts((current) => current.map((p) => p.id === product.id ? { ...p, price: nextPrice } : p))
      setPageMessage(`تم تحديث سعر ${product.name.ar}`)
      window.setTimeout(() => setPageMessage(null), 2200)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'تعذر تحديث السعر')
    } finally {
      setSavingProductId(null)
    }
  }

  async function quickAddProduct() {
    if (!restaurant) return
    if (!quickName.trim()) {
      setPageError('اكتب اسم الصنف')
      return
    }
    if (!quickCategoryId) {
      setPageError('اختار قسم للصنف')
      return
    }
    const price = Number(quickPrice)
    if (!Number.isFinite(price) || price < 0) {
      setPageError('اكتب سعر صحيح')
      return
    }

    setQuickSaving(true)
    setPageError(null)
    try {
      const liveUid = auth.currentUser?.uid ?? restaurant.owner_id ?? null
      await createProduct(restaurant.id, liveUid, {
        category_id: quickCategoryId,
        name: { ar: quickName.trim(), en: '' },
        description: { ar: '' },
        price,
        discount_price: null,
        is_available: true,
        is_best_seller: false,
        is_new: false,
        is_spicy: false,
        is_vegetarian: false,
        images: [],
        ingredients: [],
        allergens: [],
        extras: [],
        sizes: [],
      })
      setQuickName('')
      setQuickPrice('')
      await loadProducts(restaurant.id)
      setPageMessage('تمت إضافة الصنف بسرعة — تقدر تضيف الصورة والتفاصيل في أي وقت')
      window.setTimeout(() => setPageMessage(null), 3000)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'تعذر إضافة الصنف')
    } finally {
      setQuickSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-paper border-b border-stone-light/40 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to={backTo} className="text-stone hover:text-ink transition-colors"><ArrowRight size={20} /></Link>
          <div className="flex-1">
            <h1 className="font-display text-lg font-semibold">الأقسام والأصناف {restaurant && adminRestaurantId ? `— ${restaurant.name}` : ''}</h1>
            <p className="text-xs text-stone mt-0.5">ضيف بسرعة، عدّل السعر من نفس الكارت، وشغّل أو اخفي المنتج بضغطة</p>
          </div>
          {restaurant?.slug && <a href={`${import.meta.env.BASE_URL}m/${restaurant.slug}`} target="_blank" rel="noreferrer" className="hidden sm:inline-flex rounded-full bg-ink text-paper px-4 py-2 text-xs font-semibold">عرض المنيو</a>}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-[260px_1fr] gap-6">
        {pageError && <div className="md:col-span-2 rounded-xl bg-sumac/10 text-sumac text-sm px-4 py-3">{pageError}</div>}
        {pageMessage && <div className="md:col-span-2 rounded-xl bg-zaytoon/10 text-zaytoon text-sm px-4 py-3">{pageMessage}</div>}

        <aside className="rounded-2xl bg-paper border border-stone-light/30 p-4 h-fit md:sticky md:top-24">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">الأقسام</h2>
            <button onClick={() => setCategoryModal({ open: true, editing: null })} className="text-saffron-dim hover:text-saffron-dim/80" aria-label="إضافة قسم"><Plus size={18} /></button>
          </div>
          <ul className="flex flex-col gap-1">
            <li><button onClick={() => setActiveCategoryId(null)} className={`w-full text-right rounded-lg px-3 py-2 text-sm transition-colors ${activeCategoryId === null ? 'bg-saffron/15 text-saffron-dim font-medium' : 'hover:bg-paper-dim'}`}>كل الأصناف</button></li>
            {categories.map((cat, index) => (
              <li key={cat.id} className="group flex items-center gap-1">
                <button onClick={() => setActiveCategoryId(cat.id)} className={`flex-1 text-right rounded-lg px-3 py-2 text-sm transition-colors ${activeCategoryId === cat.id ? 'bg-saffron/15 text-saffron-dim font-medium' : 'hover:bg-paper-dim'}`}>{cat.name.ar}{!cat.is_visible && <span className="text-stone-light text-xs mr-1">(مخفي)</span>}</button>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button onClick={() => handleMoveCategory(index, -1)} className="p-1 text-stone hover:text-ink" aria-label="لأعلى"><ChevronUp size={14} /></button>
                  <button onClick={() => handleMoveCategory(index, 1)} className="p-1 text-stone hover:text-ink" aria-label="لأسفل"><ChevronDown size={14} /></button>
                  <button onClick={() => setCategoryModal({ open: true, editing: cat })} className="p-1 text-stone hover:text-ink" aria-label="تعديل"><Pencil size={14} /></button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-stone hover:text-sumac" aria-label="حذف"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
          {categories.length === 0 && <button onClick={() => setCategoryModal({ open: true, editing: null })} className="w-full mt-3 rounded-xl border border-dashed border-saffron/50 bg-saffron/10 px-3 py-3 text-sm font-semibold text-saffron-dim">+ اعمل أول قسم</button>}
        </aside>

        <section>
          <div className="rounded-3xl bg-ink text-paper p-5 mb-5 shadow-xl">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div>
                <p className="font-display font-semibold">إضافة سريعة</p>
                <p className="text-xs text-stone-light mt-1">اسم + سعر + قسم فقط، وباقي التفاصيل تقدر تضيفها بعدين</p>
              </div>
              <button onClick={() => setProductModal({ open: true, editing: null })} className="text-xs rounded-full border border-white/15 px-3 py-2">إضافة بكل التفاصيل</button>
            </div>
            <div className="grid sm:grid-cols-[1fr_150px_180px_auto] gap-2">
              <input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="اسم الصنف" className="rounded-xl bg-white/10 border border-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-white/35" />
              <input value={quickPrice} onChange={(e) => setQuickPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="السعر" className="rounded-xl bg-white/10 border border-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-white/35" />
              <select value={quickCategoryId} onChange={(e) => setQuickCategoryId(e.target.value)} className="rounded-xl bg-[#272822] border border-white/10 px-3 py-2.5 text-sm outline-none"><option value="">اختار القسم</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.ar}</option>)}</select>
              <button disabled={quickSaving || categories.length === 0} onClick={quickAddProduct} className="rounded-xl bg-saffron text-ink px-4 py-2.5 text-sm font-bold disabled:opacity-40">{quickSaving ? 'جارِ الإضافة...' : '+ إضافة'}</button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{activeCategoryId ? categories.find((c) => c.id === activeCategoryId)?.name.ar : 'كل الأصناف'}<span className="text-stone text-sm font-normal mr-2">({visibleProducts.length})</span></h2>
            <Button onClick={() => setProductModal({ open: true, editing: null })} className="text-sm py-2 px-4"><Plus size={16} /> صنف جديد</Button>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="rounded-2xl bg-paper border border-dashed border-stone-light/50 p-10 text-center text-stone">مفيش أصناف هنا لسه — استخدم الإضافة السريعة فوق.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {visibleProducts.map((p) => {
                const image = p.images?.[0]?.url
                const draft = priceDrafts[p.id] ?? String(p.price)
                const priceChanged = Number(draft) !== Number(p.price)
                return (
                  <div key={p.id} className={`rounded-3xl bg-paper border p-4 transition-all ${p.is_available ? 'border-stone-light/30' : 'border-sumac/20 opacity-75'}`}>
                    <div className="flex gap-3">
                      <div className="w-24 h-24 shrink-0 rounded-2xl bg-paper-dim overflow-hidden border border-stone-light/20 flex items-center justify-center">
                        {image ? <img src={image} alt={p.name.ar} className="w-full h-full object-cover" /> : <div className="text-center text-stone-light"><ImageOff size={20} className="mx-auto" /><span className="text-[10px]">بدون صورة</span></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold flex items-center gap-1.5 flex-wrap">{p.name.ar}{p.is_best_seller && <Star size={14} className="text-saffron" fill="currentColor" />}{p.is_new && <Sparkles size={14} className="text-zaytoon" />}{p.is_spicy && <Flame size={14} className="text-sumac" />}{p.is_vegetarian && <Leaf size={14} className="text-zaytoon" />}</h3>
                            {p.description?.ar && <p className="text-xs text-stone mt-1 line-clamp-2">{p.description.ar}</p>}
                          </div>
                          <button
                            onClick={async () => {
                              if (!restaurant) return
                              try {
                                await toggleAvailability(restaurant.id, p.id, !p.is_available)
                                setProducts((current) => current.map((item) => item.id === p.id ? { ...item, is_available: !p.is_available } : item))
                              } catch (err) {
                                setPageError(err instanceof Error ? err.message : 'تعذر تحديث حالة المنتج')
                              }
                            }}
                            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${p.is_available ? 'bg-zaytoon' : 'bg-stone-light'}`}
                            aria-label={p.is_available ? 'إخفاء المنتج' : 'إتاحة المنتج'}
                            title={p.is_available ? 'المنتج ظاهر للعملاء' : 'المنتج مخفي'}
                          >
                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${p.is_available ? 'right-6' : 'right-1'}`} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="relative flex-1">
                            <input value={draft} onChange={(e) => setPriceDrafts({ ...priceDrafts, [p.id]: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter' && priceChanged) saveQuickPrice(p) }} type="number" min="0" step="0.01" className={`w-full rounded-xl border py-2 pr-3 pl-11 text-sm outline-none ${priceChanged ? 'border-saffron bg-saffron/5' : 'border-stone-light/30'}`} />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-stone">ج.م</span>
                          </div>
                          <button disabled={!priceChanged || savingProductId === p.id} onClick={() => saveQuickPrice(p)} className="w-10 h-10 rounded-xl bg-ink text-paper flex items-center justify-center disabled:opacity-25" title="حفظ السعر"><Save size={16} /></button>
                        </div>
                        {p.discount_price ? <p className="text-[11px] text-saffron-dim mt-1">سعر الخصم الحالي: {p.discount_price} ج.م</p> : null}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-light/20 flex items-center justify-between gap-2">
                      <span className={`text-xs font-medium ${p.is_available ? 'text-zaytoon' : 'text-sumac'}`}>{p.is_available ? 'ظاهر للعملاء' : 'مخفي من المنيو'}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setProductModal({ open: true, editing: p })} className="rounded-full bg-paper-dim px-3 py-2 text-xs flex items-center gap-1"><Pencil size={14} /> التفاصيل</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="rounded-full bg-sumac/10 text-sumac p-2" aria-label="حذف"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <CategoryModal open={categoryModal.open} editing={categoryModal.editing} restaurantId={restaurant?.id} ownerId={restaurant?.owner_id ?? null} nextSortOrder={categories.length} onClose={() => setCategoryModal({ open: false, editing: null })} onSaved={() => restaurant && loadCategories(restaurant.id)} />
      <ProductModal open={productModal.open} editing={productModal.editing} restaurantId={restaurant?.id} ownerId={restaurant?.owner_id ?? null} categories={categories} defaultCategoryId={activeCategoryId} onClose={() => setProductModal({ open: false, editing: null })} onSaved={() => restaurant && loadProducts(restaurant.id)} />
    </div>
  )
}

function CategoryModal({ open, editing, restaurantId, ownerId, nextSortOrder, onClose, onSaved }: { open: boolean; editing: Category | null; restaurantId?: string; ownerId: string | null; nextSortOrder: number; onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) })
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) reset({ nameAr: editing?.name.ar ?? '', nameEn: editing?.name.en ?? '' })
    setFormError(null)
  }, [open, editing, reset])

  async function onSubmit(values: CategoryForm) {
    try {
      if (editing && restaurantId) await updateCategory(restaurantId, editing.id, { name: { ar: values.nameAr, en: values.nameEn } })
      else if (restaurantId) {
        const liveUid = auth.currentUser?.uid ?? ownerId
        await createCategory(restaurantId, liveUid, values.nameAr, values.nameEn ?? '', nextSortOrder)
      }
      onSaved(); onClose()
    } catch (err) {
      const base = err instanceof Error ? err.message : 'حصل خطأ، حاول تاني'
      setFormError(`${base} || DEBUG2: liveUid=${auth.currentUser?.uid} restaurantOwnerId=${ownerId} restaurantId=${restaurantId}`)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'تعديل القسم' : 'قسم جديد'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="اسم القسم بالعربي" error={errors.nameAr?.message} {...register('nameAr')} />
        <Input label="اسم القسم بالإنجليزي (اختياري)" {...register('nameEn')} />
        {formError && <p className="text-sm text-sumac">{formError}</p>}
        <Button type="submit" loading={isSubmitting} className="w-full mt-2">حفظ</Button>
      </form>
    </Modal>
  )
}

function ProductModal({ open, editing, restaurantId, ownerId, categories, defaultCategoryId, onClose, onSaved }: { open: boolean; editing: Product | null; restaurantId?: string; ownerId: string | null; categories: Category[]; defaultCategoryId: string | null; onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductForm>({ resolver: zodResolver(productSchema) })
  const [images, setImages] = useState<string[]>([])
  const [ingredientsText, setIngredientsText] = useState('')
  const [allergensText, setAllergensText] = useState('')
  const [extras, setExtras] = useState<{ name: string; price: string }[]>([])
  const [sizes, setSizes] = useState<{ name: string; price: string }[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      reset({
        nameAr: editing?.name.ar ?? '', nameEn: editing?.name.en ?? '', descriptionAr: editing?.description?.ar ?? '',
        categoryId: editing?.category_id ?? defaultCategoryId ?? '', price: editing?.price ?? undefined,
        discountPrice: editing?.discount_price != null ? String(editing.discount_price) : '',
        isBestSeller: editing?.is_best_seller ?? false, isNew: editing?.is_new ?? false,
        isSpicy: editing?.is_spicy ?? false, isVegetarian: editing?.is_vegetarian ?? false,
      })
      setImages(editing?.images?.map((i) => i.url) ?? [])
      setIngredientsText(editing?.ingredients?.join('، ') ?? '')
      setAllergensText(editing?.allergens?.join('، ') ?? '')
      setExtras(editing?.extras?.map((e) => ({ name: e.name, price: String(e.price) })) ?? [])
      setSizes(editing?.sizes?.map((s) => ({ name: s.name, price: String(s.price) })) ?? [])
      setFormError(null)
    }
  }, [open, editing, defaultCategoryId, reset])

  async function onSubmit(values: ProductForm) {
    const payload = {
      category_id: values.categoryId,
      name: { ar: values.nameAr, en: values.nameEn },
      description: { ar: values.descriptionAr ?? '' },
      price: Number(values.price),
      discount_price: values.discountPrice === '' ? null : Number(values.discountPrice),
      is_available: editing?.is_available ?? true,
      is_best_seller: values.isBestSeller ?? false,
      is_new: values.isNew ?? false,
      is_spicy: values.isSpicy ?? false,
      is_vegetarian: values.isVegetarian ?? false,
      images: images.map((url, i) => ({ id: `img-${i}`, url, sort_order: i })),
      ingredients: ingredientsText.split('،').map((s) => s.trim()).filter(Boolean),
      allergens: allergensText.split('،').map((s) => s.trim()).filter(Boolean),
      extras: extras.filter((e) => e.name.trim()).map((e) => ({ name: e.name.trim(), price: Number(e.price) || 0 })),
      sizes: sizes.filter((s) => s.name.trim()).map((s) => ({ name: s.name.trim(), price: Number(s.price) || 0 })),
    }
    try {
      if (editing && restaurantId) await updateProduct(restaurantId, editing.id, payload)
      else if (restaurantId) {
        const liveUid = auth.currentUser?.uid ?? ownerId
        await createProduct(restaurantId, liveUid, payload)
      }
      onSaved(); onClose()
    } catch (err) { setFormError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني') }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'تعديل الصنف' : 'صنف جديد'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">صور الصنف (تقدر تضيف أكتر من واحدة)</label>
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-light/40"><img src={url} alt="" className="w-full h-full object-cover" /><button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 left-1 bg-ink/70 text-paper rounded-full p-0.5" aria-label="حذف الصورة"><X size={12} /></button></div>)}
            <ImageUpload label="" value={null} onChange={(url) => url && setImages([...images, url])} folder={restaurantId ? `restaurants/${restaurantId}/products` : undefined} aspect="square" />
          </div>
        </div>

        <Input label="اسم الصنف بالعربي" error={errors.nameAr?.message} {...register('nameAr')} />
        <Input label="اسم الصنف بالإنجليزي (اختياري)" {...register('nameEn')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">القسم</label>
          <select {...register('categoryId')} className="rounded-xl border border-stone-light/60 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron/50"><option value="">اختار القسم</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.ar}</option>)}</select>
          {errors.categoryId && <span className="text-sm text-sumac">{errors.categoryId.message}</span>}
        </div>
        <Input label="الوصف (اختياري)" {...register('descriptionAr')} />
        <div className="grid grid-cols-2 gap-4"><Input label="السعر" type="number" step="0.01" error={errors.price?.message} {...register('price')} /><Input label="سعر بعد الخصم (اختياري)" type="number" step="0.01" {...register('discountPrice')} /></div>
        <Input label="المكونات (افصل بفاصلة عربي ،)" value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} placeholder="عيش، جبنة، طماطم" />
        <Input label="مسببات الحساسية (اختياري)" value={allergensText} onChange={(e) => setAllergensText(e.target.value)} placeholder="جلوتين، مكسرات، لاكتوز" />

        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">الأحجام (اختياري)</label>
          <div className="flex flex-col gap-2">
            {sizes.map((s, i) => <div key={i} className="flex items-center gap-2"><input value={s.name} onChange={(e) => setSizes(sizes.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="وسط" className="flex-1 rounded-lg border border-stone-light/50 px-3 py-1.5 text-sm" /><input value={s.price} onChange={(e) => setSizes(sizes.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x))} type="number" placeholder="السعر" className="w-24 rounded-lg border border-stone-light/50 px-3 py-1.5 text-sm" /><button type="button" onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))} className="text-stone hover:text-sumac"><X size={16} /></button></div>)}
            <button type="button" onClick={() => setSizes([...sizes, { name: '', price: '' }])} className="text-xs text-saffron-dim font-medium self-start">+ ضيف حجم</button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">الإضافات (اختياري)</label>
          <div className="flex flex-col gap-2">
            {extras.map((ex, i) => <div key={i} className="flex items-center gap-2"><input value={ex.name} onChange={(e) => setExtras(extras.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="جبنة إضافية" className="flex-1 rounded-lg border border-stone-light/50 px-3 py-1.5 text-sm" /><input value={ex.price} onChange={(e) => setExtras(extras.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x))} type="number" placeholder="السعر" className="w-24 rounded-lg border border-stone-light/50 px-3 py-1.5 text-sm" /><button type="button" onClick={() => setExtras(extras.filter((_, idx) => idx !== i))} className="text-stone hover:text-sumac"><X size={16} /></button></div>)}
            <button type="button" onClick={() => setExtras([...extras, { name: '', price: '' }])} className="text-xs text-saffron-dim font-medium self-start">+ ضيف إضافة</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" {...register('isBestSeller')} /> الأكثر مبيعًا</label>
          <label className="flex items-center gap-2"><input type="checkbox" {...register('isNew')} /> جديد</label>
          <label className="flex items-center gap-2"><input type="checkbox" {...register('isSpicy')} /> حار</label>
          <label className="flex items-center gap-2"><input type="checkbox" {...register('isVegetarian')} /> نباتي</label>
        </div>
        {formError && <p className="text-sm text-sumac">{formError}</p>}
        <Button type="submit" loading={isSubmitting} className="w-full mt-2">حفظ</Button>
      </form>
    </Modal>
  )
}
