import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, ExternalLink } from 'lucide-react'
import { listFeaturedRestaurants } from '@/services/restaurants'
import { listProducts } from '@/services/products'
import type { Restaurant, Product } from '@/types/database'

interface FeaturedEntry {
  restaurant: Restaurant
  products: Product[]
}

export default function FeaturedMenus() {
  const [entries, setEntries] = useState<FeaturedEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listFeaturedRestaurants(6)
      .then(async (restaurants) => {
        const withProducts = await Promise.all(
          restaurants.map(async (restaurant) => {
            const products = await listProducts(restaurant.id).catch(() => [])
            return { restaurant, products: products.filter((p) => p.is_available).slice(0, 3) }
          })
        )
        // Only show restaurants that actually have something on their menu
        setEntries(withProducts.filter((e) => e.products.length > 0))
      })
      .finally(() => setLoading(false))
  }, [])

  // Nothing to show yet (new platform) — don't render an empty/awkward section
  if (!loading && entries.length === 0) return null

  return (
    <section id="menus" className="bg-paper-dim py-20 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zaytoon bg-zaytoon/10 rounded-full px-3 py-1 mb-4">
            <Store size={14} />
            منيوهات حقيقية على المنصة
          </span>
          <h2 className="font-display text-3xl font-semibold">مطاعم بتستخدم Egy Menu دلوقتي</h2>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-paper h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {entries.map(({ restaurant, products }, i) => (
              <motion.a
                key={restaurant.id}
                href={`${import.meta.env.BASE_URL}m/${restaurant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl bg-paper border border-stone-light/30 overflow-hidden hover:border-saffron/40 hover:shadow-md transition-all group"
              >
                <div className="h-20 bg-zaytoon relative">
                  {restaurant.cover_url && (
                    <img src={restaurant.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-ink text-saffron flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                      {restaurant.logo_url ? (
                        <img src={restaurant.logo_url} alt="" className="w-full h-full object-contain p-0.5 bg-white" />
                      ) : (
                        restaurant.name.charAt(0)
                      )}
                    </div>
                    <p className="font-display font-semibold text-sm truncate flex-1">{restaurant.name}</p>
                    <ExternalLink size={13} className="text-stone-light group-hover:text-saffron-dim transition-colors shrink-0" />
                  </div>
                  <ul className="space-y-1">
                    {products.map((p) => (
                      <li key={p.id} className="flex justify-between text-xs text-stone">
                        <span className="truncate">{p.name.ar}</span>
                        <span className="shrink-0 text-saffron-dim font-medium">{p.discount_price ?? p.price} ج.م</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        <div className="text-center mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-block rounded-full bg-saffron text-ink px-6 py-2.5 text-sm font-semibold hover:bg-saffron-dim transition-colors"
          >
            اعرض منيو مطعمك هنا كمان
          </Link>
          <Link
            to="/restaurants"
            className="inline-block rounded-full bg-paper border border-stone-light/40 text-ink px-6 py-2.5 text-sm font-semibold hover:bg-paper-dim transition-colors"
          >
            شوف كل المطاعم
          </Link>
        </div>
      </div>
    </section>
  )
}
