import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, ExternalLink } from 'lucide-react'
import { listFeaturedRestaurants } from '@/services/restaurants'
import { listProducts } from '@/services/products'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import type { Restaurant, Product } from '@/types/database'

interface FeaturedEntry {
  restaurant: Restaurant
  products: Product[]
}

export default function FeaturedMenus() {
  const [entries, setEntries] = useState<FeaturedEntry[]>([])
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listFeaturedRestaurants(6), listBusinessTypes()])
      .then(async ([restaurants, types]) => {
        setBusinessTypes(types)
        const withProducts = await Promise.all(
          restaurants.map(async (restaurant) => {
            const products = await listProducts(restaurant.id).catch(() => [])
            return { restaurant, products: products.filter((p) => p.is_available).slice(0, 3) }
          })
        )
        setEntries(withProducts.filter((e) => e.products.length > 0))
      })
      .finally(() => setLoading(false))
  }, [])

  const typeMap = useMemo(() => new Map(businessTypes.map((item) => [item.code, item])), [businessTypes])

  if (!loading && entries.length === 0) return null

  return (
    <section id="menus" className="bg-paper-dim py-20 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zaytoon bg-zaytoon/10 rounded-full px-3 py-1 mb-4">
            <Store size={14} />
            متاجر وكتالوجات حقيقية على المنصة
          </span>
          <h2 className="font-display text-3xl font-semibold">اكتشف المتاجر على Egy Menu</h2>
          <p className="mt-3 text-sm text-stone">مطاعم، كافيهات، موبايلات، ملابس، إلكترونيات وأنشطة تانية في كتالوج واحد احترافي.</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-paper h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {entries.map(({ restaurant, products }, i) => {
              const type = typeMap.get(restaurant.business_type || '')
              const typeName = restaurant.business_type_name || type?.name || 'متجر'
              return (
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
                  <div className="h-24 bg-zaytoon relative overflow-hidden">
                    {restaurant.cover_url && (
                      <img src={restaurant.cover_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                    <span className="absolute left-3 bottom-3 rounded-full bg-black/45 backdrop-blur px-2.5 py-1 text-[10px] text-white">{type?.icon || '🏪'} {typeName}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-ink text-saffron flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                        {restaurant.logo_url ? (
                          <img src={restaurant.logo_url} alt="" className="w-full h-full object-contain p-0.5 bg-white" />
                        ) : (
                          restaurant.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-semibold text-sm truncate">{restaurant.name}</p>
                        <p className="text-[11px] text-stone mt-0.5 truncate">{restaurant.address || typeName}</p>
                      </div>
                      <ExternalLink size={13} className="text-stone-light group-hover:text-saffron-dim transition-colors shrink-0" />
                    </div>
                    <ul className="space-y-1.5">
                      {products.map((p) => (
                        <li key={p.id} className="flex justify-between gap-3 text-xs text-stone">
                          <span className="truncate">{p.name.ar}</span>
                          <span className="shrink-0 text-saffron-dim font-medium">{p.discount_price || p.price} ج.م</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.a>
              )
            })}
          </div>
        )}

        <div className="text-center mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-block rounded-full bg-saffron text-ink px-6 py-2.5 text-sm font-semibold hover:bg-saffron-dim transition-colors"
          >
            اعرض متجرك هنا
          </Link>
          <Link
            to="/restaurants"
            className="inline-block rounded-full bg-paper border border-stone-light/40 text-ink px-6 py-2.5 text-sm font-semibold hover:bg-paper-dim transition-colors"
          >
            شوف كل المتاجر
          </Link>
        </div>
      </div>
    </section>
  )
}
