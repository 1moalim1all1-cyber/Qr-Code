import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
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
    Promise.all([listFeaturedRestaurants(12), listBusinessTypes()])
      .then(async ([restaurants, types]) => {
        setBusinessTypes(types)
        const withProducts = await Promise.all(
          restaurants.map(async (restaurant) => {
            const products = await listProducts(restaurant.id).catch(() => [])
            return { restaurant, products: products.filter((p) => p.is_available).slice(0, 3) }
          })
        )
        setEntries(withProducts.slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [])

  const typeMap = useMemo(() => new Map(businessTypes.map((item) => [item.code, item])), [businessTypes])

  if (!loading && entries.length === 0) return null

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="rounded-2xl bg-white/5 h-48 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {entries.map(({ restaurant, products }, i) => {
            const type = typeMap.get(restaurant.business_type || '')
            const typeName = restaurant.business_type_name || type?.name || 'متجر'
            return (
              <motion.a
                key={restaurant.id}
                href={`${import.meta.env.BASE_URL}m/${restaurant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-[#d7b66f]/40 transition-all group"
              >
                <div className="h-28 sm:h-36 bg-[#3f4737] relative overflow-hidden">
                  {restaurant.cover_url ? <img src={restaurant.cover_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : type?.image_url ? <img src={type.image_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-4xl">{type?.icon || '🏪'}</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute right-2 bottom-2 rounded-full bg-black/45 backdrop-blur px-2 py-1 text-[9px] sm:text-[10px] text-white">{type?.icon || '🏪'} {typeName}</span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#d7b66f] text-[#171714] flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                      {restaurant.logo_url ? <img src={restaurant.logo_url} alt="" className="w-full h-full object-contain bg-white" /> : restaurant.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1"><p className="font-display font-semibold text-xs sm:text-sm truncate">{restaurant.name}</p><p className="text-[10px] text-white/45 mt-0.5 truncate">{restaurant.address || typeName}</p></div>
                    <ExternalLink size={12} className="text-white/35 shrink-0" />
                  </div>
                  {products.length > 0 ? <ul className="space-y-1 mt-3 hidden sm:block">{products.slice(0, 2).map((p) => <li key={p.id} className="flex justify-between gap-2 text-[11px] text-white/55"><span className="truncate">{p.name.ar}</span><span className="shrink-0 text-[#d7b66f]">{p.discount_price || p.price} ج</span></li>)}</ul> : <p className="mt-3 text-[10px] text-white/35">المتجر جاهز لاستقبال المنتجات</p>}
                </div>
              </motion.a>
            )
          })}
        </div>
      )}

      <div className="text-center mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link to="/register?src=stores-home" className="rounded-full bg-[#d7b66f] text-[#171714] px-5 py-2.5 text-sm font-bold">اعرض متجرك هنا</Link>
        <Link to="/restaurants" className="rounded-full border border-white/15 text-white px-5 py-2.5 text-sm font-semibold">كل المتاجر</Link>
      </div>
    </div>
  )
}
