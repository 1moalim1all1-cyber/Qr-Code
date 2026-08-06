import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UtensilsCrossed, Coffee, IceCreamCone, Soup, CakeSlice } from 'lucide-react'

// Illustrated (not photographic) scenes representing different venue types —
// avoids any copyright issues with stock restaurant photography while still
// giving a lively, ever-changing visual in the hero banner spot.
const SLIDES = [
  { icon: UtensilsCrossed, label: 'مطاعم', bg: 'linear-gradient(135deg, var(--color-saffron) 0%, var(--color-saffron-dim) 100%)' },
  { icon: Coffee, label: 'كافيهات', bg: 'linear-gradient(135deg, var(--color-zaytoon) 0%, var(--color-zaytoon-dim) 100%)' },
  { icon: CakeSlice, label: 'حلويات', bg: 'linear-gradient(135deg, var(--color-sumac) 0%, #8a2530 100%)' },
  { icon: Soup, label: 'مطابخ شرقية', bg: 'linear-gradient(135deg, var(--color-saffron-dim) 0%, var(--color-zaytoon) 100%)' },
  { icon: IceCreamCone, label: 'آيس كريم وحلا بارد', bg: 'linear-gradient(135deg, var(--color-zaytoon-dim) 0%, var(--color-ink) 100%)' },
]

const INTERVAL_MS = 3200

export default function RestaurantCarousel() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setIndex((i) => (i + 1) % SLIDES.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  function goTo(i: number) {
    setDirection(i > index ? 1 : -1)
    setIndex(i)
  }

  const slide = SLIDES[index]

  return (
    <div className="flex flex-col items-center" style={{ perspective: '1400px' }}>
      <div className="relative w-64 h-64">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d', background: slide.bg }}
            className="absolute inset-0 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <slide.icon size={40} className="text-paper" />
            </div>
            <span className="font-display text-xl font-semibold text-paper">{slide.label}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 mt-6">
        {SLIDES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => goTo(i)}
            aria-label={s.label}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-saffron' : 'w-1.5 bg-stone-light/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
