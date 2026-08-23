import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'
import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Flame, Sparkles, Leaf, Star } from 'lucide-react'
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

// This page has two entry points sharing the same UI:
//  - /dashboard/menu    (owner managing their own restaurant, via useAuth)
//  - /admin/clients/:id/menu (admin managing a client's restaurant by id)
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
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing: Category | null }>({
    open: false,
    editing: null,
  })
  const [productModal, setProductModal] = useState<{ open: boolean; editing: Product | null }>({
    open: false,
    editing: null,
  })

  const loadCategories = useCallback(async (restaurantId: string) => {
    const data = await listCategories(restaurantId)
    setCategories(data)
    if (!activeCategoryId && data.length) setActiveCategoryId(data[0].id)
  }, [activeCategoryId])

  const loadProducts = useCallback(async (restaurantId: string) => {
    const data = await listProducts(restaurantId)
    setProducts(data)
  }, [])

  const [pageError, setPageError] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to={backTo} className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="font-display text-lg font-semibold">
            الأقسام والأصناف {restaurant && adminRestaurantId ? `— ${restaurant.name}` : ''}
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-[260px_1fr] gap-6">
        {pageError && (
          <div className="md:col-span-2 rounded-xl bg-sumac/10 text-sumac text-sm px-4 py-3">{pageError}</div>
        )}
        {/* Categories sidebar */}
        <aside className="rounded-2xl bg-paper border border-stone-light/30 p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">الأقسام</h2>
            <button
              onClick={() => setCategoryModal({ open: true, editing: null })}
              className="text-saffron-dim hover:text-saffron-dim/80"
              aria-label="إضافة قسم"
            >
              <Plus size={18} />
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            <li>
              <button
                onClick={() => setActiveCategoryId(null)}
                className={`w-full text-right rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeCategoryId === null ? 'bg-saffron/15 text-saffron-dim font-medium' : 'hover:bg-paper-dim'
                }`}
              >
                كل الأصناف
              </button>
            </li>
            {categories.map((cat, index) => (
              <li key={cat.id} className="group flex items-center gap-1">
                <button
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`flex-1 text-right rounded-lg px-3 py-2 text-sm transition-colors ${
                    activeCategoryId === cat.id ? 'bg-saffron/15 text-saffron-dim font-medium' : 'hover:bg-paper-dim'
                  }`}
                >
                  {cat.name.ar}
                  {!cat.is_visible && <span className="text-stone-light text-xs mr-1">(مخفي)</span>}
                </button>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button onClick={() => handleMoveCategory(index, -1)} className="p-1 text-stone hover:text-ink" aria-label="لأعلى">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => handleMoveCategory(index, 1)} className="p-1 text-stone hover:text-ink" aria-label="لأسفل">
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => setCategoryModal({ open: true, editing: cat })}
                    className="p-1 text-stone hover:text-ink"
                    aria-label="تعديل"
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-stone hover:text-sumac" aria-label="حذف">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              {activeCategoryId ? categories.find((c) => c.id === activeCategoryId)?.name.ar : 'كل الأصناف'}
              <span className="text-stone text-sm font-normal mr-2">({visibleProducts.length})</span>
            </h2>
            <Button onClick={() => setProductModal({ open: true, editing: null })} className="text-sm py-2 px-4">
              <Plus size={16} />
              صنف جديد
            </Button>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="rounded-2xl bg-paper border border-dashed border-stone-light/50 p-10 text-center text-stone">
              مفيش أصناف هنا لسه — ابدأ بإضافة أول صنف.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {visibleProducts.map((p) => (
                <div key={p.id} className="rounded-2xl bg-paper border border-stone-light/30 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold flex items-center gap-1.5 flex-wrap">
                        {p.name.ar}
                        {p.is_best_seller && <Star size={14} className="text-saffron" fill="currentColor" />}
                        {p.is_new && <Sparkles size={14} className="text-zaytoon" />}
                        {p.is_spicy && <Flame size={14} className="text-sumac" />}
                        {p.is_vegetarian && <Leaf size={14} className="text-zaytoon" />}
                      </h3>
                      {p.description?.ar && <p className="text-sm text-stone mt-1">{p.description.ar}</p>}
                    </div>
                    {!p.is_available && (
                      <span className="text-xs bg-sumac/10 text-sumac rounded-full px-2 py-0.5 shrink-0">غير متاح</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      {p.discount_price ? (
                        <>
                          <span className="font-display font-semibold text-saffron-dim">{p.discount_price} ج.م</span>
                          <span className="text-sm text-stone-light line-through">{p.price} ج.م</span>
                        </>
                      ) : (
                        <span className="font-display font-semibold">{p.price} ج.م</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (!restaurant) return
                          await toggleAvailability(restaurant.id, p.id, !p.is_available)
                          loadProducts(restaurant.id)
                        }}
                        className="text-xs text-stone hover:text-ink underline underline-offset-2"
                      >
                        {p.is_available ? 'إخفاء' : 'إتاحة'}
                      </button>
                      <button
                        onClick={() => setProductModal({ open: true, editing: p })}
                        className="text-stone hover:text-ink"
                        aria-label="تعديل"
                      >
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-stone hover:text-sumac" aria-label="حذف">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <CategoryModal
        open={categoryModal.open}
        editing={categoryModal.editing}
        restaurantId={restaurant?.id}
        ownerId={restaurant?.owner_id ?? null}
        nextSortOrder={categories.length}
        onClose={() => setCategoryModal({ open: false, editing: null })}
        onSaved={() => restaurant && loadCategories(restaurant.id)}
      />

      <ProductModal
        open={productModal.open}
        editing={productModal.editing}
        restaurantId={restaurant?.id}
        ownerId={restaurant?.owner_id ?? null}
        categories={categories}
        defaultCategoryId={activeCategoryId}
        onClose={() => setProductModal({ open: false, editing: null })}
        onSaved={() => restaurant && loadProducts(restaurant.id)}
      />
    </div>
  )
}

function CategoryModal({
  open,
  editing,
  restaurantId,
  ownerId,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: Category | null
  restaurantId?: string
  ownerId: string | null
  nextSortOrder: number
  onClose: () => void
  onSaved: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) })
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) reset({ nameAr: editing?.name.ar ?? '', nameEn: editing?.name.en ?? '' })
    setFormError(null)
  }, [open, editing, reset])

  async function onSubmit(values: CategoryForm) {
    try {
      if (editing && restaurantId) {
        await updateCategory(restaurantId, editing.id, { name: { ar: values.nameAr, en: values.nameEn } })
      } else if (restaurantId) {
        // Use the freshest possible auth UID at the exact moment of write,
        // not a value captured earlier when the page first loaded.
        const liveUid = auth.currentUser?.uid ?? ownerId
        await createCategory(restaurantId, liveUid, values.nameAr, values.nameEn ?? '', nextSortOrder)
      }
      onSaved()
      onClose()
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
        <Button type="submit" loading={isSubmitting} className="w-full mt-2">
          حفظ
        </Button>
      </form>
    </Modal>
  )
}

function ProductModal({
  open,
  editing,
  restaurantId,
  ownerId,
  categories,
  defaultCategoryId,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: Product | null
  restaurantId?: string
  ownerId: string | null
  categories: Category[]
  defaultCategoryId: string | null
  onClose: () => void
  onSaved: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) })
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      reset({
        nameAr: editing?.name.ar ?? '',
        nameEn: editing?.name.en ?? '',
        descriptionAr: editing?.description?.ar ?? '',
        categoryId: editing?.category_id ?? defaultCategoryId ?? '',
        price: editing?.price ?? undefined,
        discountPrice: editing?.discount_price != null ? String(editing.discount_price) : '',
        isBestSeller: editing?.is_best_seller ?? false,
        isNew: editing?.is_new ?? false,
        isSpicy: editing?.is_spicy ?? false,
        isVegetarian: editing?.is_vegetarian ?? false,
      })
      setImageUrl(editing?.images?.[0]?.url ?? null)
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
      is_available: true,
      is_best_seller: values.isBestSeller ?? false,
      is_new: values.isNew ?? false,
      is_spicy: values.isSpicy ?? false,
      is_vegetarian: values.isVegetarian ?? false,
      images: imageUrl ? [{ id: 'main', url: imageUrl, sort_order: 0 }] : [],
    }
    try {
      if (editing && restaurantId) {
        await updateProduct(restaurantId, editing.id, payload)
      } else if (restaurantId) {
        const liveUid = auth.currentUser?.uid ?? ownerId
        await createProduct(restaurantId, liveUid, payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'تعديل الصنف' : 'صنف جديد'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <ImageUpload
          label="صورة الصنف"
          value={imageUrl}
          onChange={setImageUrl}
          folder={restaurantId ? `restaurants/${restaurantId}/products` : undefined}
          aspect="wide"
        />
        <Input label="اسم الصنف بالعربي" error={errors.nameAr?.message} {...register('nameAr')} />
        <Input label="اسم الصنف بالإنجليزي (اختياري)" {...register('nameEn')} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">القسم</label>
          <select
            {...register('categoryId')}
            className="rounded-xl border border-stone-light/60 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron/50"
          >
            <option value="">اختار القسم</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.ar}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="text-sm text-sumac">{errors.categoryId.message}</span>}
        </div>

        <Input label="الوصف (اختياري)" {...register('descriptionAr')} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="السعر" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
          <Input label="سعر بعد الخصم (اختياري)" type="number" step="0.01" {...register('discountPrice')} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isBestSeller')} /> الأكثر مبيعًا
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isNew')} /> جديد
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isSpicy')} /> حار
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isVegetarian')} /> نباتي
          </label>
        </div>

        {formError && <p className="text-sm text-sumac">{formError}</p>}

        <Button type="submit" loading={isSubmitting} className="w-full mt-2">
          حفظ
        </Button>
      </form>
    </Modal>
  )
}
