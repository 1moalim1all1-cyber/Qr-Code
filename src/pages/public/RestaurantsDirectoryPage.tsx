import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, ExternalLink, Store } from 'lucide-react'
import { listFeaturedRestaurants } from '@/services/restaurants'
import type { Restaurant } from '@/types/database'

export default function RestaurantsDirectoryPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    listFeaturedRestaurants(100)
      .then(setRestaurants)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return restaurants
    return restaurants.filter((r) => r.name.toLowerCase().includes(term) || r.address?.toLowerCase().includes(term))
  }, [restaurants, search])

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-stone-light/30 sticky top-0 bg-paper/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <span className="font-display font-semibold flex items-center gap-2">
            <Store size={18} className="text-saffron-dim" />
            كل المطاعم على Egy Menu
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-light" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دوّر باسم المطعم أو العنوان..."
            className="w-full rounded-full bg-paper-dim pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-paper-dim animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-stone py-16">
            {restaurants.length === 0 ? 'لسه مفيش مطاعم منضمة — كن أول واحد!' : 'مفيش نتائج مطابقة.'}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((r) => (
              <a
                key={r.id}
                href={`${import.meta.env.BASE_URL}m/${r.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-paper border border-stone-light/30 p-3 hover:border-saffron/40 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-ink text-saffron flex items-center justify-center font-bold overflow-hidden shrink-0">
                  {r.logo_url ? <img src={r.logo_url} alt="" className="w-full h-full object-contain p-1 bg-white" /> : r.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{r.name}</p>
                  {r.address && <p className="text-xs text-stone truncate">{r.address}</p>}
                </div>
                <ExternalLink size={14} className="text-stone-light shrink-0" />
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
