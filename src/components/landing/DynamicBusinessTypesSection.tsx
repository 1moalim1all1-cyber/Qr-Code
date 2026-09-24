import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, MessageCircle, QrCode, ShoppingBag, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import { listActiveRestaurants, listFeaturedRestaurants } from '@/services/restaurants'

const SUPPORT_WHATSAPP = '201039177959'
const HIDDEN_HOME_TYPES = new Set(['restaurant', 'cafe', 'supermarket', 'cosmetics'])

const FALLBACK_IMAGES: Record<string, string> = {
  mobiles: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80',
  clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80',
  shoes_bags: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  perfumes: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
  pharmacy: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
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
  const [loading, setLoading] = useState(true)
  const [storeCount, setStoreCount] = useState(0)
  const [homeStoreCount, setHomeStoreCount] = useState(0)
  const [demoSlug, setDemoSlug] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      listBusinessTypes(),
      listActiveRestaurants(250).catch(() => []),
      listFeaturedRestaurants(1).catch(() => []),
    ])
      .then(([types, restaurants, featured]) => {
        setItems(types)
        setStoreCount(restaurants.length)
        setHomeStoreCount(restaurants.filter((restaurant) => restaurant.show_on_home !== false).length)
        setDemoSlug(featured[0]?.slug || restaurants[0]?.slug || null)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const homepageItems = useMemo(
    () => items.filter((item) => !HIDDEN_HOME_TYPES.has(item.code)),
    [items],
  )

  const demoHref = demoSlug ? `/m/${demoSlug}` : '/restaurants'

  return (
    <>
      <section className="bg-[#efe9df] py-14 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
            <div className="rounded-[24px] bg-[#171714] text-white p-5 shadow-xl">
              <div className="text-3xl font-black text-[#ead19a]">{storeCount}</div>
              <div className="text-sm text-white/65 mt-1">متجر نشط على المنصة</div>
            </div>
            <div className="rounded-[24px] bg-white p-5 border border-black/5 shadow-sm">
              <div className="text-3xl font-black text-[#657052]">{homepageItems.length}</div>
              <div className="text-sm text-[#776f63] mt-1">نوع نشاط حديث</div>
            </div>
            <div className="rounded-[24px] bg-white p-5 border border-black/5 shadow-sm">
              <div className="text-3xl font-black text-[#8d7444]">{homeStoreCount}</div>
              <div className="text-sm text-[#776f63] mt-1">متجر مختار للظهور</div>
            </div>
            <div className="rounded-[24px] bg-[#d9c59a] p-5 border border-black/5">
              <div className="text-3xl font-black">10</div>
              <div className="text-sm text-black/55 mt-1">أيام تجربة مجانية</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-5 mb-14">
            <div className="rounded-[30px] bg-[#151612] text-white p-6 sm:p-8 overflow-hidden relative">
              <div className="absolute -left-16 -bottom-16 w-52 h-52 rounded-full bg-[#d7b66f]/15 blur-3xl" />
              <div className="relative">
                <span className="text-[#d7b66f] text-sm font-bold">جرّب قبل ما تسجل</span>
                <h2 className="font-display text-2xl sm:text-3xl font-black mt-2">افتح متجر حقيقي وشوف التجربة بنفسك</h2>
                <p className="text-white/55 mt-3 leading-7 max-w-2xl">شوف طريقة عرض المنتجات والصور والأسعار والاختيارات من غير ما تعمل حساب الأول.</p>
                <Link to={demoHref} className="inline-flex items-center gap-2 mt-6 rounded-2xl bg-[#d7b66f] text-[#171714] px-5 py-3 font-bold">جرّب متجر حقيقي <ArrowLeft size={17} /></Link>
              </div>
            </div>

            <div className="rounded-[30px] bg-white border border-black/5 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4"><div className="w-11 h-11 rounded-2xl bg-[#efe9df] flex items-center justify-center"><QrCode size={22} /></div><div><div className="font-bold">رابط واحد بدل عشرات الصور</div><div className="text-xs text-[#776f63] mt-1">ابعت الكتالوج مرة واحدة</div></div></div>
              <div className="space-y-3 text-sm text-[#615a50]">
                {['كل المنتجات منظمة في مكان واحد', 'الأسعار والمواصفات قدام العميل', 'تعديل المنتج يوصل للعميل فورًا'].map((text) => <div key={text} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#657052] shrink-0" />{text}</div>)}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-[#756d61]">متاجر حديثة لأنشطة مختلفة</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">اكتشف الأنشطة والمتاجر</h2>
              <p className="text-sm text-[#776f63] mt-2 max-w-2xl leading-6">موبايلات، إلكترونيات، ملابس، عطور، صيدليات، أثاث وتشطيبات وغيرهم.</p>
            </div>
            <Link to="/restaurants" className="inline-flex items-center gap-2 rounded-2xl bg-[#171714] text-white px-4 py-2.5 text-sm font-bold self-start sm:self-auto">كل المتاجر <ArrowLeft size={16} /></Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="h-56 rounded-[26px] bg-white/70 animate-pulse" />)}</div>
          ) : homepageItems.length === 0 ? (
            <div className="rounded-[28px] border border-black/5 bg-[#f8f4ed] p-8 text-center text-[#776f63]"><Store className="mx-auto mb-3 opacity-40" />أنواع الأنشطة هتظهر هنا تلقائيًا.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {homepageItems.map((item) => {
                const image = item.image_url || FALLBACK_IMAGES[item.code] || GENERIC_STORE_IMAGE
                return (
                  <Link key={item.id} to={`/restaurants?type=${encodeURIComponent(item.code)}`} className="group rounded-[26px] bg-[#f8f4ed] border border-black/5 overflow-hidden shadow-[0_16px_36px_rgba(53,45,34,.07)] hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(53,45,34,.11)] transition-all">
                    <div className="relative h-32 sm:h-40 overflow-hidden bg-[#ddd3c5]">
                      <img src={image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                      <div className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-black/65 backdrop-blur text-white flex items-center justify-center text-xl border border-white/15">{item.icon || '🏪'}</div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="font-display font-bold leading-6">{item.name}</h3>
                      <p className="text-xs text-[#776f63] leading-5 mt-1 line-clamp-2">{item.description || 'متاجر ومنتجات متخصصة على Egy Menu'}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8d7444] mt-3">عرض المتاجر <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" /></span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#f8f4ed] py-16 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-7">
          <div className="text-center max-w-2xl mx-auto mb-9">
            <span className="text-[#8d7444] text-sm font-bold">قبل / بعد</span>
            <h2 className="font-display text-3xl font-black mt-2">بدل ما تبعت المنتج صورة صورة على واتساب</h2>
            <p className="text-[#776f63] mt-3 leading-7">خلي العميل يدخل رابط واحد ويشوف كل المنتجات والأسعار والتفاصيل بنفسه.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-[30px] border border-red-100 bg-white p-6 sm:p-8">
              <span className="inline-flex rounded-full bg-red-50 text-red-600 text-xs font-bold px-3 py-1">قبل</span>
              <h3 className="font-display text-xl font-bold mt-4">صور ورسائل متفرقة</h3>
              <div className="mt-5 space-y-3">
                {['بكام المنتج ده؟', 'فيه لون تاني؟', 'ابعتلي باقي الموديلات', 'السعر ده لسه موجود؟'].map((text, i) => <div key={text} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-[#efe9df] mr-auto' : 'bg-[#dcf8c6] ml-auto'}`}>{text}</div>)}
              </div>
            </div>

            <div className="rounded-[30px] border border-[#cfd9bf] bg-[#171714] text-white p-6 sm:p-8 shadow-xl">
              <span className="inline-flex rounded-full bg-[#9eaa83]/20 text-[#cdd8b8] text-xs font-bold px-3 py-1">بعد Egy Menu</span>
              <h3 className="font-display text-xl font-bold mt-4">كتالوج مرتب قدام العميل</h3>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {['صورة المنتج', 'السعر والخصم', 'الألوان والمقاسات', 'المواصفات'].map((text) => <div key={text} className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShoppingBag size={18} className="text-[#d7b66f] mb-3" /><div className="text-sm font-semibold">{text}</div></div>)}
              </div>
              <Link to={demoHref} className="mt-5 w-full rounded-2xl bg-[#d7b66f] text-[#171714] py-3 font-bold flex items-center justify-center gap-2">شوف النتيجة <ArrowLeft size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <a
        href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('السلام عليكم، عايز أعرف أكتر عن Egy Menu وإنشاء كتالوج لمتجري')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="تواصل واتساب"
        className="fixed bottom-5 left-5 z-[70] rounded-full bg-[#25D366] text-white shadow-[0_18px_45px_rgba(0,0,0,.25)] px-4 py-3 flex items-center gap-2 font-bold text-sm hover:-translate-y-1 transition-transform"
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline">اسألنا على واتساب</span>
      </a>
    </>
  )
}
