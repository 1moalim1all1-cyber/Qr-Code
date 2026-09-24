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
} from 'lucide-react'
import DynamicBusinessTypesSection from '@/components/landing/DynamicBusinessTypesSection'
import FeaturedMenus from '@/components/landing/FeaturedMenus'
import RestaurantCarousel from '@/components/landing/RestaurantCarousel'
import Showcase3D from '@/components/landing/Showcase3D'

const SUPPORT_WHATSAPP = '201039177959'

const NAV_LINKS = [
  { label: 'الرئيسية', href: '#top' },
  { label: 'الأنشطة', href: '#business-types' },
  { label: 'المميزات', href: '#features' },
  { label: 'المتاجر', href: '#stores' },
  { label: 'الباقات', href: '#pricing' },
  { label: 'الأسئلة', href: '#faq' },
]

const features = [
  { icon: Store, title: 'كتالوج مناسب لأي نشاط', text: 'اعرض منتجاتك وأقسامك وصورك ومواصفاتك بشكل يناسب طبيعة نشاطك.' },
  { icon: QrCode, title: 'رابط و QR جاهزين', text: 'شارك متجرك أو اطبع QR وخلي العميل يفتح الكتالوج مباشرة من الموبايل.' },
  { icon: ShoppingBag, title: 'طلبات وواتساب', text: 'العميل يقدر يضيف للسلة أو يسأل عن المنتج ويطلبه مباشرة عبر واتساب.' },
  { icon: BarChart3, title: 'إدارة كاملة', text: 'تحكم في الأقسام والمنتجات والأسعار والعروض والمخزون من لوحة واحدة.' },
]

const plans = [
  { title: 'شهر', text: 'مناسب للتجربة والبدايات' },
  { title: '3 شهور', text: 'تشغيل مريح بدون تجديد قريب' },
  { title: '6 شهور', text: 'اختيار عملي للنشاط المستقر' },
  { title: 'سنة', text: 'الأوفر للاستمرار', badge: 'الأوفر' },
]

const FAQS = [
  { q: 'هل المنصة مناسبة لغير المطاعم؟', a: 'أيوه. Egy Menu بقت منصة كتالوجات ومتاجر لأنشطة متعددة، ونوع النشاط بيتحدد للحساب ويظهر له شكل عرض مناسب.' },
  { q: 'هل أقدر أضيف منتجات بصور ومواصفات مختلفة؟', a: 'أيوه. تقدر تضيف صور متعددة، ماركة، مواصفات، ألوان، مقاسات أو سعات، وأسعار مختلفة للاختيارات.' },
  { q: 'هل العميل محتاج ينزل تطبيق؟', a: 'لا. العميل بيفتح المتجر مباشرة من الرابط أو كود QR من أي موبايل أو كمبيوتر.' },
  { q: 'هل أقدر أعدّل الأسعار والمنتجات في أي وقت؟', a: 'أيوه، تقدر تعدل المنتجات والأسعار والإتاحة والعروض من لوحة التحكم في أي وقت.' },
]

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-[18px] bg-gradient-to-br from-[#f2d38e] via-[#d7b66f] to-[#82683c] shadow-[0_14px_35px_rgba(215,182,111,.28)] border border-white/25 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-[5px] rounded-[14px] border border-black/10" />
        <QrCode size={25} className="text-[#171714] relative z-10" strokeWidth={2.2} />
        <span className="absolute -left-1 -bottom-1 w-6 h-6 rounded-full bg-[#171714] border-2 border-[#d7b66f] flex items-center justify-center"><Store size={11} className="text-[#f4e2bb]" /></span>
      </div>
      {!compact && <div className="leading-none"><div className="font-display font-black text-[19px] tracking-tight text-white">Egy Menu</div><div className="text-[9px] uppercase tracking-[0.2em] text-[#d7b66f]/80 mt-1.5">Smart QR Catalog</div></div>}
    </div>
  )
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div id="top" className="min-h-screen bg-[#efe9df] text-[#171714] overflow-hidden" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#10110f]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-7 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0"><BrandLogo /></Link>
          <nav className="hidden lg:flex items-center gap-7">{NAV_LINKS.map((item) => <a key={item.href} href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">{item.label}</a>)}</nav>
          <div className="flex items-center gap-2 sm:gap-3"><Link to="/login" className="hidden sm:inline-flex text-sm text-white/65 hover:text-white px-3 py-2">دخول</Link><Link to="/register" className="rounded-2xl bg-[#d7b66f] text-[#181713] px-4 sm:px-5 py-2.5 text-sm font-bold shadow-[0_10px_26px_rgba(215,182,111,.18)] hover:-translate-y-0.5 transition-transform">ابدأ مجانًا</Link></div>
        </div>
      </header>

      <main>
        <section className="relative bg-[#10110f] text-white min-h-[690px] flex items-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute -top-28 -right-24 w-[430px] h-[430px] rounded-full bg-[#6d7758]/25 blur-3xl" /><div className="absolute top-16 -left-24 w-[420px] h-[420px] rounded-full bg-[#d7b66f]/15 blur-3xl" /><div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '38px 38px' }} /></div>
          <div className="relative max-w-7xl mx-auto px-5 sm:px-7 py-20 lg:py-28 w-full grid lg:grid-cols-[1fr_470px] gap-14 items-center">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d7b66f]/25 bg-[#d7b66f]/10 text-[#ead19a] px-4 py-2 text-sm mb-6"><Sparkles size={15} /> منصة كتالوجات ومتاجر لكل الأنشطة</span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.14] max-w-3xl">خلّي منتجاتك<span className="block text-transparent bg-clip-text bg-gradient-to-l from-[#ead19a] via-[#d7b66f] to-[#9eaa83]">تتباع من كتالوج يليق بنشاطك</span></h1>
              <p className="text-white/58 text-base sm:text-lg leading-8 mt-6 max-w-2xl">موبايلات، إلكترونيات، ملابس، عطور، سوبر ماركت، مستحضرات تجميل، مطاعم وغيرهم. اعرض الصور والأسعار والمواصفات والاختيارات وخلي العميل يطلب بسهولة.</p>
              <div className="flex flex-wrap gap-3 mt-8"><Link to="/register" className="rounded-2xl bg-[#d7b66f] text-[#171714] px-6 py-3.5 font-bold flex items-center gap-2 shadow-[0_18px_45px_rgba(215,182,111,.2)] hover:-translate-y-1 transition-transform">أنشئ متجرك الآن <ArrowLeft size={18} /></Link><Link to="/restaurants" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold hover:bg-white/10 transition-colors">اكتشف المتاجر</Link></div>
              <div className="grid grid-cols-3 max-w-xl gap-3 mt-10">{[['10 أيام', 'تجربة مجانية'], ['QR', 'رابط سريع'], ['24/7', 'كتالوج متاح']].map(([value, label]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-4 text-center"><div className="font-display text-xl sm:text-2xl font-bold text-[#ead19a]">{value}</div><div className="text-[11px] sm:text-xs text-white/45 mt-1">{label}</div></div>)}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.75, delay: 0.12 }} className="relative">
              <div className="absolute inset-8 bg-[#d7b66f]/15 blur-3xl rounded-full" />
              <div className="relative rounded-[38px] border border-white/10 bg-gradient-to-br from-[#25271f] to-[#0b0c0a] p-5 shadow-[0_50px_100px_rgba(0,0,0,.55)]">
                <div className="rounded-[30px] bg-[#f5f0e8] text-[#191915] overflow-hidden min-h-[500px]">
                  <div className="h-32 bg-gradient-to-l from-[#6f775b] to-[#b28f50] relative"><div className="absolute bottom-4 right-5 text-white"><p className="text-xs text-white/65">متجر إلكترونيات</p><h3 className="font-display text-2xl font-bold mt-1">Smart Store</h3></div></div>
                  <div className="p-4"><div className="flex gap-2 overflow-hidden mb-4">{['الكل', 'موبايلات', 'سماعات', 'شواحن'].map((x, i) => <span key={x} className={`shrink-0 rounded-full px-4 py-2 text-xs ${i === 0 ? 'bg-[#171714] text-white' : 'bg-[#e5ddd0]'}`}>{x}</span>)}</div><div className="grid grid-cols-2 gap-3">{[['هاتف ذكي', '18,500'], ['سماعة لاسلكية', '1,250'], ['شاحن سريع', '650'], ['ساعة ذكية', '2,400']].map(([name, price], i) => <div key={name} className="rounded-[22px] bg-white p-3 border border-black/5 shadow-[0_12px_28px_rgba(0,0,0,.08)]"><div className="aspect-square rounded-[16px] bg-gradient-to-br from-[#ece7dc] to-[#d8d0c2] flex items-center justify-center"><ShoppingBag size={30} className="text-[#8d7444]" /></div><div className="font-semibold text-sm mt-3">{name}</div><div className="flex items-center justify-between mt-2"><span className="font-bold text-sm">{price} ج.م</span><span className="w-7 h-7 rounded-full bg-[#d7b66f] flex items-center justify-center font-bold">+</span></div>{i === 0 && <span className="inline-block mt-2 rounded-full bg-red-50 text-red-600 px-2 py-1 text-[10px]">خصم 10%</span>}</div>)}</div></div>
                </div>
              </div>
              <div className="absolute -right-3 sm:-right-8 bottom-12 rounded-2xl border border-white/10 bg-white/[0.07] backdrop-blur-xl p-4 text-white shadow-xl"><div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-[#9eaa83]" /><span className="font-semibold text-sm">Grid + List + Filters</span></div><div className="text-[11px] text-white/45 mt-2">شكل متجر حقيقي على الموبايل</div></div>
            </motion.div>
          </div>
        </section>

        <div id="business-types" className="scroll-mt-20"><DynamicBusinessTypesSection /></div>

        <section id="stores" className="py-16 bg-[#151612] text-white scroll-mt-20"><div className="max-w-7xl mx-auto px-5 sm:px-7"><div className="max-w-2xl mb-9"><span className="text-[#d7b66f] text-sm font-semibold">متاجر وكتالوجات حقيقية</span><h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">شوف شكل المنتجات على المنصة</h2><p className="text-white/50 mt-3 leading-7">متاجر بأنشطة مختلفة، وكل متجر له هويته وأقسامه ومنتجاته.</p></div><FeaturedMenus /></div></section>

        <section className="py-16 bg-[#efe9df]"><div className="max-w-7xl mx-auto px-5 sm:px-7"><RestaurantCarousel /></div></section>

        <section id="features" className="py-20 bg-[#f7f2ea] scroll-mt-20"><div className="max-w-7xl mx-auto px-5 sm:px-7"><div className="text-center max-w-2xl mx-auto mb-12"><span className="text-[#8d7444] text-sm font-semibold">كل حاجة من مكان واحد</span><h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">كتالوج احترافي وإدارة بسيطة</h2></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{features.map((feature, i) => <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="rounded-[26px] bg-white p-6 border border-black/5 shadow-[0_18px_40px_rgba(0,0,0,.06)]"><div className="w-11 h-11 rounded-2xl bg-[#ece5d9] text-[#657052] flex items-center justify-center mb-4"><feature.icon size={21} /></div><h3 className="font-display font-bold">{feature.title}</h3><p className="text-sm text-[#776f63] leading-6 mt-2">{feature.text}</p></motion.div>)}</div></div></section>

        <Showcase3D />

        <section id="pricing" className="py-20 bg-[#11120f] text-white scroll-mt-20"><div className="max-w-7xl mx-auto px-5 sm:px-7"><div className="text-center max-w-2xl mx-auto mb-12"><span className="text-[#d7b66f] text-sm font-semibold">اشتراك مرن</span><h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">اختار المدة المناسبة لنشاطك</h2><p className="text-white/45 mt-3">ابدأ بالتجربة المجانية وبعدها جدّد بالمدة اللي تناسبك.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{plans.map((plan) => <div key={plan.title} className={`relative rounded-[28px] p-6 border ${plan.badge ? 'border-[#d7b66f]/50 bg-[#d7b66f]/10' : 'border-white/10 bg-white/[0.04]'} shadow-[0_20px_50px_rgba(0,0,0,.2)]`}>{plan.badge && <span className="absolute -top-3 right-5 rounded-full bg-[#d7b66f] text-[#171714] text-xs font-bold px-3 py-1">{plan.badge}</span>}<h3 className="font-display text-2xl font-bold">{plan.title}</h3><p className="text-sm text-white/45 mt-2 min-h-10">{plan.text}</p><a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(`السلام عليكم، عايز أعرف سعر باقة ${plan.title} في Egy Menu`)}`} target="_blank" rel="noreferrer" className="mt-6 rounded-2xl bg-white/8 border border-white/10 py-3 flex items-center justify-center gap-2 hover:bg-white/12 transition-colors"><MessageCircle size={16} /> اعرف السعر</a></div>)}</div></div></section>

        <section id="faq" className="py-20 bg-[#efe9df] scroll-mt-20"><div className="max-w-3xl mx-auto px-5 sm:px-7"><div className="text-center mb-10"><span className="text-[#8d7444] text-sm font-semibold">أسئلة شائعة</span><h2 className="font-display text-3xl font-bold mt-2">قبل ما تبدأ</h2></div><div className="space-y-3">{FAQS.map((item, index) => { const open = openFaq === index; return <div key={item.q} className="rounded-[22px] bg-[#f9f6f0] border border-black/5 overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,.04)]"><button onClick={() => setOpenFaq(open ? null : index)} className="w-full flex items-center justify-between gap-4 text-right px-5 py-4 font-semibold"><span>{item.q}</span><ChevronDown size={18} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 pb-5 text-sm text-[#776f63] leading-7">{item.a}</p></motion.div>}</AnimatePresence></div> })}</div></div></section>

        <section className="bg-[#11120f] text-white py-16"><div className="max-w-5xl mx-auto px-5 sm:px-7 text-center"><div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-[#25271f] to-[#121310] p-8 sm:p-12 shadow-[0_35px_80px_rgba(0,0,0,.35)]"><div className="flex justify-center mb-6"><BrandLogo compact /></div><h2 className="font-display text-3xl sm:text-4xl font-bold">اعمل كتالوج يليق بنشاطك</h2><p className="text-white/50 mt-3">سجّل وجرّب 10 أيام، وبعدها ضيف منتجاتك وشارك المتجر مع عملائك.</p><Link to="/register" className="inline-flex mt-7 rounded-2xl bg-[#d7b66f] text-[#171714] px-7 py-3.5 font-bold items-center gap-2">أنشئ متجرك الآن <ArrowLeft size={18} /></Link></div></div></section>
      </main>

      <footer className="bg-[#0b0c0a] text-white/45 border-t border-white/5"><div className="max-w-7xl mx-auto px-5 sm:px-7 py-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"><BrandLogo /><div>كتالوج إلكتروني ذكي لكل نشاط</div></div></footer>
    </div>
  )
}
