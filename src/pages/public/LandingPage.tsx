import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  PackageCheck,
  QrCode,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  Store,
  Tags,
} from 'lucide-react'
import DynamicBusinessTypesSection from '@/components/landing/DynamicBusinessTypesSection'
import FeaturedMenus from '@/components/landing/FeaturedMenus'

const SUPPORT_WHATSAPP = '201039177959'

const NAV_LINKS = [
  { label: 'الرئيسية', href: '#top' },
  { label: 'الأنشطة', href: '#business-types' },
  { label: 'المتاجر', href: '#stores' },
  { label: 'المميزات', href: '#features' },
  { label: 'طريقة العمل', href: '#how-it-works' },
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
  { icon: Search, title: 'بحث وفلاتر', text: 'العميل يقدر يوصل للمنتج بسرعة حسب القسم أو الاسم أو الاختيارات.' },
  { icon: Tags, title: 'خصومات وأسعار واضحة', text: 'اعرض السعر الحالي والسعر قبل الخصم والعروض بشكل واضح وجذاب.' },
]

const plans = [
  { title: '3 شهور', price: '599', text: 'مناسبة للبداية وتجربة البيع بالكتالوج' },
  { title: '6 شهور', price: '899', text: 'اختيار عملي للنشاط اللي عايز يستمر' },
  { title: 'سنة', price: '1499', text: 'الأوفر للاستمرار طول السنة', badge: 'الأوفر' },
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
                اعرض منتجاتك
                <span className="block text-transparent bg-clip-text bg-gradient-to-l from-[#f0dcae] via-[#d7b66f] to-[#97a279]">في كتالوج شكله متجر حقيقي</span>
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

        <section id="stores" className="bg-[#151612] text-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-7 py-16">
            <div className="max-w-2xl mb-9">
              <span className="text-[#d7b66f] text-sm font-semibold">متاجر حقيقية موجودة بالفعل</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">شوف متاجر شغالة على Egy Menu</h2>
              <p className="text-white/50 mt-3 leading-7">المتاجر اللي الإدارة مفعّلة ظهورها في الرئيسية بتظهر هنا بالصور والمنتجات والبيانات الحقيقية.</p>
            </div>
            <FeaturedMenus />
          </div>
        </section>

        <section className="py-20 bg-[#eee7dc]">
          <div className="max-w-7xl mx-auto px-5 sm:px-7 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-[#8d7444] text-sm font-semibold">شكل المنتج قدام العميل</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">كل تفاصيل المنتج في شاشة واحدة</h2>
              <p className="text-[#776f63] leading-7 mt-4 max-w-xl">الصورة والسعر والخصم والألوان والمقاسات والمواصفات بتظهر بشكل واضح بدل ما العميل يسأل عن كل تفصيلة لوحدها.</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-7">
                {['صور متعددة للمنتج', 'سعر قبل وبعد الخصم', 'ألوان ومقاسات وسعات', 'مواصفات وبيانات واضحة'].map((item) => <div key={item} className="rounded-2xl bg-white border border-black/5 px-4 py-3 text-sm font-semibold flex items-center gap-2"><CheckCircle2 size={17} className="text-[#788360]" />{item}</div>)}
              </div>
            </div>
            <div className="max-w-md mx-auto w-full rounded-[34px] bg-[#11120f] p-4 shadow-[0_35px_75px_rgba(0,0,0,.22)]">
              <div className="rounded-[27px] bg-white overflow-hidden">
                <div className="relative aspect-[4/3] bg-[#eee8de] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85" alt="هاتف ذكي" className="w-full h-full object-cover" />
                  <span className="absolute top-4 right-4 rounded-full bg-[#b73e48] text-white text-xs font-bold px-3 py-1.5">خصم 12%</span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-[#8d7444] font-semibold">موبايلات</p>
                  <h3 className="font-display text-2xl font-bold mt-1">هاتف ذكي Pro</h3>
                  <div className="flex items-end gap-3 mt-3"><span className="text-2xl font-black">18,500 ج.م</span><span className="text-sm text-black/35 line-through pb-1">21,000 ج.م</span></div>
                  <div className="mt-5"><p className="text-xs font-bold mb-2">الألوان</p><div className="flex gap-2"><span className="w-8 h-8 rounded-full bg-black border-2 border-[#d7b66f]" /><span className="w-8 h-8 rounded-full bg-[#d6d2c8] border border-black/10" /><span className="w-8 h-8 rounded-full bg-[#8aa0b6] border border-black/10" /></div></div>
                  <div className="mt-5"><p className="text-xs font-bold mb-2">السعة</p><div className="flex gap-2"><span className="rounded-xl border border-black/10 px-3 py-2 text-xs">128 GB</span><span className="rounded-xl bg-[#171714] text-white px-3 py-2 text-xs">256 GB</span></div></div>
                  <button className="mt-5 w-full rounded-2xl bg-[#d7b66f] py-3 font-bold flex items-center justify-center gap-2"><ShoppingBag size={17} /> اطلب المنتج</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-[#f7f3ec] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-7">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[#8d7444] text-sm font-semibold">كل حاجة من مكان واحد</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">أدوات تخلي الكتالوج أسهل لصاحب النشاط والعميل</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, i) => <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-[26px] bg-white p-6 border border-black/5 shadow-[0_18px_40px_rgba(0,0,0,.05)]"><div className="w-11 h-11 rounded-2xl bg-[#ece5d9] text-[#657052] flex items-center justify-center mb-4"><feature.icon size={21} /></div><h3 className="font-display font-bold text-lg">{feature.title}</h3><p className="text-sm text-[#776f63] leading-6 mt-2">{feature.text}</p></motion.div>)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-[#171815] text-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-7">
            <div className="text-center max-w-2xl mx-auto mb-12"><span className="text-[#d7b66f] text-sm font-semibold">3 خطوات بس</span><h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">من التسجيل لحد مشاركة متجرك</h2></div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: Store, n: '01', title: 'سجّل نشاطك', text: 'اعمل حساب وحدد اسم ونوع النشاط وبيانات التواصل.' },
                { icon: PackageCheck, n: '02', title: 'ضيف منتجاتك', text: 'ارفع الصور واكتب الأسعار والمواصفات والألوان والمقاسات.' },
                { icon: Share2, n: '03', title: 'شارك الرابط أو QR', text: 'ابعت الكتالوج لعملائك أو حط QR في المحل وعلى السوشيال.' },
              ].map((step) => <div key={step.n} className="relative rounded-[28px] bg-white/[0.05] border border-white/10 p-6"><span className="absolute left-5 top-4 text-5xl font-black text-white/[0.05]">{step.n}</span><div className="w-12 h-12 rounded-2xl bg-[#d7b66f] text-[#171714] flex items-center justify-center mb-5"><step.icon size={22} /></div><h3 className="font-display text-xl font-bold">{step.title}</h3><p className="text-sm text-white/50 leading-6 mt-2">{step.text}</p></div>)}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-[#0f100e] text-white scroll-mt-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-7">
            <div className="text-center max-w-2xl mx-auto mb-12"><span className="text-[#d7b66f] text-sm font-semibold">أسعار واضحة</span><h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">اختار المدة المناسبة لنشاطك</h2><p className="text-white/45 mt-3">10 أيام تجربة، وبعدها اختار الباقة المناسبة ليك.</p></div>
            <div className="grid md:grid-cols-3 gap-5">{plans.map((plan) => <div key={plan.title} className={`relative rounded-[30px] p-7 border ${plan.badge ? 'border-[#d7b66f]/60 bg-[#d7b66f]/10 shadow-[0_22px_60px_rgba(215,182,111,.08)]' : 'border-white/10 bg-white/[0.04]'}`}>{plan.badge && <span className="absolute -top-3 right-6 rounded-full bg-[#d7b66f] text-[#171714] text-xs font-bold px-4 py-1.5">{plan.badge}</span>}<h3 className="font-display text-xl font-bold text-white/75">{plan.title}</h3><div className="mt-4 flex items-end gap-2"><span className="text-5xl font-black text-[#efd59d]">{plan.price}</span><span className="text-sm text-white/45 pb-2">ج.م</span></div><p className="text-sm text-white/45 mt-4 min-h-10">{plan.text}</p><a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(`السلام عليكم، عايز أشترك في باقة ${plan.title} بسعر ${plan.price} جنيه في Egy Menu`)}`} target="_blank" rel="noreferrer" className={`mt-6 rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold ${plan.badge ? 'bg-[#d7b66f] text-[#171714]' : 'bg-white/8 border border-white/10 text-white'}`}><MessageCircle size={16} /> اشترك الآن</a></div>)}</div>
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
              <p className="text-white/50 mt-3">ضيف منتجاتك وصورك وأسعارك وشارك الرابط أو QR مع عملائك.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/register" className="inline-flex rounded-2xl bg-[#d7b66f] text-[#171714] px-7 py-3.5 font-bold items-center gap-2">ابدأ الآن <ArrowLeft size={18} /></Link><a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noreferrer" className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 font-bold items-center gap-2"><MessageCircle size={18} /> واتساب</a></div>
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
