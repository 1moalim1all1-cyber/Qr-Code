import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Search, Phone, MessageCircle, MapPin, Clock, Star, Flame, Sparkles, Leaf, X, Share2, Plus, Minus, ShoppingBag, UtensilsCrossed,
} from 'lucide-react'
import { getRestaurantBySlug } from '@/services/restaurants'
import { isRestaurantOpenNow } from '@/lib/businessHours'
import { listCategories } from '@/services/categories'
import { listProducts } from '@/services/products'
import { logVisit } from '@/services/visits'
import type { Restaurant, Category, Product, OrderItemExtra, MenuShape, MenuTemplate } from '@/types/database'
import { CartProvider, useCart } from '@/contexts/CartContext'
import BottomCartBar from '@/components/menu/BottomCartBar'
import CartSheet from '@/components/menu/CartSheet'
import ReviewsSection from '@/components/menu/ReviewsSection'
import OffersBanner from '@/components/menu/OffersBanner'

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
  if (template === 'minimal') {
    return {
      page: 'bg-white text-ink',
      card: 'bg-white border border-stone-light/40 shadow-sm',
      muted: 'text-stone',
      tab: 'bg-stone-light/20 text-ink',
      hero: 'bg-paper-dim',
    }
  }
  if (template === 'classic') {
    return {
      page: 'bg-[#f7f0e4] text-[#241d16]',
      card: 'bg-[#fffaf1] border border-[#d7c7ab] shadow-sm',
      muted: 'text-[#7d6e5c]',
      tab: 'bg-[#eadfcf] text-[#241d16]',
      hero: 'bg-[#c9b99d]',
    }
  }
  if (template === 'dark_luxe') {
    return {
      page: 'bg-black text-white',
      card: 'bg-[#12100d] border border-amber-500/20 shadow-xl',
      muted: 'text-white/55',
      tab: 'bg-white/5 text-white',
      hero: 'bg-gradient-to-br from-black via-[#22190e] to-black',
    }
  }
  return {
    page: 'bg-[#11110f] text-white',
    card: 'bg-gradient-to-br from-[#1c1b17] to-[#0d0d0b] border border-white/10 shadow-[0_16px_32px_rgba(0,0,0,.3)]',
    muted: 'text-white/55',
    tab: 'bg-white/7 text-white',
    hero: 'bg-gradient-to-br from-[#6f592d] via-[#27251d] to-black',
  }
}

export default function MenuPage() {
  return (
    <CartProvider>
      <MenuPageContent />
    </CartProvider>
  )
}

function MenuPageContent() {
  const { slug } = useParams<{ slug: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
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
        setProducts(prods.filter((p) => p.is_available))
        logVisit({ restaurantId: r.id })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
    return () => { document.title = 'Egy Menu' }
  }, [slug])

  const filteredByCategory = useMemo(() => {
    const term = search.trim().toLowerCase()
    const bySearch = term
      ? products.filter((p) => [p.name.ar, p.name.en, p.description?.ar, p.brand, p.barcode].some((v) => String(v || '').toLowerCase().includes(term)))
      : products
    return categories
      .map((cat) => ({ category: cat, products: bySearch.filter((p) => p.category_id === cat.id) }))
      .filter((group) => group.products.length > 0)
  }, [categories, products, search])

  if (loading) return <div className="min-h-screen bg-ink flex items-center justify-center text-paper">جارِ تحميل المنيو...</div>
  if (notFound || !restaurant) return <div className="min-h-screen bg-ink text-paper flex items-center justify-center text-center p-6"><div><h1 className="text-2xl font-bold">المنيو غير متاح</h1><p className="text-stone-light mt-2">الرابط مش شغال أو الاشتراك انتهى.</p></div></div>

  const template = restaurant.menu_template || 'three_d'
  const shape = restaurant.menu_shape || 'rounded'
  const ui = templateClasses(template)

  return (
    <div className={`min-h-screen pb-28 transition-colors ${ui.page}`} dir="rtl">
      <div className={`relative h-48 overflow-hidden ${ui.hero}`}>
        {restaurant.cover_url && <img src={restaurant.cover_url} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-5 -mt-12 relative">
        <div className="flex items-end gap-4 mb-4">
          <div className={`w-24 h-24 overflow-hidden shrink-0 flex items-center justify-center border-4 border-white/70 ${shapeClass(shape)} ${template === 'three_d' ? 'shadow-[0_18px_35px_rgba(0,0,0,.45)] rotate-[-2deg]' : 'shadow-lg'}`}>
            {restaurant.logo_url ? <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-contain bg-white" /> : <div className="w-full h-full bg-ink text-saffron flex items-center justify-center text-2xl font-bold">{restaurant.name.charAt(0)}</div>}
          </div>
          <div className="pb-2 flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold truncate">{restaurant.name}</h1>
            <div className={`flex items-center gap-3 text-sm mt-1 ${ui.muted}`}>
              {restaurant.rating > 0 && <span className="flex items-center gap-1"><Star size={13} className="text-saffron" fill="currentColor" />{restaurant.rating}</span>}
              <span className={isRestaurantOpenNow(restaurant) ? 'text-zaytoon' : 'text-sumac'}><Clock size={13} className="inline ml-1" />{isRestaurantOpenNow(restaurant) ? 'مفتوح الآن' : 'مغلق حاليًا'}</span>
            </div>
          </div>
        </div>

        {restaurant.description && <p className={`text-sm mb-4 ${ui.muted}`}>{restaurant.description}</p>}

        <div className="grid grid-cols-4 gap-2 mb-5">
          {restaurant.phone && <a href={`tel:${restaurant.phone}`} className={`${ui.card} rounded-2xl py-2.5 text-xs flex items-center justify-center gap-1`}><Phone size={14} /> اتصال</a>}
          {restaurant.whatsapp && <a href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className={`${ui.card} rounded-2xl py-2.5 text-xs flex items-center justify-center gap-1`}><MessageCircle size={14} /> واتساب</a>}
          {restaurant.google_maps_url && <a href={restaurant.google_maps_url} target="_blank" rel="noreferrer" className={`${ui.card} rounded-2xl py-2.5 text-xs flex items-center justify-center gap-1`}><MapPin size={14} /> الموقع</a>}
          <button onClick={() => navigator.share?.({ title: restaurant.name, url: window.location.href })} className={`${ui.card} rounded-2xl py-2.5 text-xs flex items-center justify-center gap-1`}><Share2 size={14} /> مشاركة</button>
        </div>

        <OffersBanner restaurantId={restaurant.id} />

        <div className="relative my-5">
          <Search size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 ${ui.muted}`} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو البراند أو الباركود" className={`${ui.card} w-full py-3 pr-11 pl-10 outline-none ${shapeClass(shape)}`} />
          {search && <button onClick={() => setSearch('')} className="absolute left-4 top-1/2 -translate-y-1/2"><X size={16} /></button>}
        </div>

        <div className={`sticky top-0 z-20 py-3 -mx-5 px-5 overflow-x-auto flex gap-2 backdrop-blur-xl ${template === 'minimal' ? 'bg-white/90' : template === 'classic' ? 'bg-[#f7f0e4]/90' : 'bg-black/75'}`}>
          {filteredByCategory.map(({ category }) => (
            <button key={category.id} onClick={() => { setActiveCategoryId(category.id); sectionRefs.current[category.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className={`shrink-0 px-4 py-2 text-sm font-medium transition-all ${shapeClass(shape)} ${activeCategoryId === category.id ? 'bg-saffron text-ink shadow-lg' : ui.tab}`}>
              {category.name.ar}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-9">
          {filteredByCategory.map(({ category, products: catProducts }) => (
            <section key={category.id} ref={(el) => { sectionRefs.current[category.id] = el }} className="scroll-mt-20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl font-semibold">{category.name.ar}</h2>
                <span className={`text-xs ${ui.muted}`}>{catProducts.length} منتج</span>
              </div>
              <div className={`grid gap-4 ${restaurant.business_type === 'supermarket' || restaurant.business_type === 'cosmetics' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {catProducts.map((p, index) => <ProductCard key={p.id} product={p} restaurant={restaurant} ui={ui} shape={shape} index={index} onOpen={() => { setSelectedProduct(p); logVisit({ restaurantId: restaurant.id, productId: p.id }) }} />)}
              </div>
            </section>
          ))}
        </div>

        {filteredByCategory.length === 0 && <div className={`text-center py-16 ${ui.muted}`}>مفيش منتجات مطابقة.</div>}
        <div className="mt-10"><ReviewsSection restaurantId={restaurant.id} /></div>
      </div>

      {selectedProduct && <ProductDetailSheet product={selectedProduct} ui={ui} onClose={() => setSelectedProduct(null)} />}
      {itemCount > 0 && !cartOpen && <BottomCartBar onOpenCart={() => setCartOpen(true)} />}
      {cartOpen && <CartSheet restaurant={restaurant} onClose={() => setCartOpen(false)} />}
    </div>
  )
}

function ProductCard({ product: p, restaurant, ui, shape, index, onOpen }: { product: Product; restaurant: Restaurant; ui: ReturnType<typeof templateClasses>; shape: MenuShape; index: number; onOpen: () => void }) {
  const { addItem } = useCart()
  const threeD = (restaurant.menu_template || 'three_d') === 'three_d'
  return (
    <article onClick={onOpen} className={`${ui.card} ${shapeClass(shape)} overflow-hidden cursor-pointer transition-all hover:-translate-y-1 ${threeD ? 'hover:shadow-[0_24px_40px_rgba(0,0,0,.38)]' : ''}`} style={threeD ? { transform: `perspective(900px) rotateY(${index % 2 ? -1.4 : 1.4}deg)` } : undefined}>
      <div className="relative aspect-square overflow-hidden bg-white/5">
        {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name.ar} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed className={ui.muted} /></div>}
        {p.brand && <span className="absolute top-2 right-2 rounded-full bg-black/65 text-white px-2 py-1 text-[10px]">{p.brand}</span>}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0"><h3 className="font-semibold text-sm truncate">{p.name.ar}</h3>{p.description?.ar && <p className={`text-xs truncate mt-1 ${ui.muted}`}>{p.description.ar}</p>}</div>
          <div className="flex gap-1 shrink-0">{p.is_best_seller && <Star size={12} className="text-saffron" fill="currentColor" />}{p.is_new && <Sparkles size={12} className="text-zaytoon" />}{p.is_spicy && <Flame size={12} className="text-sumac" />}{p.is_vegetarian && <Leaf size={12} className="text-zaytoon" />}</div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div>{p.discount_price ? <><span className="font-bold text-saffron-dim">{p.discount_price} ج.م</span><span className={`text-[11px] line-through mr-1 ${ui.muted}`}>{p.price}</span></> : <span className="font-bold">{p.price} ج.م</span>}</div>
          <button onClick={(e) => { e.stopPropagation(); addItem({ productId: p.id, name: p.name.ar, price: p.discount_price || p.price, extras: [] }, 1) }} className="rounded-full bg-saffron text-ink w-8 h-8 flex items-center justify-center"><Plus size={15} /></button>
        </div>
      </div>
    </article>
  )
}

function ProductDetailSheet({ product, ui, onClose }: { product: Product; ui: ReturnType<typeof templateClasses>; onClose: () => void }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<OrderItemExtra[]>([])
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null)
  const basePrice = selectedSize ? selectedSize.price : product.discount_price || product.price
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0)
  const total = (basePrice + extrasTotal) * quantity

  return (
    <div className="fixed inset-0 z-50 bg-black/65 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className={`${ui.card} w-full sm:max-w-lg max-h-[88vh] overflow-auto rounded-t-3xl sm:rounded-3xl`} onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-[4/3] bg-white/5">
          {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.name.ar} className="w-full h-full object-contain bg-white" /> : <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed size={44} /></div>}
          <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="p-5">
          <h2 className="text-xl font-bold">{product.name.ar}</h2>
          {product.brand && <p className="text-saffron-dim text-sm mt-1">{product.brand}</p>}
          {product.description?.ar && <p className={`text-sm mt-2 ${ui.muted}`}>{product.description.ar}</p>}

          {product.sizes && product.sizes.length > 0 && <div className="mt-4"><p className="text-sm font-medium mb-2">الحجم</p><div className="flex flex-wrap gap-2">{product.sizes.map((s) => <button key={s.name} onClick={() => setSelectedSize(s)} className={`rounded-full px-3 py-2 text-sm border ${selectedSize?.name === s.name ? 'border-saffron bg-saffron/15' : 'border-current/20'}`}>{s.name} · {s.price} ج.م</button>)}</div></div>}

          {product.extras?.length > 0 && <div className="mt-4"><p className="text-sm font-medium mb-2">إضافات</p><div className="space-y-2">{product.extras.map((e) => { const active = selectedExtras.some((x) => x.name === e.name); return <button key={e.name} onClick={() => setSelectedExtras((prev) => active ? prev.filter((x) => x.name !== e.name) : [...prev, e])} className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border ${active ? 'border-saffron bg-saffron/10' : 'border-current/15'}`}><span>{e.name}</span><span>+{e.price} ج.م</span></button> })}</div></div>}

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-current/15 px-2 py-1"><button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center"><Minus size={15} /></button><span className="w-5 text-center">{quantity}</span><button onClick={() => setQuantity((q) => q + 1)} className="w-8 h-8 flex items-center justify-center"><Plus size={15} /></button></div>
            <button onClick={() => { addItem({ productId: product.id, name: product.name.ar, price: basePrice, extras: selectedExtras, size: selectedSize?.name }, quantity); onClose() }} className="flex-1 rounded-full bg-saffron text-ink py-3 font-bold flex items-center justify-center gap-2"><ShoppingBag size={16} /> أضف للسلة — {total} ج.م</button>
          </div>
        </div>
      </div>
    </div>
  )
}
