import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Grid2X2, Store } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getRestaurantBySlug } from '@/services/restaurants'
import { listCategories } from '@/services/categories'
import { listProducts } from '@/services/products'
import { logVisit } from '@/services/visits'
import type { Category, Product, Restaurant } from '@/types/database'

const PAGE_SIZE = 8

export default function QRCategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!slug) return
    window.scrollTo(0, 0)
    getRestaurantBySlug(slug)
      .then(async (r) => {
        setRestaurant(r)
        document.title = `اختار الصنف | ${r.name}`
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

  const totalPages = Math.max(1, Math.ceil(categoryRows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visibleRows = categoryRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const source = searchParams.get('src') || 'direct'

  function goToPage(nextPage: number) {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return <div className="min-h-screen bg-[#11120f] text-white flex items-center justify-center">جارِ تحميل الأصناف...</div>
  }

  if (error || !restaurant || !slug) {
    return <div className="min-h-screen bg-[#11120f] text-white flex items-center justify-center p-6 text-center"><div><Store size={40} className="mx-auto mb-3 opacity-40" /><h1 className="text-xl font-bold">الكتالوج غير متاح</h1><p className="text-white/50 mt-2">{error || 'الرابط غير صحيح'}</p></div></div>
  }

  return (
    <div className="min-h-screen bg-[#0f100e] pb-8 text-white" dir="rtl">
      <header className="relative overflow-hidden border-b border-white/10 bg-[#11120f]">
        {restaurant.cover_url && <img src={restaurant.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-[#11120f]/70 to-[#11120f]" />
        <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-9">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-xl">
              {restaurant.logo_url ? <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-contain" /> : <span className="text-xl sm:text-2xl font-black text-[#11120f]">{restaurant.name.charAt(0)}</span>}
            </div>
            <div className="min-w-0"><p className="text-[11px] sm:text-xs text-[#d7b66f]">{restaurant.business_type_name || 'Egy Menu'}</p><h1 className="truncate font-display text-xl sm:text-3xl font-black">{restaurant.name}</h1></div>
          </div>

          <div className="mt-5 sm:mt-7 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] sm:text-xs text-white/65"><Grid2X2 size={14} /> كل الأصناف قدامك</span>
            <h2 className="mt-3 font-display text-2xl sm:text-4xl font-black">اختار الصنف اللي عايز تشوفه</h2>
            <p className="mt-2 text-xs sm:text-sm leading-6 sm:leading-7 text-white/50">هتلاقي كل صنف بصورة واضحة. أول ما تختاره هتظهر المنتجات الموجودة جواه فقط.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
        {categoryRows.length > 0 ? (
          <>
            <div className="mb-3 sm:mb-4 flex items-end justify-between gap-3">
              <div><p className="text-[11px] sm:text-xs text-white/40">{categoryRows.length} صنف</p><h3 className="font-display text-lg sm:text-2xl font-black">كل الأصناف</h3></div>
              {totalPages > 1 && <span className="text-[11px] sm:text-xs text-white/35">صفحة {safePage} من {totalPages}</span>}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
              {visibleRows.map(({ category, count, image }) => (
                <Link
                  key={category.id}
                  to={`/m/${encodeURIComponent(slug)}?src=${encodeURIComponent(source)}&qrBrowse=1&categoryName=${encodeURIComponent(category.name.ar)}`}
                  className="group overflow-hidden rounded-[22px] sm:rounded-[24px] border border-white/10 bg-[#171815] shadow-[0_14px_32px_rgba(0,0,0,.26)] transition-all hover:-translate-y-1 hover:border-[#d7b66f]/35 hover:shadow-[0_22px_50px_rgba(0,0,0,.38)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#22231f]">
                    {image ? <img src={image} alt={category.name.ar} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : restaurant.cover_url ? <img src={restaurant.cover_url} alt="" loading="lazy" className="h-full w-full object-cover opacity-75 transition-transform duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-[#d7b66f] via-[#8d7444] to-[#303429] flex items-center justify-center text-5xl">{category.icon || '🛍️'}</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent" />
                    {category.icon && <span className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-lg text-white backdrop-blur">{category.icon}</span>}
                    <div className="absolute inset-x-3 bottom-3 text-white sm:inset-x-4 sm:bottom-4">
                      <h3 className="font-display text-sm sm:text-xl font-black leading-tight">{category.name.ar}</h3>
                      <p className="mt-1 text-[10px] sm:text-xs text-white/65">{count} منتج</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3 text-[11px] sm:text-sm font-bold">
                    <span>عرض المنتجات</span>
                    <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#d7b66f] text-[#171714]"><ArrowLeft size={14} /></span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                <button type="button" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)} className="h-10 px-4 rounded-xl border border-white/10 bg-white/[0.06] text-xs sm:text-sm font-bold disabled:opacity-30 flex items-center gap-1"><ArrowRight size={14} /> السابق</button>
                <span className="min-w-16 text-center text-xs text-white/45">{safePage} / {totalPages}</span>
                <button type="button" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)} className="h-10 px-4 rounded-xl bg-[#d7b66f] text-[#171714] text-xs sm:text-sm font-black disabled:opacity-30 flex items-center gap-1">التالي <ArrowLeft size={14} /></button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-[#171815] p-8 text-center shadow-xl">
            <Store size={38} className="mx-auto text-white/25" />
            <h2 className="mt-3 font-bold">مفيش أصناف مضافة لسه</h2>
            <p className="mt-2 text-sm text-white/45">تقدر تدخل وتشوف المنتجات المتاحة مباشرة.</p>
            <Link to={`/m/${encodeURIComponent(slug)}?src=${encodeURIComponent(source)}&browse=products`} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#d7b66f] px-5 py-3 text-sm font-black text-[#171714]">عرض المنتجات <ArrowLeft size={16} /></Link>
          </div>
        )}
      </main>
    </div>
  )
}
