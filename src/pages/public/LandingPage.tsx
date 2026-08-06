import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  QrCode, Utensils, BarChart3, Palette, ArrowLeft,
  ChevronDown, AtSign, Globe, MessageCircle,
} from 'lucide-react'
import Showcase3D from '@/components/landing/Showcase3D'
import PromoBanners from '@/components/landing/PromoBanners'
import RestaurantCarousel from '@/components/landing/RestaurantCarousel'

const SUPPORT_WHATSAPP = '201006923454'

const NAV_LINKS = [
  { label: 'الرئيسية', href: '#top' },
  { label: 'المميزات', href: '#features' },
  { label: 'كيف يعمل', href: '#how' },
  { label: 'الأسئلة الشائعة', href: '#faq' },
]

const features = [
  {
    icon: QrCode,
    title: 'QR لكل طاولة وفرع',
    text: 'ولّد كود مخصص فورًا، بلونك وشعارك، وحمّله جاهزًا للطباعة.',
  },
  {
    icon: Utensils,
    title: 'منيو يتحدّث بلغتين',
    text: 'أضف أصنافك بالعربي والإنجليزي، مع صور وفيديو ومكوّنات لكل طبق.',
  },
  {
    icon: BarChart3,
    title: 'تعرف عملاءك أكتر',
    text: 'زيارات، مسحات QR، وأكتر الأصناف طلبًا — كل ده في لوحة تحكم واحدة.',
  },
  {
    icon: Palette,
    title: 'شكل المنيو بإيدك',
    text: 'غيّر الألوان والخط والوضع الليلي من الإعدادات، من غير أي كود.',
  },
]

const STEPS = [
  { number: '1', title: 'سجّل حسابك', text: 'أنشئ حسابك مجانًا في أقل من دقيقة بإيميلك أو رقم تليفونك.' },
  { number: '2', title: 'أضف منتجاتك', text: 'أضف أقسامك وأصنافك بالصور والأسعار من لوحة التحكم.' },
  { number: '3', title: 'شارك المنيو', text: 'اطبع كود الـ QR أو شاركه على واتساب والسوشيال ميديا.' },
]

const FAQS = [
  {
    q: 'إيه هو المنيو الإلكتروني؟',
    a: 'قائمة طعام رقمية يمسحها العميل بكاميرة موبايله عن طريق كود QR أو رابط مباشر، تعمل على أي جهاز من غير تحميل تطبيق.',
  },
  {
    q: 'إزاي عميلي يبعتلي طلب؟',
    a: 'العميل بيختار أصنافه من السلة، وبعدين يختار يطلب داخل المطعم أو استلام أو دليفري أو يبعت الطلب مباشرة على واتساب مطعمك.',
  },
  {
    q: 'هل ينفع أطبع كود الـ QR؟',
    a: 'أيوه، من لوحة التحكم تقدر تحمّل الكود PNG أو SVG أو PDF جاهز للطباعة، وتختار لونه وشكله واللوجو جواه.',
  },
  {
    q: 'المنصة بتدعم العربي والإنجليزي؟',
    a: 'أيوه، تقدر تكتب اسم ووصف كل صنف بالعربي والإنجليزي، والواجهة كاملة RTL.',
  },
]

const STATS = [
  { value: '5 دقائق', label: 'وقت الإعداد' },
  { value: '0 ج.م', label: 'تكلفة البداية' },
  { value: '24/7', label: 'دعم فني مباشر' },
]

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-paper text-ink font-body">
      {/* Nav — dark with a subtle animated gradient sheen, sticky */}
      <header className="sticky top-0 z-20 relative overflow-hidden bg-ink border-b border-white/10">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(90deg, color-mix(in srgb, var(--color-ink) 100%, transparent) 0%, color-mix(in srgb, var(--color-zaytoon-dim) 55%, var(--color-ink)) 50%, color-mix(in srgb, var(--color-ink) 100%, transparent) 100%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="font-display text-xl font-semibold text-paper shrink-0 flex items-center gap-2">
            <QrCode className="text-saffron" size={20} />
            Smart QR Menu
          </span>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-stone-light hover:text-paper transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/login" className="text-sm font-medium text-stone-light hover:text-paper transition-colors">
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-gradient-to-l from-saffron to-zaytoon text-ink px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              ابدأ مجانًا
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — dark with a soft aurora glow, matching the brand's requested reference style */}
      <section className="relative bg-ink overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--color-zaytoon) 35%, transparent) 0%, transparent 70%), radial-gradient(40% 80% at 30% 10%, color-mix(in srgb, var(--color-saffron) 25%, transparent) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-saffron bg-saffron/10 border border-saffron/20 rounded-full px-4 py-1.5 mb-6">
              منصة منيو إلكتروني بكود QR
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.2] mb-5 text-paper">
              منيو إلكتروني QR لمطعمك أو كافيهك
            </h1>
            <p className="text-stone-light text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              منيو رقمي سريع مع تحديث الأسعار والأقسام والعروض من غير طباعة متكررة — وطلبات مباشرة من العميل لمطعمك.
            </p>
            <div className="flex items-center justify-center gap-4 mb-14 flex-wrap">
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-l from-saffron to-zaytoon text-ink px-7 py-3.5 font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-saffron/10"
              >
                أنشئ منيوك الآن
                <ArrowLeft size={18} />
              </Link>
              <a
                href="#features"
                className="rounded-full border border-white/20 text-paper px-7 py-3.5 font-semibold hover:bg-white/5 transition-colors"
              >
                شوف المميزات
              </a>
            </div>
          </motion.div>

          {/* Stats — glass cards, honest claims about the product itself */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-3 sm:gap-4"
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-5 sm:py-6"
              >
                <p className="font-display text-xl sm:text-2xl font-bold text-paper">{s.value}</p>
                <p className="text-xs sm:text-sm text-stone-light mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Rotating 3D showcase — cycles through venue types automatically */}
      <section className="max-w-6xl mx-auto px-6 py-16 flex justify-center">
        <RestaurantCarousel />
      </section>

      <PromoBanners />

      <Showcase3D />

      {/* Features */}
      <section id="features" className="bg-ink text-paper py-20 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl font-semibold mb-12 text-center">كل حاجة محتاجها في منصة واحدة</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl bg-ink-soft p-6"
              >
                <f.icon className="text-saffron mb-4" size={26} />
                <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-stone-light text-sm leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-sm font-medium text-saffron-dim bg-saffron/10 rounded-full px-3 py-1 mb-4">
              كيف يعمل؟
            </span>
            <h2 className="font-display text-3xl font-semibold">ثلاث خطوات بس عشان تبدأ</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-saffron text-ink font-display font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.number}
                </div>
                <h3 className="font-display font-semibold mb-2">{s.title}</h3>
                <p className="text-stone text-sm leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-paper-dim py-20 scroll-mt-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl font-semibold text-center mb-10">الأسئلة الشائعة</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} question={f.q} answer={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-semibold mb-4">جاهز تنقل مطعمك للعالم الرقمي؟</h2>
        <p className="text-stone mb-8">أنشئ منيو إلكتروني احترافي في 5 دقائق.</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-full bg-saffron text-ink px-8 py-3.5 font-semibold hover:bg-saffron-dim transition-colors"
        >
          أنشئ منيوك الآن
          <ArrowLeft size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-light/20">
        <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-8">
          <div>
            <span className="font-display text-lg font-semibold">Smart QR Menu</span>
            <p className="text-stone text-sm mt-2 leading-relaxed">
              منصة عربية لإنشاء منيو إلكتروني احترافي وإدارة طلبات المطاعم والكافيهات.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" aria-label="Instagram" className="text-stone hover:text-ink transition-colors">
                <AtSign size={18} />
              </a>
              <a href="#" aria-label="Website" className="text-stone hover:text-ink transition-colors">
                <Globe size={18} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm">روابط سريعة</h4>
            <ul className="flex flex-col gap-2 text-sm text-stone">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-ink transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm">ابدأ الآن</h4>
            <Link
              to="/register"
              className="inline-block rounded-full bg-ink text-paper px-5 py-2 text-sm font-medium hover:bg-ink-soft transition-colors"
            >
              أنشئ منيو مجاني
            </Link>
          </div>
        </div>
        <div className="border-t border-stone-light/20 py-5 text-center text-xs text-stone">
          © {new Date().getFullYear()} Smart QR Menu — جميع الحقوق محفوظة
        </div>
      </footer>

      {SUPPORT_WHATSAPP && (
        <a
          href={`https://wa.me/${SUPPORT_WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 left-5 z-30 w-14 h-14 rounded-full bg-zaytoon text-paper flex items-center justify-center shadow-xl hover:opacity-90 transition-opacity"
          aria-label="تواصل معانا على واتساب"
        >
          <MessageCircle size={26} />
        </a>
      )}
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl bg-paper border border-stone-light/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-right font-medium"
      >
        {question}
        <ChevronDown size={18} className={`text-stone transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-stone leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
