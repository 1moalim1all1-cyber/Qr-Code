import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Grid2X2, Store } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getRestaurantBySlug } from '@/services/restaurants'
import { listCategories } from '@/services/categories'
import { listProducts } from '@/services/products'
import { logVisit } from '@/services/visits'
import type { Category, Product, Restaurant } from '@/types/database'

export default function QRCategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    window.scrollTo(0, 0)
    getRestaurantBySlug(slug)
      .then(async (r) => {
        setRestaurant(r)
        document.title = `اختار القسم | ${r.name}`
        const [cats, prods] = await Promise.all([listCategories(r.id), listProducts(r.id)])
        setCategories(cats.filter((item) => item.is_visible))
        setProducts(prods.filter((item) => item.is_available !== false))
        logVisit({ restaurantId: r.id })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر فتح الكتالوج'))
      .finally(() => setLoading(false))

    return () => { document.title = 'Egy Menu' }
  }, [slug])

  const categoryRows = useMemo(() => categories.map((category) => {
    const categoryProducts = products.filter((product) => product.category_id === category.id)
    const image = categoryProducts.find((product) => product.images?.[0]?.url)?.images?.[0]?.url || null
    return { category, count: categoryProducts.length, image }
  }).filter((row) => row.count > 0), [categories, products])

  if (loading) {
    return <div className="min-h-screen bg-[#11120f] text-white flex items-center justify-center">جارِ تحميل الأقسام...</div>
  }

  if (error || !restaurant || !slug) {
    return <div className="min-h-screen bg-[#11120f] text-white flex items-center justify-center p-6 text-center"><div><Store size={40} className="mx-auto mb-3 opacity-40" /><h1 className="text-xl font-bold">الكتالوج غير متاح</h1><p className="text-white/50 mt-2">{error || 'الرابط غير صحيح'}</p></div></div>
  }

  return (
    <div className="min-h-screen bg-[#f1ece3] pb-10" dir="rtl">
      <header className="relative overflow-hidden bg-[#11120f] text-white">
        {restaurant.cover_url && <img src={restaurant.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-[#11120f]" />
        <div className="relative mx-auto max-w-6xl px-5 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white flex items-center justify-center shrink-0">
              {restaurant.logo_url ? <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-contain" /> : <span className="text-2xl font-black text-[#11120f]">{restaurant.name.charAt(0)}</span>}
            </div>
            <div className="min-w-0"><p className="text-xs text-[#d7b66f]">{restaurant.business_type_name || 'Egy Menu'}</p><h1 className="truncate font-display text-2xl font-black">{restaurant.name}</h1></div>
          </div>
          <div className="mt-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/65"><Grid2X2 size={14} /> اختار القسم الأول</span>
            <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">تحب تشوف إيه؟</h2>
            <p className="mt-2 text-sm text-white/50">اختار القسم من الصورة، وبعدها هتظهرلك المنتجات الموجودة جواه.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {categoryRows.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
            {categoryRows.map(({ category, count, image }) => (
              <Link
                key={category.id}
                to={`/m/${encodeURIComponent(slug)}?src=qr&qrBrowse=1&categoryName=${encodeURIComponent(category.name.ar)}`}
                className="group overflow-hidden rounded-[26px] bg-white border border-black/5 shadow-[0_14px_35px_rgba(0,0,0,.08)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,.12)]"
              >
                <div className="relative aspect-[4/3] bg-[#ddd4c6] overflow-hidden">
                  {image ? <img src={image} alt={category.name.ar} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : restaurant.cover_url ? <img src={restaurant.cover_url} alt="" className="h-full w-full object-cover opacity-75" /> : <div className="h-full w-full bg-gradient-to-br from-[#d7b66f] to-[#6f775b] flex items-center justify-center text-4xl">{category.icon || '🛍️'}</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                  {category.icon && <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-black/55 text-xl text-white backdrop-blur">{category.icon}</span>}
                  <div className="absolute inset-x-3 bottom-3 text-white"><h3 className="font-display text-lg sm:text-xl font-black leading-tight">{category.name.ar}</h3><p className="mt-1 text-[11px] text-white/65">{count} منتج</p></div>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-bold"><span>افتح القسم</span><ArrowLeft size={16} className="text-[#8d7444]" /></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white border border-black/5 p-8 text-center shadow-sm">
            <Store size={38} className="mx-auto text-black/25" />
            <h2 className="mt-3 font-bold">مفيش أقسام مضافة لسه</h2>
            <p className="mt-2 text-sm text-[#776f63]">تقدر تدخل وتشوف المنتجات المتاحة مباشرة.</p>
            <Link to={`/m/${encodeURIComponent(slug)}?src=qr&qrBrowse=1`} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#11120f] px-5 py-3 text-sm font-bold text-white">عرض المنتجات <ArrowLeft size={16} /></Link>
          </div>
        )}
      </main>
    </div>
  )
}
