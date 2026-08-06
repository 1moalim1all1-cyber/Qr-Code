import { motion } from 'framer-motion'
import { Sparkles, Zap, ShieldCheck } from 'lucide-react'

const BANNERS = [
  {
    icon: Sparkles,
    title: 'جرّب المنصة مجانًا',
    text: 'ابدأ بباقة Free دلوقتي، من غير أي بطاقة ائتمان.',
    bg: 'linear-gradient(135deg, var(--color-saffron) 0%, var(--color-saffron-dim) 100%)',
    textColor: 'var(--color-ink)',
  },
  {
    icon: Zap,
    title: 'QR جاهز في 5 دقايق',
    text: 'من التسجيل لحد الكود اللي تطبعه — أسرع من ما تتخيل.',
    bg: 'linear-gradient(135deg, var(--color-zaytoon) 0%, var(--color-zaytoon-dim) 100%)',
    textColor: 'var(--color-paper)',
  },
  {
    icon: ShieldCheck,
    title: 'بياناتك في أمان',
    text: 'كل مطعم له مساحته الخاصة، محدّش يشوف بياناتك غيرك.',
    bg: 'linear-gradient(135deg, var(--color-ink) 0%, var(--color-ink-soft) 100%)',
    textColor: 'var(--color-paper)',
  },
]

export default function PromoBanners() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className="grid sm:grid-cols-3 gap-5">
        {BANNERS.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl p-6 min-h-[160px] flex flex-col justify-between relative overflow-hidden"
            style={{ background: b.bg }}
          >
            {/* Decorative floating circle for visual depth */}
            <div
              className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full opacity-20"
              style={{ background: b.textColor }}
            />
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center relative z-10"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
            >
              <b.icon size={20} style={{ color: b.textColor }} />
            </div>
            <div className="relative z-10">
              <h3 className="font-display font-semibold text-lg mb-1" style={{ color: b.textColor }}>
                {b.title}
              </h3>
              <p className="text-sm opacity-90" style={{ color: b.textColor }}>
                {b.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
