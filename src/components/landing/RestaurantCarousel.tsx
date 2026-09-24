import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Store } from 'lucide-react'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'

const INTERVAL_MS = 3200

export default function RestaurantCarousel() {
  const [items, setItems] = useState<BusinessTypeRecord[]>([])
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    listBusinessTypes().then(setItems).catch(() => setItems([]))
  }, [])

  useEffect(() => {
    if (items.length < 2) return
    const timer = setInterval(() => {
      setDirection(1)
      setIndex((i) => (i + 1) % items.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [items.length])

  useEffect(() => {
    if (index >= items.length && items.length > 0) setIndex(0)
  }, [items.length, index])

  function goTo(i: number) {
    setDirection(i > index ? 1 : -1)
    setIndex(i)
  }

  if (items.length === 0) {
    return (
      <div className="w-64 h-64 rounded-[2rem] bg-gradient-to-br from-saffron to-zaytoon shadow-2xl flex flex-col items-center justify-center gap-4 text-paper">
        <Store size={44} />
        <span className="font-display text-xl font-semibold">كل الأنشطة</span>
      </div>
    )
  }

  const item = items[index]

  return (
    <div className="flex flex-col items-center" style={{ perspective: '1400px' }}>
      <div className="relative w-64 h-64">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={item.id}
            custom={direction}
            initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="absolute inset-0 rounded-[2rem] shadow-2xl overflow-hidden bg-gradient-to-br from-[#23251f] via-[#3b3f31] to-[#b58e45] flex flex-col items-center justify-center gap-4 border border-white/10"
          >
            {item.image_url ? <img src={item.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/5" />
            <div className="relative w-20 h-20 rounded-[26px] bg-white/15 backdrop-blur border border-white/15 flex items-center justify-center text-5xl">
              {item.icon || '🏪'}
            </div>
            <div className="relative text-center px-5">
              <span className="font-display text-xl font-semibold text-paper">{item.name}</span>
              {item.description ? <p className="text-xs text-white/55 mt-2 line-clamp-2">{item.description}</p> : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 mt-6 max-w-[290px] overflow-hidden px-2">
        {items.slice(0, 12).map((businessType, i) => (
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
