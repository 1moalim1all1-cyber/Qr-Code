import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LogOut, QrCode, Eye, UtensilsCrossed, Building2, Settings, ClipboardList, Gift,
  CalendarClock, MessageCircle, CheckCircle2, Cuboid, PackagePlus, Copy, ExternalLink,
  ImagePlus, ListPlus, BadgeDollarSign, Share2, Database,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/auth'
import { getRestaurantByOwner } from '@/services/restaurants'
import { listCategories } from '@/services/categories'
import { listProducts } from '@/services/products'
import { getVisitStats } from '@/services/visits'
import type { Restaurant } from '@/types/database'

const SUPPORT_WHATSAPP = '201039177959'

function getCountdown(end?: string | null) {
  if (!end) return null
  const target = new Date(end).getTime()
  if (Number.isNaN(target)) return null
  const now = Date.now()
  const diff = Math.max(0, target - now)
  return {
    expired: target <= now,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [categoryCount, setCategoryCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [visitCount, setVisitCount] = useState(0)
  const [qrScanCount, setQrScanCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const subscriptionEnd = profile?.subscription_end || restaurant?.subscription_end || null
  const [countdown, setCountdown] = useState(() => getCountdown(subscriptionEnd))

  useEffect(() => {
    if (!user) return
    getRestaurantByOwner(user.uid)
      .then(async (r) => {
        setRestaurant(r)
        if (!r) return
        const [cats, products, visitStats] = await Promise.all([
          listCategories(r.id).catch(() => []),
          listProducts(r.id).catch(() => []),
          getVisitStats(r.id).catch(() => ({ visits: 0, qrScans: 0 })),
        ])
        setCategoryCount(cats.length)
        setProductCount(products.length)
        setVisitCount(visitStats.visits)
        setQrScanCount(visitStats.qrScans)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني'))
  }, [user])

  useEffect(() => {
    setCountdown(getCountdown(subscriptionEnd))
    if (!subscriptionEnd) return
    const timer = window.setInterval(() => setCountdown(getCountdown(subscriptionEnd)), 1000)
    return () => window.clearInterval(timer)
  }, [subscriptionEnd])

  const renewalUrl = useMemo(() => {
    const business = restaurant?.name || profile?.requested_business_name || 'النشاط'
    const msg = `السلام عليكم، أنا ${profile?.full_name || 'عميل'} وعايز أجدد اشتراك ${business}${subscriptionEnd ? `، الاشتراك الحالي ينتهي ${new Date(subscriptionEnd).toLocaleString('ar-EG')}` : ''}.`
    return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`
  }, [profile, restaurant, subscriptionEnd])

  const menuUrl = useMemo(() => {
    if (!restaurant?.slug) return ''
    const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')
    return `${window.location.origin}${base}/m/${restaurant.slug}`
  }, [restaurant?.slug])

  const shareUrl = useMemo(() => {
    if (!menuUrl) return '#'
    const sharedMenuUrl = `${menuUrl}?src=share`
    const text = `شوف منيو ${restaurant?.name || 'النشاط'} هنا: ${sharedMenuUrl}`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }, [menuUrl, restaurant?.name])

  async function copyMenuLink() {
    if (!menuUrl) return
    await navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const isTrial = Number(profile?.trial_days || restaurant?.trial_days || 0) > 0 && !profile?.last_renewed_at && !restaurant?.last_renewed_at
  const hasReadyCatalog = restaurant?.business_type === 'supermarket' || restaurant?.business_type === 'cosmetics'

  const setupSteps = [
    { done: Boolean(restaurant?.logo_url), title: 'اللوجو والغلاف', text: 'خلي الصفحة باسم وشكل نشاطك', to: '/dashboard/settings', icon: ImagePlus },
    { done: categoryCount > 0, title: 'اعمل أول قسم', text: 'مثلاً وجبات، مشروبات أو عناية بالبشرة', to: '/dashboard/menu', icon: ListPlus },
    { done: productCount > 0, title: 'ضيف أول منتج', text: 'اسم + صورة + سعر، والباقي اختياري', to: hasReadyCatalog ? '/dashboard/catalog' : '/dashboard/menu', icon: BadgeDollarSign },
    { done: productCount > 0 && Boolean(restaurant?.slug), title: 'شارك المنيو', text: 'انسخ الرابط أو حمّل QR', to: '/dashboard/qr', icon: Share2 },
  ]
  const completedSteps = setupSteps.filter((step) => step.done).length
  const progress = Math.round((completedSteps / setupSteps.length) * 100)

  return (
    <div className="min-h-screen bg-[#f1ece3]" dir="rtl">
      <header className="bg-[#11120f] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">أهلاً بيك، {profile?.full_name ?? '...'}</p>
            <h1 className="font-display text-xl font-bold mt-1">{restaurant?.name ?? (error ? 'حصل خطأ' : 'جارِ تحميل بيانات النشاط...')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {menuUrl && <a href={menuUrl} target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"><ExternalLink size={16} /> عرض المنيو</a>}
            <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors"><LogOut size={16} /> خروج</button>
          </div>
        </div>
      </header>

      {error && <div className="max-w-6xl mx-auto px-6 pt-4"><div className="rounded-xl bg-sumac/10 text-sumac text-sm px-4 py-3">{error}</div></div>}

      <main className="max-w-6xl mx-auto px-5 sm:px-6 py-7">
        <section className="rounded-[28px] bg-gradient-to-br from-[#1d1f19] to-[#0f100e] text-white p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,.18)] mb-6 overflow-hidden relative">
          <div className="absolute -left-16 -top-16 w-52 h-52 rounded-full bg-[#d7b66f]/10 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[#d7b66f] text-sm font-semibold">ابدأ من هنا</p>
                  <h2 className="font-display text-2xl font-bold mt-1">جهّز منيوك في 4 خطوات بس</h2>
                </div>
                <div className="text-left"><div className="text-3xl font-bold text-[#d7b66f]">{progress}%</div><div className="text-xs text-white/40">اكتمل</div></div>
              </div>
              <div className="h-2 rounded-full bg-white/8 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-l from-[#d7b66f] to-[#85906e] transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
            {menuUrl && <div className="flex flex-wrap gap-2 lg:justify-end">
              <button onClick={copyMenuLink} className="rounded-xl bg-white/8 border border-white/10 px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-white/12"><Copy size={16} /> {copied ? 'تم النسخ ✓' : 'نسخ الرابط'}</button>
              <a href={shareUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#6f7a5b] px-4 py-2.5 text-sm flex items-center gap-2 font-semibold"><MessageCircle size={16} /> مشاركة واتساب</a>
            </div>}
          </div>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {setupSteps.map((step, index) => <Link key={step.title} to={step.to} className={`rounded-2xl border p-4 transition-transform hover:-translate-y-1 ${step.done ? 'border-[#7f8b68]/30 bg-[#7f8b68]/10' : 'border-white/10 bg-white/[0.045]'}`}>
              <div className="flex items-center justify-between gap-2"><span className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center"><step.icon size={16} className={step.done ? 'text-[#aebc91]' : 'text-[#d7b66f]'} /></span>{step.done ? <CheckCircle2 size={18} className="text-[#aebc91]" /> : <span className="text-xs text-white/30">0{index + 1}</span>}</div>
              <div className="font-semibold mt-3">{step.title}</div><div className="text-xs text-white/45 mt-1 leading-5">{step.text}</div>
            </Link>)}
          </div>
        </section>

        {countdown && (
          <div className={`mb-6 rounded-3xl border p-5 ${countdown.expired ? 'bg-sumac/10 border-sumac/30' : isTrial ? 'bg-[#d7b66f]/10 border-[#d7b66f]/30' : 'bg-zaytoon/10 border-zaytoon/20'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div><p className="font-semibold flex items-center gap-2"><CalendarClock size={18} /> {isTrial ? 'الفترة التجريبية المجانية — 10 أيام' : 'مدة الاشتراك'}</p><p className="text-sm text-stone mt-1">{countdown.expired ? 'انتهت المدة الحالية — جدّد الاشتراك لاستمرار الخدمة.' : `ينتهي في ${new Date(subscriptionEnd!).toLocaleString('ar-EG')}`}</p></div>
              {!countdown.expired && <div className="grid grid-cols-4 gap-2 min-w-[280px]" dir="ltr"><CountdownBox value={countdown.days} label="يوم" /><CountdownBox value={countdown.hours} label="ساعة" /><CountdownBox value={countdown.minutes} label="دقيقة" /><CountdownBox value={countdown.seconds} label="ثانية" /></div>}
              {(countdown.expired || countdown.days <= 7) && <a href={renewalUrl} target="_blank" rel="noreferrer" className="rounded-full bg-zaytoon text-paper px-5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"><MessageCircle size={17} /> اطلب التجديد</a>}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <Metric icon={UtensilsCrossed} label="الأصناف" value={productCount} />
          <Metric icon={Building2} label="الأقسام" value={categoryCount} />
          <Metric icon={Eye} label="الزيارات الحقيقية" value={visitCount} />
          <Metric icon={QrCode} label="مسحات QR" value={qrScanCount} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/dashboard/menu" className="block rounded-3xl bg-[#11120f] text-white p-6 shadow-xl hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><UtensilsCrossed size={18} className="text-[#d7b66f]" /> المنتجات والأسعار</p><p className="text-white/45 text-sm mt-2">إضافة سريعة وتعديل السعر والإتاحة</p></Link>
          {hasReadyCatalog && <Link to="/dashboard/catalog" className="block rounded-3xl bg-[#d7b66f]/15 border border-[#d7b66f]/30 p-6 hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><PackagePlus size={18} className="text-[#8d7444]" /> الكتالوج الجاهز</p><p className="text-stone text-sm mt-2">اختار المنتجات واكتب السعر فقط</p></Link>}
          <Link to="/dashboard/design" className="block rounded-3xl bg-gradient-to-br from-[#25271f] to-[#11120f] text-white p-6 shadow-xl hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><Cuboid size={18} className="text-[#d7b66f]" /> شكل المنيو 3D</p><p className="text-white/45 text-sm mt-2">اختار قالب وشكل الكروت</p></Link>
          <Link to="/dashboard/settings" className="block rounded-3xl bg-white border border-black/5 p-6 hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><Settings size={18} className="text-[#7a8467]" /> بيانات النشاط</p><p className="text-stone text-sm mt-2">اللوجو، الغلاف والتواصل</p></Link>
          <Link to="/dashboard/qr" className="block rounded-3xl bg-[#6f7a5b] text-white p-6 hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><QrCode size={18} className="text-[#ead19a]" /> QR والمشاركة</p><p className="text-white/70 text-sm mt-2">حمّل الكود وشاركه فورًا</p></Link>
          <Link to="/dashboard/orders" className="block rounded-3xl bg-[#8d5f50] text-white p-6 hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><ClipboardList size={18} className="text-[#ead19a]" /> الطلبات</p><p className="text-white/70 text-sm mt-2">تابع الطلبات وحدّث حالتها</p></Link>
          <Link to="/dashboard/offers" className="block rounded-3xl bg-white border border-black/5 p-6 hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><Gift size={18} className="text-[#8d7444]" /> العروض</p><p className="text-stone text-sm mt-2">اعمل خصومات وكوبونات</p></Link>
          <Link to="/dashboard/data" className="block rounded-3xl bg-[#e8e1d5] border border-black/5 p-6 hover:-translate-y-1 transition-transform"><p className="font-display font-semibold flex items-center gap-2"><Database size={18} className="text-[#6f7a5b]" /> استيراد وتصدير</p><p className="text-stone text-sm mt-2">Excel/CSV، نسخة احتياطية ونقل جماعي</p></Link>
        </div>
      </main>
    </div>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string | number }) {
  return <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-[0_12px_30px_rgba(0,0,0,.04)]"><Icon className="text-[#7a8467] mb-3" size={21} /><p className="text-2xl font-display font-bold">{value}</p><p className="text-sm text-stone mt-1">{label}</p></div>
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return <div className="rounded-2xl bg-[#11120f] text-white px-3 py-3 text-center"><div className="font-display text-2xl font-bold tabular-nums">{String(value).padStart(2, '0')}</div><div className="text-[11px] text-white/45 mt-1">{label}</div></div>
}
