import { motion } from 'framer-motion'
import { QrCode, Star, Flame, Search, ArrowLeft } from 'lucide-react'

// Illustrated example items (no photos — see copyright note elsewhere in
// this codebase) so visitors can see exactly what their customers will
// experience after scanning the QR code, without us needing real photography.
const DEMO_CATEGORIES = ['الأكثر طلبًا', 'مشويات', 'مشروبات']

const DEMO_ITEMS = [
  { name: 'مشاوي مشكلة', price: '185', badge: 'الأكثر طلبًا', color: 'var(--color-paprika)', emoji: '🍖' },
  { name: 'كبدة إسكندراني', price: '95', badge: 'حار', color: 'var(--color-sumac)', emoji: '🌶️' },
  { name: 'عصير مانجو طازة', price: '35', badge: null, color: 'var(--color-mint)', emoji: '🥭' },
  { name: 'أرز بالخلطة', price: '40', badge: 'جديد', color: 'var(--color-zaytoon)', emoji: '🍚' },
]

export default function MenuPreviewDemo() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Copy side */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="order-2 md:order-1 text-center md:text-right"
        >
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-mint bg-mint/10 rounded-full px-3 py-1 mb-4">
            <QrCode size={14} />
            كده هيشوف عميلك المنيو بالظبط
          </span>
          <h2 className="font-display text-3xl font-semibold mb-4">
            يمسح الكود... ويلاقي منيوه جاهز في ثانية
          </h2>
          <p className="text-stone leading-relaxed max-w-md mx-auto md:mx-0">
            صور واضحة، أسعار محدّثة، وعلامات زي "الأكثر طلبًا" و"حار" تساعده يقرر بسرعة —
            من غير ما يدوّر أو ينادي على حد.
          </p>
        </motion.div>

        {/* Phone mockup side — the "ad banner" showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="order-1 md:order-2 flex justify-center"
        >
          <div className="w-72 rounded-[2.5rem] bg-ink p-3 shadow-2xl">
            <div className="rounded-[2rem] bg-paper overflow-hidden">
              {/* Cover */}
              <div
                className="h-24 relative"
                style={{ background: 'linear-gradient(135deg, var(--color-zaytoon), var(--color-zaytoon-dim))' }}
              >
                <div className="absolute -bottom-6 right-4 w-14 h-14 rounded-2xl bg-paper border-4 border-paper shadow flex items-center justify-center text-2xl">
                  🍽️
                </div>
              </div>

              <div className="pt-8 px-4 pb-4">
                <p className="font-display font-bold">مطعم بيت المشاوي</p>
                <p className="text-xs text-zaytoon flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zaytoon" /> مفتوح الآن
                </p>

                {/* Search bar */}
                <div className="flex items-center gap-2 bg-paper-dim rounded-full px-3 py-1.5 mt-3">
                  <Search size={12} className="text-stone-light" />
                  <span className="text-xs text-stone-light">دوّر على صنف...</span>
                </div>

                {/* Category chips */}
                <div className="flex gap-1.5 mt-3 overflow-hidden">
                  {DEMO_CATEGORIES.map((c, i) => (
                    <span
                      key={c}
                      className={`shrink-0 text-[10px] font-medium rounded-full px-2.5 py-1 ${
                        i === 0 ? 'bg-ink text-paper' : 'bg-paper-dim text-ink'
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* Item cards */}
                <div className="flex flex-col gap-2 mt-3">
                  {DEMO_ITEMS.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 rounded-xl bg-paper border border-stone-light/30 p-2">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{ backgroundColor: `color-mix(in srgb, ${item.color} 18%, transparent)` }}
                      >
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium flex items-center gap-1 truncate">
                          {item.name}
                          {item.badge === 'الأكثر طلبًا' && <Star size={9} className="text-saffron shrink-0" fill="currentColor" />}
                          {item.badge === 'حار' && <Flame size={9} className="text-sumac shrink-0" />}
                        </p>
                        <p className="text-[10px] font-display font-semibold text-saffron-dim mt-0.5">{item.price} ج.م</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="text-center mt-10">
        <a
          href="#top"
          className="inline-flex items-center gap-2 text-sm font-semibold text-saffron-dim hover:underline"
        >
          جهّز منيو زي ده لمطعمك
          <ArrowLeft size={16} />
        </a>
      </div>
    </section>
  )
}
