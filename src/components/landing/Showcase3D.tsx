import { motion } from 'framer-motion'
import { UtensilsCrossed, Coffee, Store, Sparkles } from 'lucide-react'

const ITEMS = [
  { icon: UtensilsCrossed, label: 'مطاعم', color: 'var(--color-saffron)' },
  { icon: Coffee, label: 'كافيهات', color: 'var(--color-zaytoon)' },
  { icon: Store, label: 'سوبر ماركت', color: 'var(--color-sumac)' },
  { icon: Sparkles, label: 'مستحضرات تجميل', color: 'var(--color-saffron-dim)' },
]

export default function Showcase3D() {
  return (
    <section className="bg-paper-dim py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-medium text-zaytoon bg-zaytoon/10 rounded-full px-3 py-1 mb-4">
            مناسب لأنشطة مختلفة
          </span>
          <h2 className="font-display text-3xl font-semibold mb-3">اختار نشاطك واعرض منتجاتك بمنيو QR احترافي</h2>
          <p className="text-stone max-w-xl mx-auto">
            مطاعم، كافيهات، سوبر ماركت ومستحضرات تجميل — كل نشاط له عرض واضح وسهل للعميل.
          </p>
        </div>

        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          style={{ perspective: '1200px' }}
        >
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="group"
            >
              <motion.div
                animate={{ rotateY: [0, 8, 0, -8, 0], rotateX: [0, -3, 0, 3, 0] }}
                transition={{
                  duration: 7 + i * 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
                whileHover={{ scale: 1.05, rotateY: 0, rotateX: 0 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative rounded-3xl bg-paper border border-stone-light/30 p-6 flex flex-col items-center justify-center gap-3 h-36 shadow-[0_20px_40px_-15px_rgba(20,17,15,0.15)]"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `color-mix(in srgb, ${item.color} 18%, transparent)` }}
                >
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <span className="font-display font-medium text-sm">{item.label}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
