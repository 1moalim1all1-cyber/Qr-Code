import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, Phone, MessageCircle, MapPin, Clock, Star, Flame, Sparkles, Leaf, X, Share2, Plus, Minus, ShoppingBag,
} from 'lucide-react'
import { getRestaurantBySlug } from '@/services/restaurants'
import { listCategories } from '@/services/categories'
import { listProducts } from '@/services/products'
import { logVisit } from '@/services/visits'
import type { Restaurant, Category, Product, OrderItemExtra } from '@/types/database'
import { CartProvider, useCart } from '@/contexts/CartContext'
import BottomCartBar from '@/components/menu/BottomCartBar'
import CartSheet from '@/components/menu/CartSheet'

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
    getRestaurantBySlug(slug)
      .then(async (r) => {
        setRestaurant(r)
        const [cats, prods] = await Promise.all([listCategories(r.id), listProducts(r.id)])
        setCategories(cats.filter((c) => c.is_visible))
        setProducts(prods.filter((p) => p.is_available))
        logVisit({ restaurantId: r.id })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const filteredByCategory = useMemo(() => {
    const term = search.trim().toLowerCase()
    // Search spans name AND description, per the "search inside products,
    // categories, description" requirement.
    const bySearch = term
      ? products.filter(
          (p) =>
            p.name.ar.toLowerCase().includes(term) ||
            p.name.en?.toLowerCase().includes(term) ||
            p.description?.ar?.toLowerCase().includes(term)
        )
      : products

    return categories
      .map((cat) => ({ category: cat, products: bySearch.filter((p) => p.category_id === cat.id) }))
      .filter((group) => group.products.length > 0)
  }, [categories, products, search])

  function scrollToCategory(id: string) {
    setActiveCategoryId(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function openProduct(p: Product) {
    setSelectedProduct(p)
    if (restaurant) logVisit({ restaurantId: restaurant.id, productId: p.id })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <MenuSkeleton />
      </div>
    )
  }

  if (notFound || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center px-6">
        <h1 className="font-display text-2xl font-semibold mb-2">المنيو غير موجود</h1>
        <p className="text-stone">الرابط ده مش شغال أو المطعم مش متاح دلوقتي.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper pb-28">
      {/* Cover + identity */}
      <div className="relative h-44 bg-zaytoon overflow-hidden">
        {restaurant.cover_url && (
          <img src={restaurant.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-5 -mt-10 relative">
        <div className="flex items-end gap-4 mb-3">
          <div className="w-20 h-20 rounded-2xl bg-paper border-4 border-paper shadow-lg overflow-hidden shrink-0">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-ink text-saffron flex items-center justify-center font-display font-bold text-xl">
                {restaurant.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="pb-1 flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold truncate">{restaurant.name}</h1>
            <div className="flex items-center gap-2 text-sm text-stone">
              {restaurant.rating > 0 && (
                <span className="flex items-center gap-0.5">
                  <Star size={13} className="text-saffron" fill="currentColor" />
                  {restaurant.rating}
                </span>
              )}
              <span className={`flex items-center gap-1 ${restaurant.is_open ? 'text-zaytoon' : 'text-sumac'}`}>
                <Clock size={13} />
                {restaurant.is_open ? 'مفتوح الآن' : 'مغلق حاليًا'}
              </span>
            </div>
          </div>
        </div>

        {restaurant.description && <p className="text-sm text-stone mb-4">{restaurant.description}</p>}

        {/* Contact row */}
        <div className="flex items-center gap-2 mb-5">
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-paper-dim py-2.5 text-sm font-medium hover:bg-stone-light/30 active:scale-95 transition-all">
              <Phone size={15} /> اتصال
            </a>
          )}
          {restaurant.whatsapp && (
            <a
              href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zaytoon/10 text-zaytoon py-2.5 text-sm font-medium hover:bg-zaytoon/20 active:scale-95 transition-all"
            >
              <MessageCircle size={15} /> واتساب
            </a>
          )}
          {restaurant.google_maps_url && (
            <a
              href={restaurant.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-paper-dim py-2.5 text-sm font-medium hover:bg-stone-light/30 active:scale-95 transition-all"
            >
              <MapPin size={15} /> الموقع
            </a>
          )}
          <button
            onClick={() => navigator.share?.({ title: restaurant.name, url: window.location.href })}
            className="rounded-xl bg-paper-dim p-2.5 hover:bg-stone-light/30 active:scale-95 transition-all"
            aria-label="مشاركة"
          >
            <Share2 size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-light" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دوّر على صنف..."
            className="w-full rounded-full bg-paper-dim pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
          />
        </div>

        {/* Sticky category tabs */}
        <div className="sticky top-0 z-10 bg-paper/90 backdrop-blur-sm py-2 -mx-5 px-5 overflow-x-auto flex gap-2 border-b border-stone-light/30 mb-6">
          {filteredByCategory.map(({ category }) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategoryId === category.id ? 'bg-ink text-paper' : 'bg-paper-dim text-ink hover:bg-stone-light/30'
              }`}
            >
              {category.name.ar}
            </button>
          ))}
        </div>

        {/* Product sections */}
        {filteredByCategory.length === 0 ? (
          <p className="text-center text-stone py-16">مفيش نتائج مطابقة لبحثك.</p>
        ) : (
          filteredByCategory.map(({ category, products: catProducts }) => (
            <div
              key={category.id}
              ref={(el) => {
                sectionRefs.current[category.id] = el
              }}
              className="mb-8 scroll-mt-16"
            >
              <h2 className="font-display font-semibold text-lg mb-3">{category.name.ar}</h2>
              <div className="grid gap-3">
                {catProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onOpen={() => openProduct(p)} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProduct && <ProductDetailSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

      {itemCount > 0 && !cartOpen && <BottomCartBar onOpenCart={() => setCartOpen(true)} />}
      {cartOpen && restaurant && <CartSheet restaurant={restaurant} onClose={() => setCartOpen(false)} />}
    </div>
  )
}

function ProductCard({ product: p, onOpen }: { product: Product; onOpen: () => void }) {
  const { addItem } = useCart()

  function quickAdd(e: React.MouseEvent) {
    e.stopPropagation()
    addItem(
      { productId: p.id, name: p.name.ar, price: p.discount_price ?? p.price, extras: [] },
      1
    )
  }

  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-3 text-right rounded-2xl bg-paper border border-stone-light/30 p-3 hover:border-saffron/40 hover:shadow-sm active:scale-[0.99] transition-all"
    >
      <div className="w-16 h-16 rounded-xl bg-paper-dim overflow-hidden shrink-0">
        {p.images?.[0]?.url && <img src={p.images[0].url} alt="" loading="lazy" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium flex items-center gap-1.5 flex-wrap">
          {p.name.ar}
          {p.is_best_seller && <Star size={12} className="text-saffron" fill="currentColor" />}
          {p.is_new && <Sparkles size={12} className="text-zaytoon" />}
          {p.is_spicy && <Flame size={12} className="text-sumac" />}
          {p.is_vegetarian && <Leaf size={12} className="text-zaytoon" />}
        </p>
        {p.description?.ar && <p className="text-xs text-stone truncate mt-0.5">{p.description.ar}</p>}
        <div className="flex items-baseline gap-2 mt-1">
          {p.discount_price ? (
            <>
              <span className="font-display font-semibold text-saffron-dim text-sm">{p.discount_price} ج.م</span>
              <span className="text-xs text-stone-light line-through">{p.price} ج.م</span>
            </>
          ) : (
            <span className="font-display font-semibold text-sm">{p.price} ج.م</span>
          )}
        </div>
      </div>
      <button
        onClick={quickAdd}
        aria-label="إضافة سريعة"
        className="shrink-0 w-9 h-9 rounded-full bg-saffron text-ink flex items-center justify-center hover:bg-saffron-dim active:scale-90 transition-all"
      >
        <Plus size={16} />
      </button>
    </button>
  )
}

function ProductDetailSheet({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart()
  const [selectedExtras, setSelectedExtras] = useState<OrderItemExtra[]>([])
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')

  const unitPrice = product.discount_price ?? product.price
  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0)
  const finalPrice = (unitPrice + extrasTotal) * quantity

  function toggleExtra(extra: OrderItemExtra) {
    setSelectedExtras((prev) =>
      prev.some((e) => e.name === extra.name) ? prev.filter((e) => e.name !== extra.name) : [...prev, extra]
    )
  }

  function handleAddToCart() {
    addItem(
      { productId: product.id, name: product.name.ar, price: unitPrice, extras: selectedExtras, notes: notes || undefined },
      quantity
    )
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full sm:max-w-md bg-paper rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-48 bg-paper-dim relative">
          {product.images?.[0]?.url && (
            <img src={product.images[0].url} alt="" loading="lazy" className="w-full h-full object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 bg-paper rounded-full p-1.5 shadow"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <h2 className="font-display text-xl font-semibold mb-1 flex items-center gap-2 flex-wrap">
            {product.name.ar}
            {product.is_best_seller && <Star size={16} className="text-saffron" fill="currentColor" />}
            {product.is_new && <Sparkles size={16} className="text-zaytoon" />}
            {product.is_spicy && <Flame size={16} className="text-sumac" />}
            {product.is_vegetarian && <Leaf size={16} className="text-zaytoon" />}
          </h2>
          {product.description?.ar && <p className="text-stone text-sm mb-3">{product.description.ar}</p>}
          <div className="flex items-baseline gap-2 mb-4">
            {product.discount_price ? (
              <>
                <span className="font-display font-bold text-saffron-dim text-lg">{product.discount_price} ج.م</span>
                <span className="text-stone-light line-through">{product.price} ج.م</span>
              </>
            ) : (
              <span className="font-display font-bold text-lg">{product.price} ج.م</span>
            )}
          </div>
          {product.calories != null && (
            <p className="text-sm text-stone mb-2">السعرات الحرارية: {product.calories}</p>
          )}
          {product.ingredients?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium mb-1">المكونات</p>
              <p className="text-sm text-stone">{product.ingredients.join('، ')}</p>
            </div>
          )}
          {product.extras?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">إضافات</p>
              <div className="flex flex-col gap-2">
                {product.extras.map((e) => {
                  const active = selectedExtras.some((s) => s.name === e.name)
                  return (
                    <button
                      key={e.name}
                      onClick={() => toggleExtra(e)}
                      className={`flex justify-between items-center rounded-xl border px-3 py-2 text-sm transition-colors ${
                        active ? 'border-saffron bg-saffron/10' : 'border-stone-light/40 hover:bg-paper-dim'
                      }`}
                    >
                      <span>{e.name}</span>
                      <span className="text-stone">+{e.price} ج.م</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="text-sm font-medium mb-1.5 block">ملاحظات (اختياري)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: من غير بصل"
              className="w-full rounded-xl border border-stone-light/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-full bg-paper-dim px-2 py-1.5">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full bg-paper flex items-center justify-center hover:bg-stone-light/30"
                aria-label="تقليل"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-full bg-paper flex items-center justify-center hover:bg-stone-light/30"
                aria-label="زيادة"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 rounded-full bg-saffron text-ink font-semibold py-3 flex items-center justify-center gap-2 hover:bg-saffron-dim active:scale-[0.98] transition-all"
            >
              <ShoppingBag size={16} />
              أضف للسلة — {finalPrice} ج.م
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function MenuSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-44 bg-paper-dim" />
      <div className="max-w-2xl mx-auto px-5 -mt-10 relative">
        <div className="flex items-end gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-stone-light/40 border-4 border-paper" />
          <div className="flex-1 space-y-2 pb-1">
            <div className="h-5 w-1/2 bg-stone-light/40 rounded-full" />
            <div className="h-3 w-1/3 bg-stone-light/30 rounded-full" />
          </div>
        </div>
        <div className="h-10 bg-stone-light/30 rounded-full mb-6" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 bg-stone-light/30 rounded-full" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-stone-light/20 p-3 mb-3">
            <div className="w-16 h-16 rounded-xl bg-stone-light/30 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-stone-light/30 rounded-full" />
              <div className="h-3 w-1/2 bg-stone-light/20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
