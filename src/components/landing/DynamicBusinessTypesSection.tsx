import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'

const HIDDEN_HOME_TYPES = new Set(['restaurant', 'cafe', 'supermarket', 'cosmetics'])

const FALLBACK_IMAGES: Record<string, string> = {
  mobiles: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80',
  clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80',
  shoes_bags: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  perfumes: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
  pharmacy: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
  homeware: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  bookstores: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=900&q=80',
  sweets_bakery: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
  auto_parts: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
  decor_finishing: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
  ceramics_sanitary: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
}

const GENERIC_STORE_IMAGE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80'

export default function DynamicBusinessTypesSection() {
  const [items, setItems] = useState<BusinessTypeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listBusinessTypes()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const homepageItems = useMemo(
    () => items.filter((item) => !HIDDEN_HOME_TYPES.has(item.code)),
    [items],
  )

  return (
    <section className="bg-[#efe9df] py-14 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-7">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-[#756d61]">متاجر حديثة لأنشطة مختلفة</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">اكتشف الأنشطة والمتاجر</h2>
            <p className="text-sm text-[#776f63] mt-2 max-w-2xl leading-6">موبايلات، إلكترونيات، ملابس، عطور، صيدليات، أثاث وتشطيبات وغيرهم.</p>
          </div>
          <Link to="/restaurants" className="inline-flex items-center gap-2 rounded-2xl bg-[#171714] text-white px-4 py-2.5 text-sm font-bold self-start sm:self-auto">كل المتاجر <ArrowLeft size={16} /></Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="h-56 rounded-[26px] bg-white/70 animate-pulse" />)}</div>
        ) : homepageItems.length === 0 ? (
          <div className="rounded-[28px] border border-black/5 bg-[#f8f4ed] p-8 text-center text-[#776f63]"><Store className="mx-auto mb-3 opacity-40" />أنواع الأنشطة هتظهر هنا تلقائيًا.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {homepageItems.map((item) => {
              const image = item.image_url || FALLBACK_IMAGES[item.code] || GENERIC_STORE_IMAGE
              return (
                <Link key={item.id} to={`/restaurants?type=${encodeURIComponent(item.code)}`} className="group rounded-[26px] bg-[#f8f4ed] border border-black/5 overflow-hidden shadow-[0_16px_36px_rgba(53,45,34,.07)] hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(53,45,34,.11)] transition-all">
                  <div className="relative h-32 sm:h-40 overflow-hidden bg-[#ddd3c5]">
                    <img src={image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                    <div className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-black/65 backdrop-blur text-white flex items-center justify-center text-xl border border-white/15">{item.icon || '🏪'}</div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-display font-bold leading-6">{item.name}</h3>
                    <p className="text-xs text-[#776f63] leading-5 mt-1 line-clamp-2">{item.description || 'متاجر ومنتجات متخصصة على Egy Menu'}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8d7444] mt-3">عرض المتاجر <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" /></span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
