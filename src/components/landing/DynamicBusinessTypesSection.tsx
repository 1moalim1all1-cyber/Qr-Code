import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, MessageCircle, PackageCheck, QrCode, Share2, ShoppingBag, Store, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import { listActiveRestaurants, listFeaturedRestaurants } from '@/services/restaurants'
import type { Restaurant } from '@/types/database'

const SUPPORT_WHATSAPP = '201039177959'
const HIDDEN_HOME_TYPES = new Set(['restaurant', 'cafe', 'supermarket', 'cosmetics', 'pharmacy'])
const PREFERRED_TYPE_KEY = 'egy-menu-preferred-business-type'

const FALLBACK_IMAGES: Record<string, string> = {
  mobiles: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80',
  clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80',
  shoes_bags: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  perfumes: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
  homeware: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  bookstores: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=900&q=80',
  sweets_bakery: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
  auto_parts: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
  decor_finishing: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
  ceramics_sanitary: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
}

const GENERIC_STORE_IMAGE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80'

export default function DynamicBusinessTypesSection() {
  const [items, setItems] = useState<BusinessTypeRecord[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [demoSlug, setDemoSlug] = useState<string | null>(null)
  const [preferredType, setPreferredType] = useState<string | null>(() => localStorage.getItem(PREFERRED_TYPE_KEY))
  const [showNudge, setShowNudge] = useState(false)

  useEffect(() => {
    Promise.all([
      listBusinessTypes(),
      listActiveRestaurants(250).catch(() => []),
      listFeaturedRestaurants(1).catch(() => []),
    ])
      .then(([types, activeRestaurants, featured]) => {
        setItems(types)
        setRestaurants(activeRestaurants)
        setDemoSlug(featured[0]?.slug || activeRestaurants[0]?.slug || null)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setShowNudge(true), 18000)
    return () => window.clearTimeout(timer)
  }, [])

  const homepageItems = useMemo(() => items.filter((item) => !HIDDEN_HOME_TYPES.has(item.code)), [items])
  const homeStoreCount = restaurants.filter((restaurant) => restaurant.show_on_home !== false).length
  const demoHref = demoSlug ? `/m/${demoSlug}` : '/restaurants'

  const topTypes = useMemo(() => {
    const counts = new Map<string, number>()
    restaurants.forEach((restaurant) => {
      const code = restaurant.business_type || ''
      if (code && !HIDDEN_HOME_TYPES.has(code)) counts.set(code, (counts.get(code) || 0) + 1)
    })
    return [...counts.entries()]
      .map(([code, count]) => ({ code, count, type: items.find((item) => item.code === code) }))
      .filter((row) => row.type)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [restaurants, items])

  const preferred = homepageItems.find((item) => item.code === preferredType) || null
  const personalizedRegister = preferred ? `/register?type=${encodeURIComponent(preferred.code)}&src=homepage-preferred` : '/register?src=homepage-cta'

  function rememberType(code: string) {
    localStorage.setItem(PREFERRED_TYPE_KEY, code)
    setPreferredType(code)
  }

  return (
    <>
      <section className="bg-[#efe9df] py-14 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            <StatCard value={restaurants.length} label="متجر نشط على المنصة" dark />
            <StatCard value={homepageItems.length} label="نوع نشاط متاح" />
            <StatCard value={homeStoreCount} label="متجر ظاهر في الرئيسية" />
            <div className="rounded-[24px] bg-[#d9c59a] p-5 border border-black/5"><div className="text-3xl font-black">72</div><div className="text-sm text-black/55 mt-1">ساعة تجربة مجانية</div></div>
          </div>

          <div className="rounded-[28px] bg-white border border-black/5 p-5 sm:p-6 mb-10 shadow-sm">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {['72 ساعة تجربة مجانية', 'بدون بطاقة بنكية', 'رابط + QR فورًا', 'تعديل في أي وقت'].map((text) => <div key={text} className="flex items-center gap-2 rounded-2xl bg-[#f6f1e8] px-4 py-3 text-sm font-semibold"><CheckCircle2 size={17} className="text-[#71805d]" />{text}</div>)}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-5 mb-14">
            <div className="rounded-[30px] bg-[#151612] text-white p-6 sm:p-8 relative overflow-hidden">
              <span className="text-[#d7b66f] text-sm font-bold">جرّب قبل ما تسجل</span>
              <h2 className="font-display text-2xl sm:text-3xl font-black mt-2">افتح متجر حقيقي وشوف التجربة بنفسك</h2>
              <p className="text-white/55 mt-3 leading-7">شوف طريقة عرض المنتجات والأسعار والاختيارات قبل إنشاء الحساب.</p>
              <Link to={demoHref} className="inline-flex items-center gap-2 mt-6 rounded-2xl bg-[#d7b66f] text-[#171714] px-5 py-3 font-bold">جرّب متجر حقيقي <ExternalLink size={17} /></Link>
            </div>
            <div className="rounded-[30px] bg-white border border-black/5 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-[#efe9df] flex items-center justify-center"><QrCode size={22} /></div><div><div className="font-bold">رابط واحد بدل عشرات الصور</div><div className="text-xs text-[#776f63] mt-1">ابعت الكتالوج مرة واحدة</div></div></div>
              <div className="space-y-3 text-sm text-[#615a50] mt-5">{['المنتجات منظمة', 'الأسعار والمواصفات واضحة', 'أي تعديل يظهر فورًا'].map((text) => <div key={text} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#657052]" />{text}</div>)}</div>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[#8d7444] text-sm font-bold">اختار نشاطك وابدأ فورًا</span>
            <h2 className="font-display text-3xl font-black mt-2">متجرك يتجهز على حسب نشاطك</h2>
            <p className="text-sm text-[#776f63] mt-3">اختار النشاط، وإحنا هنفتح التسجيل والنوع متحدد تلقائي.</p>
          </div>

          {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="h-56 rounded-[26px] bg-white/70 animate-pulse" />)}</div> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {homepageItems.map((item) => {
                const image = item.image_url || FALLBACK_IMAGES[item.code] || GENERIC_STORE_IMAGE
                return <div key={item.id} className="group rounded-[26px] bg-[#f8f4ed] border border-black/5 overflow-hidden shadow-[0_16px_36px_rgba(53,45,34,.07)]">
                  <div className="relative h-32 sm:h-40 overflow-hidden"><img src={image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" /><span className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-black/65 text-white flex items-center justify-center text-xl">{item.icon || '🏪'}</span></div>
                  <div className="p-4"><h3 className="font-display font-bold">{item.name}</h3><p className="text-xs text-[#776f63] mt-1 line-clamp-2">{item.description || 'متجر ومنتجات بشكل احترافي'}</p><Link onClick={() => rememberType(item.code)} to={`/register?type=${encodeURIComponent(item.code)}&src=business-type`} className="mt-4 flex items-center justify-center gap-1 rounded-xl bg-[#171714] text-white px-3 py-2.5 text-xs font-bold">ابدأ بنفس النشاط <ArrowLeft size={13} /></Link></div>
                </div>
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#f8f4ed] py-16 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-7">
          <div className="text-center max-w-2xl mx-auto mb-9"><span className="text-[#8d7444] text-sm font-bold">واتساب فقط ولا Egy Menu؟</span><h2 className="font-display text-3xl font-black mt-2">خلي العميل يوصل للمعلومة من غير ما يسألك كل مرة</h2></div>
          <div className="grid md:grid-cols-2 gap-5">
            <CompareCard title="واتساب فقط" bad items={['صور ورسائل متفرقة', 'العميل يسأل عن السعر كل مرة', 'صعب تعرض كل الألوان والمقاسات', 'أي تعديل يحتاج إرسال جديد']} />
            <CompareCard title="مع Egy Menu" items={['كل المنتجات في رابط واحد', 'السعر والخصم واضحين', 'ألوان ومقاسات ومواصفات', 'التعديل يظهر للعميل فورًا']} />
          </div>
        </div>
      </section>

      <section className="bg-[#171815] text-white py-16 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-7">
          <div className="text-center max-w-2xl mx-auto mb-10"><span className="text-[#d7b66f] text-sm font-bold">هتاخد إيه بعد التسجيل؟</span><h2 className="font-display text-3xl font-black mt-2">كل أدوات عرض منتجاتك في مكان واحد</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Benefit icon={Store} title="متجر مرتب" text="أقسام ومنتجات وصور ومواصفات" />
            <Benefit icon={QrCode} title="QR جاهز" text="للمحل والمطبوعات" />
            <Benefit icon={Share2} title="رابط مباشر" text="للواتساب والسوشيال" />
            <Benefit icon={PackageCheck} title="لوحة تحكم" text="تعديل الأسعار والمنتجات بسهولة" />
          </div>
          <div className="mt-10 rounded-[30px] bg-[#d7b66f] text-[#171714] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5"><div><div className="font-display text-2xl font-black">شوفت الشكل؟ اعمل متجرك دلوقتي</div><div className="text-sm text-black/60 mt-2">72 ساعة تجربة مجانية، بدون بطاقة بنكية.</div></div><Link to={personalizedRegister} className="shrink-0 rounded-2xl bg-[#171714] text-white px-6 py-3.5 font-black">{preferred ? `ابدأ متجر ${preferred.name}` : 'ابدأ متجرك الآن'}</Link></div>
        </div>
      </section>

      {topTypes.length > 0 && <section className="bg-[#efe9df] py-14 border-b border-black/5"><div className="max-w-6xl mx-auto px-5 sm:px-7"><div className="flex items-end justify-between gap-4 mb-7"><div><span className="text-[#8d7444] text-sm font-bold">أكثر الأنشطة تسجيلًا</span><h2 className="font-display text-2xl sm:text-3xl font-black mt-2">أنشطة عليها إقبال حاليًا</h2></div></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{topTypes.map(({ code, count, type }) => <Link onClick={() => rememberType(code)} key={code} to={`/register?type=${encodeURIComponent(code)}&src=popular-business-type`} className="rounded-2xl bg-white border border-black/5 p-5 hover:-translate-y-1 transition-transform"><div className="text-2xl">{type?.icon || '🏪'}</div><div className="font-bold mt-2">{type?.name}</div><div className="text-xs text-[#776f63] mt-1">{count} متجر على المنصة</div></Link>)}</div></div></section>}

      <section className="bg-[#f8f4ed] py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-7">
          <div className="grid md:grid-cols-3 gap-4">
            <StepCard n="01" icon={Store} title="سجّل نشاطك" text="أقل من دقيقتين" />
            <StepCard n="02" icon={ShoppingBag} title="ضيف أول منتج" text="صورة + سعر + تفاصيل" />
            <StepCard n="03" icon={Share2} title="شارك الرابط" text="واتساب أو QR" />
          </div>
        </div>
      </section>

      {showNudge && <div className="fixed left-4 bottom-24 sm:left-6 sm:bottom-6 z-[65] w-[min(360px,calc(100vw-32px))] rounded-[24px] bg-white border border-black/10 p-5 shadow-2xl" dir="rtl"><button onClick={() => setShowNudge(false)} className="absolute left-3 top-3 rounded-full bg-black/5 p-1.5"><X size={15} /></button><div className="flex items-center gap-2 text-[#8d7444] text-xs font-bold"><Clock3 size={15} /> التسجيل أقل من دقيقتين</div><div className="font-display text-xl font-black mt-2">جاهز تعمل متجرك؟</div><p className="text-xs text-[#776f63] leading-5 mt-2">ابدأ 72 ساعة مجانًا. بيانات التسجيل بتتحفظ لو خرجت ورجعت.</p><div className="grid grid-cols-2 gap-2 mt-4"><Link to={personalizedRegister} className="rounded-xl bg-[#171714] text-white px-3 py-2.5 text-center text-xs font-bold">ابدأ الآن</Link><a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('السلام عليكم، عايز أعمل متجر على Egy Menu ومحتاج مساعدة')}`} target="_blank" rel="noreferrer" className="rounded-xl bg-[#eaf7ed] text-[#3e6848] px-3 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-1"><MessageCircle size={14} /> واتساب</a></div></div>}
    </>
  )
}

function StatCard({ value, label, dark = false }: { value: number; label: string; dark?: boolean }) {
  return <div className={`rounded-[24px] p-5 border shadow-sm ${dark ? 'bg-[#171714] text-white border-white/5' : 'bg-white border-black/5'}`}><div className={`text-3xl font-black ${dark ? 'text-[#ead19a]' : 'text-[#657052]'}`}>{value}</div><div className={`text-sm mt-1 ${dark ? 'text-white/65' : 'text-[#776f63]'}`}>{label}</div></div>
}

function CompareCard({ title, items, bad = false }: { title: string; items: string[]; bad?: boolean }) {
  return <div className={`rounded-[30px] p-6 sm:p-8 border ${bad ? 'bg-white border-red-100' : 'bg-[#171714] text-white border-[#cfd9bf]'}`}><span className={`text-xs font-bold rounded-full px-3 py-1 ${bad ? 'bg-red-50 text-red-600' : 'bg-[#9eaa83]/20 text-[#cdd8b8]'}`}>{title}</span><div className="space-y-3 mt-5">{items.map((item) => <div key={item} className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className={bad ? 'text-red-400' : 'text-[#aebc91]'} />{item}</div>)}</div></div>
}

function Benefit({ icon: Icon, title, text }: { icon: typeof Store; title: string; text: string }) {
  return <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5"><div className="w-10 h-10 rounded-xl bg-[#d7b66f] text-[#171714] flex items-center justify-center"><Icon size={19} /></div><div className="font-bold mt-4">{title}</div><div className="text-xs text-white/45 mt-1 leading-5">{text}</div></div>
}

function StepCard({ n, icon: Icon, title, text }: { n: string; icon: typeof Store; title: string; text: string }) {
  return <div className="rounded-[26px] bg-white border border-black/5 p-6 relative"><span className="absolute left-5 top-4 text-4xl font-black text-black/[0.05]">{n}</span><div className="w-11 h-11 rounded-2xl bg-[#efe9df] flex items-center justify-center"><Icon size={20} /></div><div className="font-display text-lg font-bold mt-4">{title}</div><div className="text-sm text-[#776f63] mt-1">{text}</div></div>
}
