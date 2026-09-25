import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Gift, Headphones, LayoutGrid, ListChecks, Package, QrCode, Shirt, ShoppingBag, Smartphone, Sparkles, Store, Tags, WandSparkles } from 'lucide-react'
import FeaturedMenus from '@/components/landing/FeaturedMenus'

const NAV_LINKS = [
  { label: 'الأنشطة', to: '/activities' },
  { label: 'المتاجر', to: '/restaurants' },
  { label: 'المميزات', to: '/features' },
  { label: 'طريقة العمل', to: '/how-it-works' },
  { label: 'الباقات', to: '/pricing' },
]

const QUICK_LINKS = [
  { icon: LayoutGrid, title: 'الأنشطة', text: 'اختار نوع نشاطك', to: '/activities' },
  { icon: Store, title: 'المتاجر', text: 'شوف المتاجر الموجودة', to: '/restaurants' },
  { icon: WandSparkles, title: 'المميزات', text: 'إمكانيات المنصة', to: '/features' },
  { icon: ListChecks, title: 'طريقة العمل', text: '3 خطوات بسيطة', to: '/how-it-works' },
  { icon: Tags, title: 'الباقات', text: 'الأسعار والاشتراكات', to: '/pricing' },
]

function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-2xl bg-[#d7b66f] text-[#171714] flex items-center justify-center shadow-lg"><QrCode size={21} /></div>
      <div><div className="font-display font-black text-white">Egy Menu</div><div className="text-[9px] text-[#d7b66f]/70">SMART PRODUCT CATALOG</div></div>
    </div>
  )
}

const catalogProducts = [
  { icon: Smartphone, name: 'هاتف Pro', meta: '256GB · أسود', price: '32,900 ج' },
  { icon: Shirt, name: 'تيشيرت Premium', meta: 'ألوان ومقاسات', price: '590 ج' },
  { icon: Headphones, name: 'سماعة لاسلكي', meta: 'ضمان سنة', price: '1,850 ج' },
  { icon: Package, name: 'منتج مميز', meta: 'متاح الآن', price: '950 ج' },
]

function Catalog3DShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: .98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: .55, delay: .08 }}
      className="relative h-[370px] sm:h-[455px] lg:h-[520px]"
    >
      <div className="absolute inset-10 rounded-full bg-[#d7b66f]/12 blur-[70px]" />
      <div className="absolute left-2 top-20 h-[68%] w-[56%] -rotate-[12deg] rounded-[34px] border border-[#d7b66f]/18 bg-gradient-to-br from-[#1d1e18] to-[#10110e] shadow-[0_35px_80px_rgba(0,0,0,.45)]" />
      <div className="absolute left-14 top-12 h-[76%] w-[60%] -rotate-[5deg] rounded-[38px] border border-white/10 bg-[#11120f] shadow-[0_35px_90px_rgba(0,0,0,.45)]" />

      <div className="absolute left-0 bottom-12 z-20 w-[148px] -rotate-[4deg] rounded-[24px] border border-[#d7b66f]/25 bg-[#171714]/95 p-3 shadow-[0_24px_60px_rgba(0,0,0,.5)] backdrop-blur sm:w-[175px] sm:p-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d7b66f]/25 bg-[#f0d7a0] text-[#171714] shadow-inner sm:h-20 sm:w-20"><QrCode size={42} /></div>
        <p className="mt-3 text-center text-[11px] font-black text-white sm:text-xs">امسح QR وافتح الكتالوج</p>
        <p className="mt-1 text-center text-[9px] text-white/40">بدون تطبيق</p>
      </div>

      <div className="absolute right-2 top-0 z-10 h-[96%] w-[75%] max-w-[365px] overflow-hidden rounded-[42px] border border-[#d7b66f]/22 bg-[#0f100d] p-2 shadow-[0_45px_110px_rgba(0,0,0,.58)] sm:right-8 sm:p-2.5">
        <div className="relative h-full overflow-hidden rounded-[34px] border border-white/10 bg-[#151612]">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#d7b66f]/14 to-transparent" />
          <div className="relative p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d7b66f] text-[#171714]"><ShoppingBag size={17} /></div>
                <div><p className="font-display text-sm font-black text-white sm:text-base">Egy Menu</p><p className="text-[9px] text-white/35">كتالوج منتجات احترافي</p></div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] text-[#d7b66f]">متجر مباشر</div>
            </div>

            <div className="mt-4 rounded-[24px] border border-[#d7b66f]/18 bg-gradient-to-br from-[#2b261b] via-[#1b1c17] to-[#11120f] p-4 shadow-inner">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-[#d7b66f]">كتالوجك على الموبايل</p>
                  <h3 className="mt-1 font-display text-lg font-black text-white sm:text-xl">كل منتجاتك في مكان واحد</h3>
                  <p className="mt-1 text-[10px] leading-5 text-white/40">صور، أسعار، مواصفات، أصناف وطلب مباشر</p>
                </div>
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-[#d7b66f] sm:flex"><Sparkles size={19} /></div>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-hidden text-[9px] text-white/55">
              {['الكل', 'موبايلات', 'ملابس', 'إلكترونيات'].map((item, index) => <span key={item} className={`shrink-0 rounded-full border px-2.5 py-1.5 ${index === 0 ? 'border-[#d7b66f]/35 bg-[#d7b66f]/15 text-[#efd59d]' : 'border-white/8 bg-white/[0.035]'}`}>{item}</span>)}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-2.5">
              {catalogProducts.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.name} className="rounded-[20px] border border-white/8 bg-white/[0.035] p-2.5 shadow-[0_10px_24px_rgba(0,0,0,.12)] sm:p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d7b66f]/18 bg-[#d7b66f]/10 text-[#efd59d]"><Icon size={16} /></div>
                      <span className="rounded-full bg-[#758060]/15 px-2 py-1 text-[8px] font-bold text-[#bac6a0]">متاح</span>
                    </div>
                    <p className="mt-2 truncate text-[10px] font-black text-white sm:text-xs">{item.name}</p>
                    <p className="mt-1 truncate text-[8px] text-white/35 sm:text-[9px]">{item.meta}</p>
                    <div className="mt-2 flex items-center justify-between gap-2"><span className="text-[10px] font-black text-[#d7b66f] sm:text-xs">{item.price}</span><ShoppingBag size={12} className="text-white/30" /></div>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 rounded-[20px] border border-[#d7b66f]/20 bg-[#d7b66f]/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-xs font-black text-white">اطلب مباشرة من الكتالوج</p><p className="mt-1 text-[9px] text-white/40">اختيار المنتج ثم التواصل على واتساب</p></div>
                <span className="rounded-xl bg-[#d7b66f] px-3 py-2 text-[9px] font-black text-[#171714]">اطلب الآن</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-9 z-30 rounded-[22px] border border-white/10 bg-[#171714]/95 px-3.5 py-2.5 shadow-[0_18px_50px_rgba(0,0,0,.4)] backdrop-blur sm:right-2">
        <p className="text-[9px] text-white/35">معاينة حقيقية</p>
        <p className="mt-0.5 text-[11px] font-black text-[#efd59d] sm:text-xs">3D Product Catalog</p>
      </div>

      <div className="absolute left-2 top-5 z-20 hidden rounded-[22px] border border-[#d7b66f]/20 bg-[#181913]/95 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,.4)] backdrop-blur sm:block">
        <p className="text-[10px] font-black text-white">شكل أفخم للمنيو</p>
        <p className="mt-1 text-[9px] text-white/40">واجهة منتجات حقيقية بدون صور أشخاص</p>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0f0c] text-white" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0f0c]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="shrink-0"><BrandLogo /></Link>
          <nav className="hidden lg:flex items-center gap-6">{NAV_LINKS.map((item) => <Link key={item.to} to={item.to} className="text-sm text-white/60 hover:text-white transition-colors">{item.label}</Link>)}</nav>
          <div className="flex items-center gap-2"><Link to="/login" className="hidden sm:inline-flex text-sm text-white/65 px-3 py-2">دخول</Link><Link to="/register?src=header" className="rounded-xl bg-[#d7b66f] text-[#171714] px-3.5 sm:px-5 py-2.5 text-xs sm:text-sm font-black">ابدأ مجانًا</Link></div>
        </div>
        <div className="lg:hidden overflow-x-auto border-t border-white/5 scrollbar-none"><div className="flex min-w-max gap-1 px-3 py-2">{NAV_LINKS.map((item) => <Link key={item.to} to={item.to} className="rounded-full px-3 py-1.5 text-xs text-white/60 hover:bg-white/5 hover:text-white">{item.label}</Link>)}</div></div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute -top-28 -right-24 w-80 h-80 rounded-full bg-[#7b835f]/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-[#d7b66f]/15 blur-3xl" />
          <div className="relative max-w-7xl mx-auto px-5 sm:px-7 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-[1.05fr_.95fr] gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d7b66f]/25 bg-[#d7b66f]/10 px-3 py-1.5 text-xs text-[#efd59d]"><Sparkles size={14} /> كتالوج منتجات في رابط واحد</span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.12] mt-5">اعرض منتجاتك بشكل منظم<span className="block text-[#d7b66f]">وخلي العميل يختار بسهولة</span></h1>
              <p className="text-white/55 leading-7 mt-5 max-w-xl">صور، أسعار، مواصفات، أقسام وQR. العميل يفتح المتجر من الموبايل مباشرة بدون تطبيق.</p>
              <div className="flex flex-wrap gap-3 mt-7"><Link to="/register?src=hero" className="rounded-2xl bg-[#d7b66f] text-[#171714] px-6 py-3.5 font-black flex items-center gap-2">ابدأ 72 ساعة مجانًا <ArrowLeft size={17} /></Link><Link to="/restaurants" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold">شوف المتاجر</Link></div>
            </motion.div>

            <Catalog3DShowcase />
          </div>
        </section>

        <section className="bg-[#0d0f0c] px-4 sm:px-6 py-6">
          <div className="max-w-7xl mx-auto overflow-hidden rounded-[28px] border border-[#d7b66f]/25 bg-gradient-to-l from-[#242017] via-[#171915] to-[#11120f] shadow-[0_24px_70px_rgba(0,0,0,.28)]">
            <div className="grid lg:grid-cols-[1fr_auto] items-center gap-5 px-5 sm:px-7 py-6 sm:py-7">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-[#d7b66f] text-[#171714] items-center justify-center shadow-lg"><Gift size={25} /></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#d7b66f]/15 px-3 py-1 text-[11px] font-bold text-[#efd59d]">عرض تجربة</span><span className="text-xs text-white/40">بدون بطاقة بنكية</span></div>
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black">حوّل منتجاتك لمتجر مرتب خلال دقائق</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">سجّل دلوقتي وخد 72 ساعة مجانًا، أضف منتجاتك وخد رابط وQR تقدر تبعته لأي عميل فورًا.</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/55">{['رابط مباشر', 'QR جاهز', 'تعديل الأسعار بسهولة'].map((item) => <span key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#aab58b]" />{item}</span>)}</div>
                </div>
              </div>
              <Link to="/register?src=home-promo" className="w-full lg:w-auto rounded-2xl bg-[#d7b66f] px-6 py-3.5 text-center text-sm font-black text-[#171714] shadow-lg hover:brightness-105 transition">ابدأ تجربتك الآن</Link>
            </div>
          </div>
        </section>

        <section className="bg-[#151612] border-b border-white/10"><div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">{QUICK_LINKS.map((item) => <Link key={item.to} to={item.to} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 hover:bg-white/[0.07] transition-colors"><item.icon size={18} className="text-[#d7b66f]"/><div className="font-bold text-sm mt-2">{item.title}</div><div className="text-[11px] text-white/40 mt-1">{item.text}</div></Link>)}</div></section>

        <section className="bg-[#11120f] py-10 sm:py-12"><div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex items-end justify-between gap-4 mb-6"><div><p className="text-xs font-bold text-[#d7b66f]">متاجر على المنصة</p><h2 className="font-display text-2xl sm:text-3xl font-black mt-1">أحدث المتاجر</h2></div><Link to="/restaurants" className="text-sm text-white/55 hover:text-white">عرض الكل</Link></div><FeaturedMenus /></div></section>

        <section className="bg-[#d7b66f] text-[#171714]"><div className="max-w-7xl mx-auto px-5 sm:px-7 py-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"><div><h2 className="font-display text-2xl sm:text-3xl font-black">جاهز تعمل متجرك؟</h2><p className="text-sm text-black/60 mt-1.5">ابدأ 72 ساعة مجانًا وشارك أول رابط مع عميلك.</p></div><Link to="/register?src=footer-cta" className="rounded-2xl bg-[#171714] text-white px-6 py-3.5 font-black flex items-center gap-2">ابدأ الآن <ArrowLeft size={17}/></Link></div></section>
      </main>
    </div>
  )
}
