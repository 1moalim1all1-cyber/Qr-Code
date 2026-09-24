import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  QrCode,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-react'
import DynamicBusinessTypesSection from '@/components/landing/DynamicBusinessTypesSection'
import FeaturedMenus from '@/components/landing/FeaturedMenus'

const SUPPORT_WHATSAPP = '201039177959'

const NAV_LINKS = [
  { label: 'الرئيسية', href: '#top' },
  { label: 'الأنشطة', href: '#business-types' },
  { label: 'المتاجر', href: '#stores' },
  { label: 'المميزات', href: '#features' },
  { label: 'الباقات', href: '#pricing' },
]

const heroCards = [
  {
    title: 'موبايلات',
    subtitle: 'موديلات، سعات، ألوان ومواصفات',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'إلكترونيات',
    subtitle: 'أجهزة وإكسسوارات وأسعار واضحة',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'ملابس',
    subtitle: 'ألوان ومقاسات وصور متعددة',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'عطور',
    subtitle: 'ماركات وأحجام وعروض',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85',
  },
]

const features = [
  { icon: Store, title: 'كتالوج على شكل متجر', text: 'كل نشاط له أقسام ومنتجات وصور ومواصفات بشكل منظم وسهل للعميل.' },
  { icon: QrCode, title: 'QR ورابط مباشر', text: 'شارك الكتالوج على واتساب والسوشيال أو اطبع QR في المحل.' },
  { icon: ShoppingBag, title: 'اختيارات وطلب سريع', text: 'اعرض اللون والمقاس والسعة والسعر وخلي العميل يوصل للمنتج بسرعة.' },
  { icon: BarChart3, title: 'إدارة بسيطة', text: 'ضيف وعدل المنتجات والأسعار والعروض والإتاحة من لوحة تحكم واحدة.' },
]

const plans = [
  { title: 'شهر', text: 'للتجربة والبداية' },
  { title: '3 شهور', text: 'مدة مناسبة للتشغيل' },
  { title: '6 شهور', text: 'اختيار عملي للنشاط المستقر' },
  { title: 'سنة', text: 'أفضل مدة للاستمرار', badge: 'الأوفر' },
]

const FAQS = [
  { q: 'إيه الأنشطة اللي تنفع على Egy Menu؟', a: 'موبايلات، إلكترونيات، ملابس، أحذية وشنط، عطور، صيدليات، أثاث، تشطيبات، سيراميك وأنشطة تانية كتير.' },
  { q: 'هل أقدر أضيف مواصفات واختيارات للمنتج؟', a: 'أيوه. تقدر تضيف صور متعددة وماركة ومواصفات وألوان ومقاسات أو سعات وأسعار مختلفة.' },
  { q: 'هل العميل محتاج تطبيق؟', a: 'لا. بيفتح الكتالوج مباشرة من الرابط أو QR من أي موبايل.' },
  { q: 'هل أقدر أعدل المنتجات في أي وقت؟', a: 'أيوه. التعديل على المنتجات والأسعار والإتاحة والعروض بيتم من لوحة التحكم.' },
]

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-[18px] bg-gradient-to-br from-[#f2d38e] via-[#d7b66f] to-[#82683c] shadow-[0_14px_35px_rgba(215,182,111,.28)] border border-white/25 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-[5px] rounded-[14px] border border-black/10" />
        <QrCode size={25} className="text-[#171714] relative z-10" strokeWidth={2.2} />
        <span className="absolute -left-1 -bottom-1 w-6 h-6 rounded-full bg-[#171714] border-2 border-[#d7b66f] flex items-center justify-center"><Store size={11} className="text-[#f4e2bb]" /></span>
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="font-display font-black text-[19px] tracking-tight text-white">Egy Menu</div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-[#d7b66f]/80 mt-1.5">Smart Product Catalog</div>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div id="top" className="min-h-screen bg-[#f1ede6] text-[#171714] overflow-hidden" dir="rtl">
      <header className="sticky top-0 z-50 bg-[#0d0f0c]/92 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-7 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0"><BrandLogo /></Link>
          <nav className="hidden lg:flex items-center gap-7">{NAV_LINKS.map((item) => <a key={item.href} href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">{item.label}</a>)}</nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="hidden sm:inline-flex text-sm text-white/65 hover:text-white px-3 py-2">دخول</Link>
            <Link to="/register" className="rounded-2xl bg-[#d7b66f] text-[#181713] px-4 sm:px-5 py-2.5 text-sm font-bold hover:-translate-y-0.5 transition-transform">ابدأ مجانًا</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative bg-[#0d0f0c] text-white overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-20 w-[440px] h-[440px] rounded-full bg-[#7b835f]/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-16 w-[420px] h-[420px] rounded-full bg-[#d7b66f]/15 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-5 sm:px-7 py-16 lg:py-24 grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d7b66f]/30 bg-[#d7b66f]/10 text-[#efd59d] px-4 py-2 text-sm mb-6"><Sparkles size={15} /> اعرض منتجاتك بشكل يليق بنشاطك</span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-black leading-[1.12] max-w-3xl">
                كتالوج منتجات
                <span className="block text-transparent bg-clip-text bg-gradient-to-l from-[#f0dcae] via-[#d7b66f] to-[#97a279]">شكله متجر حقيقي</span>
              </h1>
              <p className="text-white/58 text-base sm:text-lg leading-8 mt-6 max-w-2xl">موبايلات، إلكترونيات، ملابس، عطور، أثاث، تشطيبات وغيرهم. صور واضحة، أسعار، مواصفات، ألوان ومقاسات في رابط واحد.</p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/register" className="rounded-2xl bg-[#d7b66f] text-[#171714] px-6 py-3.5 font-bold flex items-center gap-2 shadow-[0_18px_45px_rgba(215,182,111,.2)] hover:-translate-y-1 transition-transform">أنشئ كتالوجك <ArrowLeft size={18} /></Link>
                <Link to="/restaurants" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold hover:bg-white/10 transition-colors">شوف المتاجر</Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 text-sm text-white/55">
                {['10 أيام تجربة', 'بدون تطبيق للعميل', 'تعديل في أي وقت'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-[#aab58b]" />{item}</span>)}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, delay: 0.08 }} className="grid grid-cols-2 gap-3 sm:gap-4">
              {heroCards.map((card, index) => (
                <div key={card.title} className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_70px_rgba(0,0,0,.3)] ${index === 0 ? 'row-span-2 min-h-[360px] sm:min-h-[470px]' : 'min-h-[170px] sm:min-h-[225px]'}`}>
                  <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                  <div className="absolute right-4 left-4 bottom-4 sm:right-5 sm:left-5 sm:bottom-5">
                    <div className="font-display text-lg sm:text-2xl font-bold">{card.title}</div>
                    <div className="text-[11px] sm:text-sm text-white/60 mt-1">{card.subtitle}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bg-[#d9c59a] border-b border-black/5">
          <div className="max-w-7xl mx-auto px-5 sm:px-7 py-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['صور متعددة', 'لكل منتج'],
              ['ألوان ومقاسات', 'واختيارات مختلفة'],
              ['بحث وفلاتر', 'وصول أسرع للمنتج'],
              ['QR + رابط', 'مشاركة في ثواني'],
            ].map(([title, text]) => <div key={title} className="rounded-2xl bg-white/45 border border-black/5 px-4 py-3"><div className="font-bold text-sm">{title}</div><div className="text-xs text-black/55 mt-1">{text}</div></div>)}
          </div>
        </section>

        <div id="business-types" className="scroll-mt-20"><DynamicBusinessTypesSection /></div>

        <section id="stores" className="py-18 bg-[#151612] text-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-7 py-16">
            <div className="max-w-2xl mb-9">
              <span className="text-[#d7b66f] text-sm font-semibold">متاجر حقيقية على المنصة</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">شوف شكل الكتالوج بعد إضافة المنتجات</h2>
              <p className="text-white/50 mt-3 leading-7">الصور والمنتجات والأقسام بتظهر بشكل واضح ومناسب للموبايل.</p>
            </div>
            <FeaturedMenus />
          </div>
        </section>

        <section id="features" className="py-20 bg-[#f7f3ec] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-7">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
              <div className="lg:sticky lg:top-28">
                <span className="text-[#8d7444] text-sm font-semibold">كل حاجة من مكان واحد</span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">من إضافة المنتج لحد ما العميل يشوفه</h2>
                <p className="text-[#776f63] leading-7 mt-4">الهدف إن صاحب النشاط يضيف منتجاته بسهولة، والعميل يوصل للمعلومة من غير تعقيد.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, i) => <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-[26px] bg-white p-6 border border-black/5 shadow-[0_18px_40px_rgba(0,0,0,.05)]"><div className="w-11 h-11 rounded-2xl bg-[#ece5d9] text-[#657052] flex items-center justify-center mb-4"><feature.icon size={21} /></div><h3 className="font-display font-bold text-lg">{feature.title}</h3><p className="text-sm text-[#776f63] leading-6 mt-2">{feature.text}</p></motion.div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-[#0f100e] text-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-7">
            <div className="text-center max-w-2xl mx-auto mb-12"><span className="text-[#d7b66f] text-sm font-semibold">اشتراك مرن</span><h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">اختار المدة المناسبة لنشاطك</h2><p className="text-white/45 mt-3">ابدأ بالتجربة وبعدها اختار الباقة المناسبة.</p></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{plans.map((plan) => <div key={plan.title} className={`relative rounded-[28px] p-6 border ${plan.badge ? 'border-[#d7b66f]/50 bg-[#d7b66f]/10' : 'border-white/10 bg-white/[0.04]'}`}>{plan.badge && <span className="absolute -top-3 right-5 rounded-full bg-[#d7b66f] text-[#171714] text-xs font-bold px-3 py-1">{plan.badge}</span>}<h3 className="font-display text-2xl font-bold">{plan.title}</h3><p className="text-sm text-white/45 mt-2 min-h-10">{plan.text}</p><a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(`السلام عليكم، عايز أعرف سعر باقة ${plan.title} في Egy Menu`)}`} target="_blank" rel="noreferrer" className="mt-6 rounded-2xl bg-white/8 border border-white/10 py-3 flex items-center justify-center gap-2 hover:bg-white/12 transition-colors"><MessageCircle size={16} /> اعرف السعر</a></div>)}</div>
          </div>
        </section>

        <section className="py-20 bg-[#efe9df]">
          <div className="max-w-3xl mx-auto px-5 sm:px-7">
            <div className="text-center mb-10"><span className="text-[#8d7444] text-sm font-semibold">أسئلة شائعة</span><h2 className="font-display text-3xl font-bold mt-2">قبل ما تبدأ</h2></div>
            <div className="space-y-3">{FAQS.map((item, index) => { const open = openFaq === index; return <div key={item.q} className="rounded-[22px] bg-[#f9f6f0] border border-black/5 overflow-hidden"><button onClick={() => setOpenFaq(open ? null : index)} className="w-full flex items-center justify-between gap-4 text-right px-5 py-4 font-semibold"><span>{item.q}</span><ChevronDown size={18} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 pb-5 text-sm text-[#776f63] leading-7">{item.a}</p></motion.div>}</AnimatePresence></div> })}</div>
          </div>
        </section>

        <section className="bg-[#11120f] text-white py-16">
          <div className="max-w-5xl mx-auto px-5 sm:px-7 text-center">
            <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-[#25271f] to-[#121310] p-8 sm:p-12 shadow-[0_35px_80px_rgba(0,0,0,.35)]">
              <div className="flex justify-center mb-6"><BrandLogo compact /></div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">حوّل منتجاتك لكتالوج احترافي</h2>
              <p className="text-white/50 mt-3">ضيف منتجاتك وصورك وأسعارك وشارك الرابط مع عملائك.</p>
              <Link to="/register" className="inline-flex mt-7 rounded-2xl bg-[#d7b66f] text-[#171714] px-7 py-3.5 font-bold items-center gap-2">ابدأ الآن <ArrowLeft size={18} /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b0c0a] text-white/45 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-7 py-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"><BrandLogo /><div>كتالوج إلكتروني ذكي للمنتجات والمتاجر</div></div>
      </footer>
    </div>
  )
}
