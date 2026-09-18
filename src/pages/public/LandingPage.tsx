import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  Palette,
  QrCode,
  ShoppingBag,
  Sparkles,
  Store,
  Utensils,
} from 'lucide-react'
import FeaturedMenus from '@/components/landing/FeaturedMenus'
import RestaurantCarousel from '@/components/landing/RestaurantCarousel'
import Showcase3D from '@/components/landing/Showcase3D'

const SUPPORT_WHATSAPP = '201039177959'

const NAV_LINKS = [
  { label: 'الرئيسية', href: '#top' },
  { label: 'المميزات', href: '#features' },
  { label: 'نماذج المنيو', href: '#menus' },
  { label: 'الباقات', href: '#pricing' },
  { label: 'الأسئلة', href: '#faq' },
]

const features = [
  { icon: QrCode, title: 'QR جاهز فورًا', text: 'رابط وكود QR للنشاط جاهزين للمشاركة والطباعة.' },
  { icon: Palette, title: 'أشكال 3D متعددة', text: 'غير شكل المنيو والكروت من غير ما تغيّر المنتجات أو الأسعار.' },
  { icon: ShoppingBag, title: 'طلبات وسلة', text: 'عميلك يختار المنتجات ويضيف للسلة ويكمل الطلب بسهولة.' },
  { icon: BarChart3, title: 'إدارة كاملة', text: 'تحكم في الأصناف والأسعار والعروض والطلبات من لوحة واحدة.' },
]

const businessTypes = [
  { icon: Utensils, title: 'مطاعم وكافيهات', text: 'منيو بصري سريع وواضح للأطباق والمشروبات.' },
  { icon: Store, title: 'سوبر ماركت', text: 'كتالوج منتجات جاهز، العميل يختار المنتج ويضيف السعر.' },
  { icon: Sparkles, title: 'مستحضرات تجميل', text: 'عرض مناسب للبراندات والصور والدرجات والأحجام.' },
]

const plans = [
  { title: 'شهر', text: 'مناسب للتجربة والبدايات' },
  { title: '3 شهور', text: 'تشغيل مريح بدون تجديد قريب' },
  { title: '6 شهور', text: 'اختيار عملي للنشاط المستقر' },
  { title: 'سنة', text: 'الأوفر للاستمرار', badge: 'الأوفر' },
]

const FAQS = [
  { q: 'هل المنيو مناسب لكل الأنشطة؟', a: 'أيوه. النظام مناسب للمطاعم والكافيهات والسوبر ماركت ومستحضرات التجميل، وكل نشاط له طريقة عرض تناسبه.' },
  { q: 'هل أقدر أغيّر شكل المنيو؟', a: 'أيوه. تقدر تختار قالب وشكل كروت مختلف، والتغيير بيظهر على المنيو من غير ما يأثر على المنتجات والأسعار.' },
  { q: 'هل العميل محتاج ينزل تطبيق؟', a: 'لا. العميل بيفتح المنيو مباشرة من الرابط أو كود QR من أي موبايل.' },
  { q: 'هل أقدر أعدّل الأسعار في أي وقت؟', a: 'أيوه، الأسعار والأصناف والعروض تقدر تعدلها من لوحة التحكم في أي وقت.' },
]

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-white/10 bg-white/[0.055] backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,.28)] ${className}`}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div id="top" className="min-h-screen bg-[#efe9df] text-[#171714] overflow-hidden" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#10110f]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-7 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-white shrink-0">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d7b66f] to-[#8d7444] flex items-center justify-center shadow-[0_10px_30px_rgba(215,182,111,.25)]">
              <QrCode size={21} className="text-[#171714]" />
            </span>
            <div>
              <div className="font-display font-bold leading-none">Egy Menu</div>
              <div className="text-[10px] text-white/45 mt-1">Digital menu platform</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">{item.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="hidden sm:inline-flex text-sm text-white/65 hover:text-white px-3 py-2">دخول</Link>
            <Link to="/register" className="rounded-2xl bg-[#d7b66f] text-[#181713] px-4 sm:px-5 py-2.5 text-sm font-bold shadow-[0_10px_26px_rgba(215,182,111,.18)] hover:-translate-y-0.5 transition-transform">ابدأ مجانًا</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative bg-[#10110f] text-white min-h-[760px] flex items-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-28 -right-24 w-[430px] h-[430px] rounded-full bg-[#6d7758]/25 blur-3xl" />
            <div className="absolute top-20 -left-24 w-[420px] h-[420px] rounded-full bg-[#d7b66f]/15 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '38px 38px' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-5 sm:px-7 py-20 lg:py-28 w-full grid lg:grid-cols-[1fr_520px] gap-14 items-center">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d7b66f]/25 bg-[#d7b66f]/10 text-[#ead19a] px-4 py-2 text-sm mb-6">
                <Sparkles size={15} /> تجربة 10 أيام + تصميمات 3D
              </span>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] max-w-3xl">
                خلي منيو نشاطك
                <span className="block text-transparent bg-clip-text bg-gradient-to-l from-[#ead19a] via-[#d7b66f] to-[#9eaa83]">يبان أغلى وأوضح وأسهل في الطلب</span>
              </h1>

              <p className="text-white/58 text-base sm:text-lg leading-8 mt-6 max-w-2xl">
                منصة واحدة للمطاعم والكافيهات والسوبر ماركت ومستحضرات التجميل. صور، أسعار، طلبات، QR، وقوالب 3D تتغير من لوحة التحكم.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/register" className="rounded-2xl bg-[#d7b66f] text-[#171714] px-6 py-3.5 font-bold flex items-center gap-2 shadow-[0_18px_45px_rgba(215,182,111,.2)] hover:-translate-y-1 transition-transform">
                  أنشئ منيوك الآن <ArrowLeft size={18} />
                </Link>
                <a href="#menus" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold hover:bg-white/10 transition-colors">شوف أشكال المنيو</a>
              </div>

              <div className="grid grid-cols-3 max-w-xl gap-3 mt-10">
                {[
                  ['10 أيام', 'تجربة مجانية'],
                  ['3D', 'قوالب وأشكال'],
                  ['24/7', 'منيو متاح'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-4 text-center">
                    <div className="font-display text-xl sm:text-2xl font-bold text-[#ead19a]">{value}</div>
                    <div className="text-[11px] sm:text-xs text-white/45 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.94, rotateY: -8 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: 0.75, delay: 0.15 }} className="relative [perspective:1200px]">
              <div className="absolute inset-10 bg-[#d7b66f]/20 blur-3xl rounded-full" />
              <div className="relative rounded-[38px] border border-white/10 bg-gradient-to-br from-[#26271f] to-[#0c0d0b] p-4 shadow-[0_50px_100px_rgba(0,0,0,.55)] [transform:rotateY(-7deg)_rotateX(3deg)]">
                <div className="rounded-[30px] overflow-hidden bg-[#f5f0e8] text-[#191915] min-h-[590px] border border-white/10">
                  <div className="h-36 bg-gradient-to-br from-[#596049] via-[#373a30] to-[#161713] relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    <div className="absolute right-5 bottom-4 text-white">
                      <div className="text-xs text-white/55">Egy Menu Demo</div>
                      <div className="font-display text-2xl font-bold mt-1">Urban Kitchen</div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex gap-2 overflow-hidden mb-4">
                      {['الأكثر طلبًا', 'وجبات', 'مشروبات'].map((x, i) => <div key={x} className={`shrink-0 rounded-full px-4 py-2 text-xs ${i === 0 ? 'bg-[#171714] text-white' : 'bg-[#e5ddd0]'}`}>{x}</div>)}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['برجر كلاسيك', '125'],
                        ['باستا كريمي', '155'],
                        ['قهوة باردة', '85'],
                        ['تشيز كيك', '95'],
                      ].map(([name, price], i) => (
                        <div key={name} className="rounded-[24px] bg-white p-3 border border-black/5 shadow-[0_15px_30px_rgba(0,0,0,.09)]" style={{ transform: `perspective(600px) rotateY(${i % 2 ? -2 : 2}deg)` }}>
                          <div className="aspect-[4/3] rounded-[18px] bg-gradient-to-br from-[#d8c6a5] via-[#bba77f] to-[#687057] flex items-center justify-center text-white/80">
                            <Utensils size={26} />
                          </div>
                          <div className="mt-3 font-semibold text-sm">{name}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold">{price} ج.م</span>
                            <span className="w-7 h-7 rounded-full bg-[#d7b66f] flex items-center justify-center font-bold">+</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <GlassCard className="absolute -left-4 sm:-left-10 top-16 rounded-2xl p-4 text-white w-40 [transform:translateZ(40px)]">
                <div className="text-[#ead19a] text-xs">القالب</div>
                <div className="font-bold mt-1">3D فاخر</div>
                <div className="text-[11px] text-white/45 mt-2">عمق + ظل + حركة</div>
              </GlassCard>

              <GlassCard className="absolute -right-3 sm:-right-8 bottom-16 rounded-2xl p-4 text-white w-44 [transform:translateZ(50px)]">
                <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-[#9eaa83]" /><span className="font-semibold text-sm">مناسب للموبايل</span></div>
                <div className="text-[11px] text-white/45 mt-2">تصميم واضح وسريع في الطلب</div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        <section className="bg-[#efe9df] py-14 border-b border-black/5">
          <div className="max-w-7xl mx-auto px-5 sm:px-7">
            <div className="text-center mb-8">
              <p className="text-sm text-[#756d61]">مناسب لأنواع أنشطة مختلفة</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">نفس المنصة، شكل مناسب لكل نشاط</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {businessTypes.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-[28px] bg-[#f8f4ed] border border-black/5 p-6 shadow-[0_20px_40px_rgba(53,45,34,.07)] hover:-translate-y-1 transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-[#171714] text-[#d7b66f] flex items-center justify-center mb-4 shadow-lg"><item.icon size={22} /></div>
                  <h3 className="font-display font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-[#776f63] leading-6 mt-2">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="menus" className="py-18 bg-[#151612] text-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-7 pt-16">
            <div className="max-w-2xl mb-9">
              <span className="text-[#d7b66f] text-sm font-semibold">نماذج حقيقية للشكل</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">شوف المنيو قبل ما تختار شكله</h2>
              <p className="text-white/50 mt-3 leading-7">اختار شكل العرض اللي يناسب نشاطك، وبعد التسجيل تقدر تغيّره في أي وقت.</p>
            </div>
            <div className="pb-14"><FeaturedMenus /></div>
          </div>
        </section>

        <section className="py-16 bg-[#efe9df]">
          <div className="max-w-7xl mx-auto px-5 sm:px-7">
            <RestaurantCarousel />
          </div>
        </section>

        <section id="features" className="py-20 bg-[#f7f2ea] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-7">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[#8d7444] text-sm font-semibold">كل حاجة من مكان واحد</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">شكل احترافي وتشغيل بسيط</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, i) => (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="rounded-[26px] bg-white p-6 border border-black/5 shadow-[0_18px_40px_rgba(0,0,0,.06)]">
                  <div className="w-11 h-11 rounded-2xl bg-[#ece5d9] text-[#657052] flex items-center justify-center mb-4"><feature.icon size={21} /></div>
                  <h3 className="font-display font-bold">{feature.title}</h3>
                  <p className="text-sm text-[#776f63] leading-6 mt-2">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Showcase3D />

        <section id="pricing" className="py-20 bg-[#11120f] text-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-7">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[#d7b66f] text-sm font-semibold">اشتراك مرن</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">اختار المدة المناسبة لنشاطك</h2>
              <p className="text-white/45 mt-3">ابدأ بالتجربة المجانية وبعدها جدّد بالمدة اللي تناسبك.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div key={plan.title} className={`relative rounded-[28px] p-6 border ${plan.badge ? 'border-[#d7b66f]/50 bg-[#d7b66f]/10' : 'border-white/10 bg-white/[0.04]'} shadow-[0_20px_50px_rgba(0,0,0,.2)]`}>
                  {plan.badge && <span className="absolute -top-3 right-5 rounded-full bg-[#d7b66f] text-[#171714] text-xs font-bold px-3 py-1">{plan.badge}</span>}
                  <h3 className="font-display text-2xl font-bold">{plan.title}</h3>
                  <p className="text-sm text-white/45 mt-2 min-h-10">{plan.text}</p>
                  <a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(`السلام عليكم، عايز أعرف سعر باقة ${plan.title} في Egy Menu`)}`} target="_blank" rel="noreferrer" className="mt-6 rounded-2xl bg-white/8 border border-white/10 py-3 flex items-center justify-center gap-2 hover:bg-white/12 transition-colors"><MessageCircle size={16} /> اعرف السعر</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 bg-[#efe9df] scroll-mt-20">
          <div className="max-w-3xl mx-auto px-5 sm:px-7">
            <div className="text-center mb-10">
              <span className="text-[#8d7444] text-sm font-semibold">أسئلة شائعة</span>
              <h2 className="font-display text-3xl font-bold mt-2">قبل ما تبدأ</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((item, index) => {
                const open = openFaq === index
                return (
                  <div key={item.q} className="rounded-[22px] bg-[#f9f6f0] border border-black/5 overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,.04)]">
                    <button onClick={() => setOpenFaq(open ? null : index)} className="w-full flex items-center justify-between gap-4 text-right px-5 py-4 font-semibold">
                      <span>{item.q}</span>
                      <ChevronDown size={18} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <p className="px-5 pb-5 text-sm text-[#776f63] leading-7">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#11120f] text-white py-16">
          <div className="max-w-5xl mx-auto px-5 sm:px-7 text-center">
            <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-[#25271f] to-[#121310] p-8 sm:p-12 shadow-[0_35px_80px_rgba(0,0,0,.35)]">
              <span className="inline-flex w-12 h-12 rounded-2xl bg-[#d7b66f] text-[#171714] items-center justify-center mb-5"><QrCode size={23} /></span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">ابدأ منيوك بشكل يليق بنشاطك</h2>
              <p className="text-white/50 mt-3">سجّل وجرّب 10 أيام، وبعدها اختار الشكل والمدة اللي يناسبوك.</p>
              <Link to="/register" className="inline-flex mt-7 rounded-2xl bg-[#d7b66f] text-[#171714] px-7 py-3.5 font-bold items-center gap-2">ابدأ الآن <ArrowLeft size={18} /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b0c0a] text-white/45 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-7 py-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2"><QrCode size={16} className="text-[#d7b66f]" /> Egy Menu</div>
          <div>منيو إلكتروني ذكي لكل نشاط</div>
        </div>
      </footer>
    </div>
  )
}
