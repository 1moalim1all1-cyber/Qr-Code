import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  BadgePercent,
  Clock,
  Facebook,
  Flame,
  Globe,
  Grid2X2,
  Instagram,
  Leaf,
  List,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  Share2,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  X,
} from 'lucide-react'
import { getRestaurantBySlug } from '@/services/restaurants'
import { isRestaurantOpenNow } from '@/lib/businessHours'
import { listCategories } from '@/services/categories'
import { listProducts } from '@/services/products'
import { logVisit } from '@/services/visits'
import type { Restaurant, Category, Product, OrderItemExtra, MenuShape, MenuTemplate, ProductVariant } from '@/types/database'
import { CartProvider, useCart } from '@/contexts/CartContext'
import BottomCartBar from '@/components/menu/BottomCartBar'
import CartSheet from '@/components/menu/CartSheet'
import ReviewsSection from '@/components/menu/ReviewsSection'
import OffersBanner from '@/components/menu/OffersBanner'

type ViewMode = 'grid' | 'list'
type SortMode = 'newest' | 'price_asc' | 'price_desc' | 'views'

function shapeClass(shape: MenuShape = 'rounded') {
  if (shape === 'square') return 'rounded-none'
  if (shape === 'capsule') return 'rounded-[32px]'
  if (shape === 'cut_corner') return '[clip-path:polygon(16px_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%,0_16px)] rounded-none'
  if (shape === 'hex') return '[clip-path:polygon(14px_0,calc(100%-14px)_0,100%_50%,calc(100%-14px)_100%,14px_100%,0_50%)] rounded-none'
  if (shape === 'triangle') return '[clip-path:polygon(9%_0,100%_0,91%_100%,0_100%)] rounded-none'
  if (shape === 'diamond') return '[clip-path:polygon(7%_0,93%_0,100%_50%,93%_100%,7%_100%,0_50%)] rounded-none'
  if (shape === 'arch') return 'rounded-t-[44px] rounded-b-2xl'
  if (shape === 'wave') return '[clip-path:polygon(0_8%,18%_0,42%_6%,65%_0,100%_8%,100%_92%,78%_100%,55%_94%,30%_100%,0_92%)] rounded-none'
  return 'rounded-2xl'
}

function templateClasses(template: MenuTemplate = 'three_d') {
  if (template === 'minimal') return { page: 'bg-white text-ink', card: 'bg-white border border-stone-light/40 shadow-sm', muted: 'text-stone', tab: 'bg-stone-light/20 text-ink', hero: 'bg-paper-dim', toolbar: 'bg-white/95' }
  if (template === 'classic') return { page: 'bg-[#f7f0e4] text-[#241d16]', card: 'bg-[#fffaf1] border border-[#d7c7ab] shadow-sm', muted: 'text-[#7d6e5c]', tab: 'bg-[#eadfcf] text-[#241d16]', hero: 'bg-[#c9b99d]', toolbar: 'bg-[#f7f0e4]/95' }
  if (template === 'dark_luxe') return { page: 'bg-black text-white', card: 'bg-[#12100d] border border-amber-500/20 shadow-xl', muted: 'text-white/55', tab: 'bg-white/5 text-white', hero: 'bg-gradient-to-br from-black via-[#22190e] to-black', toolbar: 'bg-black/90' }
  return { page: 'bg-[#11110f] text-white', card: 'bg-gradient-to-br from-[#1c1b17] to-[#0d0d0b] border border-white/10 shadow-[0_16px_32px_rgba(0,0,0,.3)]', muted: 'text-white/55', tab: 'bg-white/7 text-white', hero: 'bg-gradient-to-br from-[#6f592d] via-[#27251d] to-black', toolbar: 'bg-black/80' }
}

function productBasePrice(product: Product) {
  if (product.discount_price != null && product.discount_price < product.price) return product.discount_price
  return product.price
}

function getDiscountPercent(product: Product) {
  if (product.discount_percent && product.discount_percent > 0) return Math.round(product.discount_percent)
  const compare = product.compare_at_price ?? (product.discount_price != null && product.discount_price < product.price ? product.price : null)
  const current = product.discount_price ?? product.price
  if (!compare || compare <= current) return 0
  return Math.round(((compare - current) / compare) * 100)
}

function whatsappHref(phone: string | null | undefined, product?: Product) {
  if (!phone) return null
  const digits = phone.replace(/[^0-9]/g, '')
  const message = product ? `مرحبًا، أريد الاستفسار عن ${product.name.ar}${product.brand ? ` - ${product.brand}` : ''}` : 'مرحبًا، أريد الاستفسار عن المنتجات المتاحة.'
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export default function MenuPage() {
  return <CartProvider><MenuPageContent /></CartProvider>
}

function MenuPageContent() {
  const { slug } = useParams<{ slug: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [brand, setBrand] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sectionTop = useRef<HTMLDivElement | null>(null)
  const { itemCount } = useCart()

  useEffect(() => {
    if (!slug) return
    window.scrollTo(0, 0)
    getRestaurantBySlug(slug)
      .then(async (r) => {
        setRestaurant(r)
        document.title = `${r.name} | Egy Menu`
        const [cats, prods] = await Promise.all([listCategories(r.id), listProducts(r.id)])
        setCategories(cats.filter((c) => c.is_visible))
        setProducts(prods)
        logVisit({ restaurantId: r.id })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
    return () => { document.title = 'Egy Menu' }
  }, [slug])

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand?.trim()).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'ar')), [products])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)
    const filtered = products.filter((p) => {
      if (activeCategoryId !== 'all' && p.category_id !== activeCategoryId) return false
      if (brand !== 'all' && p.brand !== brand) return false
      const price = productBasePrice(p)
      if (min != null && Number.isFinite(min) && price < min) return false
      if (max != null && Number.isFinite(max) && price > max) return false
      if (term && ![p.name.ar, p.name.en, p.description?.ar, p.brand, p.barcode, p.unit_label].some((v) => String(v || '').toLowerCase().includes(term))) return false
      return true
    })

    return [...filtered].sort((a, b) => {
      if (sortMode === 'price_asc') return productBasePrice(a) - productBasePrice(b)
      if (sortMode === 'price_desc') return productBasePrice(b) - productBasePrice(a)
      if (sortMode === 'views') return (b.views_count || 0) - (a.views_count || 0)
      return (b.sort_order || 0) - (a.sort_order || 0)
    })
  }, [products, activeCategoryId, brand, minPrice, maxPrice, search, sortMode])

  if (loading) return <div className="min-h-screen bg-ink flex items-center justify-center text-paper">جارِ تحميل الكتالوج...</div>
  if (notFound || !restaurant) return <div className="min-h-screen bg-ink text-paper flex items-center justify-center text-center p-6"><div><h1 className="text-2xl font-bold">الكتالوج غير متاح</h1><p className="text-stone-light mt-2">الرابط مش شغال أو الاشتراك انتهى.</p></div></div>

  const template = restaurant.menu_template || 'three_d'
  const shape = restaurant.menu_shape || 'rounded'
  const ui = templateClasses(template)
  const waStore = whatsappHref(restaurant.whatsapp)

  return (
    <div className={`min-h-screen pb-28 transition-colors ${ui.page}`} dir="rtl">
      <div className={`relative h-52 sm:h-64 overflow-hidden ${ui.hero}`}>
        {restaurant.cover_url ? <img src={restaurant.cover_url} alt={restaurant.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-25"><Store size={70} /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-14 relative">
        <section className={`${ui.card} rounded-[30px] p-4 sm:p-5 mb-5`}>
          <div className="flex items-end sm:items-center gap-4">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 overflow-hidden shrink-0 flex items-center justify-center border-4 border-white/80 bg-white ${shapeClass(shape)} shadow-xl`}>
              {restaurant.logo_url ? <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-ink text-saffron flex items-center justify-center text-3xl font-bold">{restaurant.name.charAt(0)}</div>}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold">{restaurant.name}</h1>
                <span className="rounded-full bg-saffron/15 text-saffron-dim px-2.5 py-1 text-[11px]">{restaurant.business_type_name || 'متجر'}</span>
              </div>
              <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm mt-2 ${ui.muted}`}>
                {restaurant.rating > 0 && <span className="flex items-center gap-1"><Star size={13} className="text-saffron" fill="currentColor" />{restaurant.rating}</span>}
                <span className={isRestaurantOpenNow(restaurant) ? 'text-zaytoon' : 'text-sumac'}><Clock size={13} className="inline ml-1" />{isRestaurantOpenNow(restaurant) ? 'مفتوح الآن' : 'مغلق حاليًا'}</span>
                {restaurant.address && <span className="flex items-center gap-1"><MapPin size={13} />{restaurant.address}</span>}
              </div>
            </div>
          </div>

          {restaurant.description && <p className={`text-sm leading-6 mt-4 ${ui.muted}`}>{restaurant.description}</p>}

          <div className="grid grid-cols-2 sm:flex gap-2 mt-4">
            {restaurant.phone && <a href={`tel:${restaurant.phone}`} className={`${ui.tab} rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2`}><Phone size={15} /> اتصال</a>}
            {waStore && <a href={waStore} target="_blank" rel="noreferrer" className="rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold"><MessageCircle size={15} /> واتساب</a>}
            {restaurant.google_maps_url && <a href={restaurant.google_maps_url} target="_blank" rel="noreferrer" className={`${ui.tab} rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2`}><MapPin size={15} /> الموقع</a>}
            {restaurant.website && <a href={restaurant.website} target="_blank" rel="noreferrer" className={`${ui.tab} rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2`}><Globe size={15} /> الموقع الإلكتروني</a>}
            <button onClick={() => navigator.share?.({ title: restaurant.name, url: window.location.href })} className={`${ui.tab} rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2`}><Share2 size={15} /> مشاركة</button>
          </div>

          {restaurant.social_links && <div className="flex gap-2 mt-3">
            {restaurant.social_links.facebook && <a href={restaurant.social_links.facebook} target="_blank" rel="noreferrer" className={`${ui.tab} w-9 h-9 rounded-full flex items-center justify-center`}><Facebook size={16} /></a>}
            {restaurant.social_links.instagram && <a href={restaurant.social_links.instagram} target="_blank" rel="noreferrer" className={`${ui.tab} w-9 h-9 rounded-full flex items-center justify-center`}><Instagram size={16} /></a>}
            {restaurant.social_links.tiktok && <a href={restaurant.social_links.tiktok} target="_blank" rel="noreferrer" className={`${ui.tab} rounded-full px-3 h-9 flex items-center justify-center text-xs font-bold`}>TikTok</a>}
          </div>}
        </section>

        <OffersBanner restaurantId={restaurant.id} />

        <div ref={sectionTop} className={`sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 backdrop-blur-xl border-y border-current/10 ${ui.toolbar}`}>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 min-w-0">
              <Search size={17} className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${ui.muted}`} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن منتج أو ماركة..." className={`${ui.card} w-full py-2.5 pr-10 pl-9 outline-none rounded-xl text-sm`} />
              {search && <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2"><X size={15} /></button>}
            </div>
            <button onClick={() => setFiltersOpen((v) => !v)} className={`${ui.card} w-11 h-11 rounded-xl flex items-center justify-center ${filtersOpen ? 'ring-2 ring-saffron/60' : ''}`} title="الفلاتر"><SlidersHorizontal size={17} /></button>
            <div className={`${ui.card} rounded-xl p-1 flex items-center`}>
              <button onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded-lg flex items-center justify-center ${viewMode === 'grid' ? 'bg-saffron text-ink' : ''}`}><Grid2X2 size={15} /></button>
              <button onClick={() => setViewMode('list')} className={`w-8 h-8 rounded-lg flex items-center justify-center ${viewMode === 'list' ? 'bg-saffron text-ink' : ''}`}><List size={16} /></button>
            </div>
          </div>

          {filtersOpen && <div className={`${ui.card} rounded-2xl mt-3 p-3 grid sm:grid-cols-4 gap-3`}>
            <label className="text-xs"><span className={ui.muted}>الماركة</span><select value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full bg-transparent border border-current/15 rounded-xl px-3 py-2 outline-none"><option value="all">كل الماركات</option>{brands.map((b) => <option key={b} value={b}>{b}</option>)}</select></label>
            <label className="text-xs"><span className={ui.muted}>من سعر</span><input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="mt-1 w-full bg-transparent border border-current/15 rounded-xl px-3 py-2 outline-none" /></label>
            <label className="text-xs"><span className={ui.muted}>إلى سعر</span><input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="mt-1 w-full bg-transparent border border-current/15 rounded-xl px-3 py-2 outline-none" /></label>
            <label className="text-xs"><span className={ui.muted}>الترتيب</span><select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} className="mt-1 w-full bg-transparent border border-current/15 rounded-xl px-3 py-2 outline-none"><option value="newest">الأحدث</option><option value="price_asc">السعر: الأقل أولًا</option><option value="price_desc">السعر: الأعلى أولًا</option><option value="views">الأكثر مشاهدة</option></select></label>
          </div>}

          <div className="flex gap-2 overflow-x-auto mt-3 scrollbar-none">
            <button onClick={() => setActiveCategoryId('all')} className={`shrink-0 px-4 py-2 text-xs sm:text-sm font-semibold rounded-full ${activeCategoryId === 'all' ? 'bg-saffron text-ink' : ui.tab}`}>كل المنتجات</button>
            {categories.map((category) => <button key={category.id} onClick={() => setActiveCategoryId(category.id)} className={`shrink-0 px-4 py-2 text-xs sm:text-sm font-semibold rounded-full ${activeCategoryId === category.id ? 'bg-saffron text-ink' : ui.tab}`}>{category.name.ar}</button>)}
          </div>
        </div>

        {products.some((p) => p.is_featured) && activeCategoryId === 'all' && !search && brand === 'all' && <section className="mt-7">
          <div className="flex items-center justify-between mb-3"><div><p className="text-xs text-saffron-dim font-bold">مختارات المتجر</p><h2 className="font-display text-xl font-bold">منتجات مميزة</h2></div><Sparkles size={20} className="text-saffron" /></div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">{products.filter((p) => p.is_featured).slice(0, 8).map((p, i) => <div key={p.id} className="w-[190px] shrink-0"><ProductCard product={p} restaurant={restaurant} ui={ui} shape={shape} index={i} viewMode="grid" onOpen={() => { setSelectedProduct(p); logVisit({ restaurantId: restaurant.id, productId: p.id }) }} /></div>)}</div>
        </section>}

        <section className="mt-7">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div><p className={`text-xs ${ui.muted}`}>{filteredProducts.length} منتج</p><h2 className="font-display text-xl sm:text-2xl font-bold mt-0.5">{activeCategoryId === 'all' ? 'كل المنتجات' : categories.find((c) => c.id === activeCategoryId)?.name.ar}</h2></div>
            {(search || brand !== 'all' || minPrice || maxPrice) && <button onClick={() => { setSearch(''); setBrand('all'); setMinPrice(''); setMaxPrice('') }} className="text-xs text-saffron-dim">مسح الفلاتر</button>}
          </div>

          {filteredProducts.length === 0 ? <div className={`${ui.card} rounded-3xl text-center py-16 ${ui.muted}`}><Store size={30} className="mx-auto mb-3 opacity-40" />مفيش منتجات مطابقة.</div> : <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4' : 'grid grid-cols-1 gap-3'}>
            {filteredProducts.map((p, index) => <ProductCard key={p.id} product={p} restaurant={restaurant} ui={ui} shape={shape} index={index} viewMode={viewMode} onOpen={() => { setSelectedProduct(p); logVisit({ restaurantId: restaurant.id, productId: p.id }) }} />)}
          </div>}
        </section>

        <div className="mt-12"><ReviewsSection restaurantId={restaurant.id} /></div>
      </div>

      {selectedProduct && <ProductDetailSheet product={selectedProduct} restaurant={restaurant} ui={ui} onClose={() => setSelectedProduct(null)} />}
      {itemCount > 0 && !cartOpen && <BottomCartBar onOpenCart={() => setCartOpen(true)} />}
      {cartOpen && <CartSheet restaurant={restaurant} onClose={() => setCartOpen(false)} />}
    </div>
  )
}

function ProductCard({ product: p, restaurant, ui, shape, index, viewMode, onOpen }: { product: Product; restaurant: Restaurant; ui: ReturnType<typeof templateClasses>; shape: MenuShape; index: number; viewMode: ViewMode; onOpen: () => void }) {
  const { addItem } = useCart()
  const threeD = (restaurant.menu_template || 'three_d') === 'three_d'
  const availableSizes = (p.sizes ?? []).filter((s) => s.stock == null || s.stock > 0)
  const sizePrice = availableSizes.length > 0 ? Math.min(...availableSizes.map((s) => Number(s.price))) : null
  const availableVariants = (p.variants ?? []).filter((v) => v.is_available !== false && (v.stock == null || v.stock > 0))
  const variantPrice = availableVariants.length > 0 ? Math.min(...availableVariants.map((v) => Number(v.price))) : null
  const effectivePrice = variantPrice ?? sizePrice ?? productBasePrice(p)
  const discount = getDiscountPercent(p)
  const isAvailable = p.is_available !== false && ((p.variants?.length ?? 0) === 0 || availableVariants.length > 0)
  const wa = whatsappHref(restaurant.whatsapp, p)

  return (
    <article onClick={onOpen} className={`${ui.card} ${shapeClass(shape)} overflow-hidden cursor-pointer transition-all hover:-translate-y-1 ${viewMode === 'list' ? 'flex min-h-[150px]' : ''} ${threeD ? 'hover:shadow-[0_24px_40px_rgba(0,0,0,.38)]' : ''}`} style={threeD && viewMode === 'grid' ? { transform: `perspective(900px) rotateY(${index % 2 ? -0.8 : 0.8}deg)` } : undefined}>
      <div className={`relative overflow-hidden bg-white/5 shrink-0 ${viewMode === 'list' ? 'w-[135px] sm:w-[180px]' : 'aspect-square w-full'}`}>
        {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name.ar} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center"><Store className={ui.muted} /></div>}
        <div className="absolute top-2 right-2 flex flex-col items-start gap-1">
          {discount > 0 && <span className="rounded-full bg-red-600 text-white px-2 py-1 text-[10px] font-bold">خصم {discount}%</span>}
          {p.is_new && <span className="rounded-full bg-saffron text-ink px-2 py-1 text-[10px] font-bold">جديد</span>}
          {p.is_best_seller && <span className="rounded-full bg-black/75 text-white px-2 py-1 text-[10px]">الأكثر مبيعًا</span>}
          {p.badges?.slice(0, 1).map((badge) => <span key={badge} className="rounded-full bg-white/90 text-black px-2 py-1 text-[10px]">{badge}</span>)}
        </div>
        {!isAvailable && <div className="absolute inset-0 bg-black/55 text-white flex items-center justify-center text-xs font-bold">غير متوفر</div>}
      </div>
      <div className={`p-3 sm:p-4 min-w-0 flex-1 flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}>
        <div>
          {p.brand && <p className="text-[10px] sm:text-xs text-saffron-dim font-semibold truncate mb-1">{p.brand}</p>}
          <h3 className="font-bold text-sm sm:text-base leading-5 line-clamp-2">{p.name.ar}</h3>
          {p.description?.ar && <p className={`text-[11px] sm:text-xs line-clamp-2 mt-1.5 leading-5 ${ui.muted}`}>{p.description.ar}</p>}
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm sm:text-base">{(p.variants?.length || p.sizes?.length) ? 'من ' : ''}{effectivePrice.toLocaleString('ar-EG')} ج.م</span>
            {p.compare_at_price && p.compare_at_price > effectivePrice && <span className={`text-[10px] sm:text-xs line-through ${ui.muted}`}>{p.compare_at_price.toLocaleString('ar-EG')}</span>}
            {!p.compare_at_price && p.discount_price != null && p.discount_price < p.price && <span className={`text-[10px] sm:text-xs line-through ${ui.muted}`}>{p.price.toLocaleString('ar-EG')}</span>}
          </div>
          <div className="flex items-center gap-2 mt-3">
            {wa && <a href={wa} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 min-w-0 rounded-xl bg-[#25D366] text-white py-2 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5"><MessageCircle size={14} /> اسأل واتساب</a>}
            <button disabled={!isAvailable} onClick={(e) => { e.stopPropagation(); if (!isAvailable) return; if (p.sizes?.length || p.variants?.length) onOpen(); else addItem({ productId: p.id, name: p.name.ar, price: p.discount_price || p.price, extras: [] }, 1) }} className="rounded-xl bg-saffron text-ink w-9 h-9 flex items-center justify-center disabled:opacity-40"><Plus size={15} /></button>
          </div>
        </div>
      </div>
    </article>
  )
}

function ProductDetailSheet({ product, restaurant, ui, onClose }: { product: Product; restaurant: Restaurant; ui: ReturnType<typeof templateClasses>; onClose: () => void }) {
  const { addItem } = useCart()
  const availableVariants = (product.variants ?? []).filter((v) => v.is_available !== false && (v.stock == null || v.stock > 0))
  const firstAvailableSize = (product.sizes ?? []).find((s) => s.stock == null || s.stock > 0) ?? null
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<OrderItemExtra[]>([])
  const [selectedSize, setSelectedSize] = useState(firstAvailableSize)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(availableVariants[0] ?? null)
  const [activeImage, setActiveImage] = useState(0)
  const variantPrice = selectedVariant?.price
  const basePrice = variantPrice ?? selectedSize?.price ?? product.discount_price ?? product.price
  const comparePrice = selectedVariant?.compare_at_price ?? product.compare_at_price ?? (product.discount_price != null && product.discount_price < product.price ? product.price : null)
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0)
  const total = (basePrice + extrasTotal) * quantity
  const selectedStock = selectedVariant?.stock != null ? Math.max(0, Number(selectedVariant.stock)) : selectedSize?.stock != null ? Math.max(0, Number(selectedSize.stock)) : null
  const hasChoices = Boolean(product.sizes?.length || product.variants?.length)
  const canAdd = product.is_available !== false && (!hasChoices || selectedVariant != null || selectedSize != null) && selectedStock !== 0
  const wa = whatsappHref(restaurant.whatsapp, product)
  const images = product.images ?? []
  const discount = getDiscountPercent(product)

  async function shareProduct() {
    const data = { title: product.name.ar, text: `${product.name.ar} - ${basePrice} ج.م`, url: window.location.href }
    if (navigator.share) await navigator.share(data)
    else await navigator.clipboard?.writeText(window.location.href)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className={`${ui.card} w-full sm:max-w-3xl max-h-[92vh] overflow-auto rounded-t-[30px] sm:rounded-[30px]`} onClick={(e) => e.stopPropagation()}>
        <div className="grid md:grid-cols-2">
          <div className="relative bg-white/5 md:min-h-[520px]">
            <div className="aspect-square md:h-[430px] md:aspect-auto bg-white flex items-center justify-center overflow-hidden">
              {images[activeImage]?.url ? <img src={images[activeImage].url} alt={product.name.ar} className="w-full h-full object-contain" /> : <Store size={52} className="text-black/20" />}
            </div>
            {images.length > 1 && <div className="p-3 flex gap-2 overflow-x-auto bg-black/5">{images.map((image, i) => <button key={image.id || i} onClick={() => setActiveImage(i)} className={`w-16 h-16 rounded-xl overflow-hidden bg-white border-2 shrink-0 ${activeImage === i ? 'border-saffron' : 'border-transparent'}`}><img src={image.url} alt="" className="w-full h-full object-cover" /></button>)}</div>}
            <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/75 text-white flex items-center justify-center"><X size={18} /></button>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>{product.brand && <p className="text-saffron-dim text-xs font-bold mb-1">{product.brand}</p>}<h2 className="text-xl sm:text-2xl font-black leading-8">{product.name.ar}</h2></div>
              <button onClick={shareProduct} className={`${ui.tab} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}><Share2 size={17} /></button>
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-3">
              <span className="text-xl font-black">{basePrice.toLocaleString('ar-EG')} ج.م</span>
              {comparePrice && comparePrice > basePrice && <span className={`text-sm line-through ${ui.muted}`}>{comparePrice.toLocaleString('ar-EG')}</span>}
              {discount > 0 && <span className="rounded-full bg-red-600/15 text-red-500 px-2.5 py-1 text-xs font-bold flex items-center gap-1"><BadgePercent size={13} /> خصم {discount}%</span>}
            </div>

            {product.description?.ar && <p className={`text-sm leading-7 mt-4 ${ui.muted}`}>{product.description.ar}</p>}

            {product.variants && product.variants.length > 0 && <div className="mt-5"><p className="text-sm font-bold mb-2">الاختيارات المتاحة</p><div className="grid grid-cols-2 gap-2">{product.variants.map((variant) => { const unavailable = variant.is_available === false || variant.stock === 0; const label = variant.label || Object.values(variant.options || {}).join(' / ') || 'اختيار'; return <button key={variant.id} disabled={unavailable} onClick={() => { setSelectedVariant(variant); setSelectedSize(null); setQuantity(1) }} className={`rounded-xl px-3 py-2.5 text-sm border text-right ${selectedVariant?.id === variant.id ? 'border-saffron bg-saffron/15' : 'border-current/15'} ${unavailable ? 'opacity-40' : ''}`}><span className="font-semibold block">{label}</span><span className={`block text-xs mt-1 ${ui.muted}`}>{variant.price.toLocaleString('ar-EG')} ج.م{variant.stock != null ? ` · المتاح ${variant.stock}` : ''}</span></button> })}</div></div>}

            {(!product.variants || product.variants.length === 0) && product.sizes && product.sizes.length > 0 && <div className="mt-5"><p className="text-sm font-bold mb-2">المقاس / السعة / الوزن</p><div className="flex flex-wrap gap-2">{product.sizes.map((s) => { const outOfStock = s.stock === 0; return <button key={s.name} disabled={outOfStock} onClick={() => { setSelectedSize(s); setQuantity(1) }} className={`rounded-xl px-3 py-2 text-sm border text-right ${selectedSize?.name === s.name ? 'border-saffron bg-saffron/15' : 'border-current/20'} ${outOfStock ? 'opacity-45' : ''}`}><span className="font-semibold">{s.name}</span><span className="block text-xs mt-0.5">{s.price.toLocaleString('ar-EG')} ج.م{s.stock != null ? ` · المتاح ${s.stock}` : ''}</span></button> })}</div></div>}

            {product.colors && product.colors.length > 0 && <div className="mt-5"><p className="text-sm font-bold mb-2">الألوان</p><div className="flex flex-wrap gap-2">{product.colors.map((color) => <span key={color} className={`${ui.tab} rounded-full px-3 py-1.5 text-xs`}>{color}</span>)}</div></div>}

            {product.specifications && product.specifications.length > 0 && <div className="mt-5"><p className="text-sm font-bold mb-2">المواصفات</p><div className="rounded-2xl border border-current/10 overflow-hidden">{product.specifications.map((spec, i) => <div key={`${spec.name}-${i}`} className={`flex justify-between gap-4 px-3 py-2.5 text-xs ${i ? 'border-t border-current/10' : ''}`}><span className={ui.muted}>{spec.name}</span><strong className="text-left">{spec.value}</strong></div>)}</div></div>}

            {product.extras?.length > 0 && <div className="mt-5"><p className="text-sm font-bold mb-2">إضافات</p><div className="space-y-2">{product.extras.map((extra) => { const active = selectedExtras.some((x) => x.name === extra.name); return <button key={extra.name} onClick={() => setSelectedExtras((prev) => active ? prev.filter((x) => x.name !== extra.name) : [...prev, extra])} className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border ${active ? 'border-saffron bg-saffron/10' : 'border-current/15'}`}><span>{extra.name}</span><span>+{extra.price} ج.م</span></button> })}</div></div>}

            <div className="mt-6 flex flex-col gap-2">
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="w-full rounded-xl bg-[#25D366] text-white py-3 font-bold flex items-center justify-center gap-2"><MessageCircle size={17} /> اطلب أو استفسر عبر واتساب</a>}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-xl border border-current/15 px-1 py-1"><button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center"><Minus size={15} /></button><span className="w-7 text-center font-bold">{quantity}</span><button disabled={selectedStock != null && quantity >= selectedStock} onClick={() => setQuantity((q) => selectedStock == null ? q + 1 : Math.min(selectedStock, q + 1))} className="w-9 h-9 flex items-center justify-center disabled:opacity-35"><Plus size={15} /></button></div>
                <button disabled={!canAdd} onClick={() => { if (!canAdd) return; addItem({ productId: product.id, name: product.name.ar, price: basePrice, extras: selectedExtras, size: selectedVariant?.label || selectedSize?.name }, quantity); onClose() }} className="flex-1 rounded-xl bg-saffron text-ink py-3 font-black flex items-center justify-center gap-2 disabled:opacity-45"><ShoppingBag size={16} /> {canAdd ? `أضف للسلة — ${total.toLocaleString('ar-EG')} ج.م` : 'غير متاح'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
