import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock, ExternalLink, Globe2, Globe2 as Facebook, Globe2 as Instagram, Globe2 as Youtube, MapPin, MessageCircle, Store } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurantByOwner, updateRestaurant } from '@/services/restaurants'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import { WEEK_DAYS, isRestaurantOpenNow } from '@/lib/businessHours'
import type { Restaurant, RestaurantSocialLinks } from '@/types/database'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ui/ImageUpload'

type WorkingHours = Record<string, { open: string; close: string; closed?: boolean }>

const DEFAULT_HOURS: WorkingHours = Object.fromEntries(
  WEEK_DAYS.map((d) => [d.key, { open: '10:00', close: '23:00', closed: false }])
)

const EMPTY_SOCIALS: RestaurantSocialLinks = {
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  x: '',
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])
  const [form, setForm] = useState({
    name: '', description: '', business_type: '', phone: '', whatsapp: '', email: '', website: '', address: '', city: '', google_maps_url: '',
  })
  const [socialLinks, setSocialLinks] = useState<RestaurantSocialLinks>(EMPTY_SOCIALS)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_HOURS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { listBusinessTypes().then(setBusinessTypes).catch(() => setBusinessTypes([])) }, [])

  useEffect(() => {
    if (!user) return
    getRestaurantByOwner(user.uid).then((r) => {
      if (!r) return
      setRestaurant(r)
      setForm({ name: r.name ?? '', description: r.description ?? '', business_type: r.business_type ?? 'restaurant', phone: r.phone ?? '', whatsapp: r.whatsapp ?? '', email: r.email ?? '', website: r.website ?? '', address: r.address ?? '', city: r.city ?? '', google_maps_url: r.google_maps_url ?? '' })
      setSocialLinks({ ...EMPTY_SOCIALS, ...(r.social_links ?? {}) })
      setLogoUrl(r.logo_url ?? null)
      setCoverUrl(r.cover_url ?? null)
      setIsOpen(r.is_open)
      if (r.working_hours && Object.keys(r.working_hours).length > 0) setWorkingHours({ ...DEFAULT_HOURS, ...r.working_hours })
    }).catch((err) => setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني'))
  }, [user])

  const selectedBusinessType = useMemo(() => businessTypes.find((item) => item.code === form.business_type), [businessTypes, form.business_type])
  const previewUrl = useMemo(() => {
    if (!restaurant?.slug || typeof window === 'undefined') return ''
    const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')
    return `${window.location.origin}${base}/m/${restaurant.slug}`
  }, [restaurant?.slug])

  async function handleSave() {
    if (!restaurant) return
    if (!form.name.trim()) { setError('اسم النشاط مطلوب'); return }
    setSaving(true); setSaved(false); setError(null)
    try {
      await updateRestaurant(restaurant.id, {
        name: form.name.trim(), description: form.description.trim() || null, business_type: form.business_type || restaurant.business_type || 'restaurant', business_type_name: selectedBusinessType?.name ?? restaurant.business_type_name ?? null,
        phone: form.phone.trim() || null, whatsapp: form.whatsapp.trim() || null, email: form.email.trim() || null, website: form.website.trim() || null, address: form.address.trim() || null, city: form.city.trim() || null, google_maps_url: form.google_maps_url.trim() || null,
        social_links: { facebook: socialLinks.facebook?.trim() || null, instagram: socialLinks.instagram?.trim() || null, tiktok: socialLinks.tiktok?.trim() || null, youtube: socialLinks.youtube?.trim() || null, x: socialLinks.x?.trim() || null },
        logo_url: logoUrl, cover_url: coverUrl, is_open: isOpen, working_hours: workingHours,
      })
      setRestaurant((current) => current ? { ...current, ...form, business_type_name: selectedBusinessType?.name ?? current.business_type_name, social_links: socialLinks, logo_url: logoUrl, cover_url: coverUrl, is_open: isOpen, working_hours: workingHours } : current)
      setSaved(true); setTimeout(() => setSaved(false), 2200)
    } catch (err) { setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني') }
    finally { setSaving(false) }
  }

  if (!restaurant) return <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center px-6 gap-3">{error ? <p className="text-sumac font-medium max-w-sm">{error}</p> : <p className="text-stone">جارِ التحميل...</p>}</div>

  return (
    <div className="min-h-screen bg-[#f5f0e8]" dir="rtl">
      <header className="sticky top-0 z-30 bg-[#11120f] text-white border-b border-white/10"><div className="max-w-5xl mx-auto px-5 sm:px-6 py-4 flex items-center gap-4"><Link to="/dashboard" className="w-9 h-9 rounded-xl bg-white/7 flex items-center justify-center hover:bg-white/12"><ArrowRight size={19} /></Link><div className="flex-1"><p className="text-[11px] text-white/40">واجهة المتجر</p><h1 className="font-display text-lg font-semibold">بيانات وشكل النشاط</h1></div>{previewUrl && <a href={previewUrl} target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold hover:bg-white/10"><ExternalLink size={14} /> معاينة المتجر</a>}</div></header>

      <main className="max-w-5xl mx-auto px-5 sm:px-6 py-7 space-y-5">
        <section className="rounded-[28px] bg-gradient-to-br from-[#1c1e19] to-[#0f100e] text-white overflow-hidden border border-white/5 shadow-xl">
          <div className="relative h-44 sm:h-56 bg-white/5">{coverUrl ? <img src={coverUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/25"><Store size={48} /></div>}<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" /><div className="absolute bottom-4 right-5 left-5 flex items-end gap-4"><div className="w-20 h-20 rounded-[24px] overflow-hidden bg-white border-4 border-white shadow-xl flex items-center justify-center text-[#171714] font-black text-2xl shrink-0">{logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain" /> : form.name.charAt(0) || 'E'}</div><div className="min-w-0 pb-1"><h2 className="font-display text-xl sm:text-2xl font-bold truncate">{form.name || 'اسم النشاط'}</h2><p className="text-sm text-white/55 mt-1 truncate">{selectedBusinessType?.icon || '🏪'} {selectedBusinessType?.name || restaurant.business_type_name || 'نوع النشاط'}{form.city ? ` · ${form.city}` : ''}</p></div></div></div>
          <div className="p-4 sm:p-5 grid sm:grid-cols-2 gap-4"><ImageUpload label="اللوجو" value={logoUrl} onChange={setLogoUrl} folder={`restaurants/${restaurant.id}`} aspect="square" fit="contain" /><ImageUpload label="صورة الغلاف Cover" value={coverUrl} onChange={setCoverUrl} folder={`restaurants/${restaurant.id}`} aspect="wide" /></div>
        </section>

        <section className="rounded-[28px] bg-white border border-black/5 p-5 sm:p-6 shadow-sm"><div className="mb-5"><h2 className="font-display text-lg font-bold">بيانات المتجر</h2><p className="text-xs text-stone mt-1">البيانات دي بتظهر للعميل في صفحة الكتالوج ودليل المتاجر.</p></div><div className="grid sm:grid-cols-2 gap-4"><Input label="اسم النشاط" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><label className="text-sm font-medium text-ink">نوع النشاط<select value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-light/50 bg-white px-3 py-3 outline-none focus:border-saffron"><option value="">اختار نوع النشاط</option>{businessTypes.map((item) => <option key={item.id} value={item.code}>{item.icon || '🏪'} {item.name}</option>)}</select></label><Input label="المدينة" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="مثال: القاهرة" /><Input label="العنوان بالتفصيل" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /><div className="sm:col-span-2"><Input label="وصف مختصر للنشاط" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="اكتب نبذة قصيرة تظهر للعميل..." /></div></div></section>

        <section className="rounded-[28px] bg-white border border-black/5 p-5 sm:p-6 shadow-sm"><div className="mb-5"><h2 className="font-display text-lg font-bold">التواصل والموقع</h2><p className="text-xs text-stone mt-1">كل البيانات اختيارية، وأي حقل فاضي مش هيظهر للعميل.</p></div><div className="grid sm:grid-cols-2 gap-4"><Input label="رقم الاتصال" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><Input label="واتساب" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="201234567890" /><Input label="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><Input label="الموقع الإلكتروني" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." /><div className="sm:col-span-2"><Input label="رابط Google Maps" value={form.google_maps_url} onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })} placeholder="https://maps.google.com/..." /></div></div><div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3"><SocialField icon={<Facebook size={16} />} label="Facebook" value={socialLinks.facebook || ''} onChange={(value) => setSocialLinks({ ...socialLinks, facebook: value })} /><SocialField icon={<Instagram size={16} />} label="Instagram" value={socialLinks.instagram || ''} onChange={(value) => setSocialLinks({ ...socialLinks, instagram: value })} /><SocialField icon={<MessageCircle size={16} />} label="TikTok" value={socialLinks.tiktok || ''} onChange={(value) => setSocialLinks({ ...socialLinks, tiktok: value })} /><SocialField icon={<Youtube size={16} />} label="YouTube" value={socialLinks.youtube || ''} onChange={(value) => setSocialLinks({ ...socialLinks, youtube: value })} /><SocialField icon={<Globe2 size={16} />} label="X / Twitter" value={socialLinks.x || ''} onChange={(value) => setSocialLinks({ ...socialLinks, x: value })} /></div></section>

        <section className="rounded-[28px] bg-white border border-black/5 p-5 sm:p-6 shadow-sm"><div className="flex items-center justify-between gap-4 mb-5"><div><h2 className="font-display text-lg font-bold flex items-center gap-2"><Clock size={18} className="text-saffron-dim" /> مواعيد العمل</h2><p className="text-xs text-stone mt-1">حالة مفتوح الآن بتتحسب تلقائيًا من الجدول.</p></div><button onClick={() => setIsOpen(!isOpen)} className={`rounded-full px-4 py-2 text-xs font-bold ${isOpen ? 'bg-zaytoon/15 text-zaytoon' : 'bg-sumac/15 text-sumac'}`}>{isOpen ? 'النشاط شغّال' : 'مقفول مؤقتًا'}</button></div>{isOpen && <div className={`mb-4 rounded-xl px-3 py-2 text-xs ${isRestaurantOpenNow({ is_open: isOpen, working_hours: workingHours }) ? 'bg-zaytoon/10 text-zaytoon' : 'bg-sumac/10 text-sumac'}`}>الحالة الحالية: {isRestaurantOpenNow({ is_open: isOpen, working_hours: workingHours }) ? 'مفتوح الآن' : 'مغلق حاليًا'}</div>}<div className="space-y-2">{WEEK_DAYS.map((day) => { const dayHours = workingHours[day.key] ?? { open: '10:00', close: '23:00', closed: false }; return <div key={day.key} className="rounded-2xl bg-paper-dim border border-black/5 p-3 flex items-center gap-3 flex-wrap sm:flex-nowrap"><span className="w-16 text-sm font-medium shrink-0">{day.label}</span><label className="flex items-center gap-1.5 text-xs text-stone shrink-0"><input type="checkbox" checked={!dayHours.closed} onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...dayHours, closed: !e.target.checked } })} /> مفتوح</label>{!dayHours.closed ? <><input type="time" value={dayHours.open} onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...dayHours, open: e.target.value } })} className="rounded-lg border border-stone-light/50 bg-white px-2 py-1.5 text-xs" /><span className="text-xs text-stone-light">إلى</span><input type="time" value={dayHours.close} onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...dayHours, close: e.target.value } })} className="rounded-lg border border-stone-light/50 bg-white px-2 py-1.5 text-xs" /></> : <span className="text-xs text-sumac">مغلق طول اليوم</span>}</div> })}</div></section>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
        <div className="sticky bottom-4 z-20 rounded-2xl bg-[#11120f]/95 backdrop-blur border border-white/10 p-3 shadow-2xl flex items-center justify-between gap-3"><div className="hidden sm:flex items-center gap-2 text-xs text-white/50"><MapPin size={14} /> أي تعديل هنا يظهر في واجهة المتجر بعد الحفظ.</div><Button onClick={handleSave} loading={saving} className="w-full sm:w-auto sm:min-w-44">{saved ? <><Check size={16} /> اتحفظ</> : 'حفظ كل التعديلات'}</Button></div>
      </main>
    </div>
  )
}

function SocialField({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-medium text-stone"><span className="flex items-center gap-1.5 mb-1.5">{icon}{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." dir="ltr" className="w-full rounded-xl border border-stone-light/40 bg-paper px-3 py-2.5 text-sm text-left outline-none focus:border-saffron" /></label>
}
