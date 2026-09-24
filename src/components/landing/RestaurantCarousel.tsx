import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Store } from 'lucide-react'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'

const INTERVAL_MS = 3200
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

export default function RestaurantCarousel() {
  const [items, setItems] = useState<BusinessTypeRecord[]>([])
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    listBusinessTypes().then(setItems).catch(() => setItems([]))
  }, [])

  const visibleItems = useMemo(
    () => items.filter((item) => !HIDDEN_HOME_TYPES.has(item.code)),
    [items],
  )

  useEffect(() => {
    if (visibleItems.length < 2) return
    const timer = setInterval(() => {
      setDirection(1)
      setIndex((i) => (i + 1) % visibleItems.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [visibleItems.length])

  useEffect(() => {
    if (index >= visibleItems.length && visibleItems.length > 0) setIndex(0)
  }, [visibleItems.length, index])

  function goTo(i: number) {
    setDirection(i > index ? 1 : -1)
    setIndex(i)
  }

  if (visibleItems.length === 0) {
    return (
      <Link to="/restaurants" className="w-64 h-64 rounded-[2rem] bg-gradient-to-br from-saffron to-zaytoon shadow-2xl flex flex-col items-center justify-center gap-4 text-paper">
        <Store size={44} />
        <span className="font-display text-xl font-semibold">كل الأنشطة</span>
      </Link>
    )
  }

  const item = visibleItems[index]
  const image = item.image_url || FALLBACK_IMAGES[item.code] || GENERIC_STORE_IMAGE

  return (
    <div className="flex flex-col items-center" style={{ perspective: '1400px' }}>
      <div className="relative w-72 h-72 sm:w-80 sm:h-80">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={item.id}
            custom={direction}
            initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="absolute inset-0 rounded-[2rem] shadow-2xl overflow-hidden bg-[#23251f] border border-white/10"
          >
            <Link to={`/restaurants?type=${encodeURIComponent(item.code)}`} className="absolute inset-0 flex flex-col items-center justify-end group">
              <img src={image} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative w-full p-6 text-right text-white">
                <div className="w-14 h-14 rounded-2xl bg-black/55 backdrop-blur border border-white/15 flex items-center justify-center text-3xl mb-4">{item.icon || '🏪'}</div>
                <span className="font-display text-2xl font-semibold">{item.name}</span>
                {item.description ? <p className="text-sm text-white/65 mt-2 line-clamp-2">{item.description}</p> : null}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#ead19a]">عرض المتاجر <ArrowLeft size={14} /></span>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 mt-6 max-w-[320px] overflow-hidden px-2">
        {visibleItems.slice(0, 12).map((businessType, i) => (
          <button
            key={businessType.id}
            onClick={() => goTo(i)}
            aria-label={businessType.name}
            className={`h-1.5 rounded-full transition-all shrink-0 ${i === index ? 'w-6 bg-saffron' : 'w-1.5 bg-stone-light/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
