import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, Clock, ExternalLink, Globe2, LoaderCircle, Save, Store } from 'lucide-react'
import { getRestaurantById, updateRestaurant } from '@/services/restaurants'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import { WEEK_DAYS, isRestaurantOpenNow } from '@/lib/businessHours'
import type { Restaurant, RestaurantSocialLinks } from '@/types/database'
import ImageUpload from '@/components/ui/ImageUpload'

type FormState = {
  name: string
  description: string
  business_type: string
  city: string
  address: string
  phone: string
  whatsapp: string
  email: string
  website: string
  google_maps_url: string
}

type WorkingHours = Record<string, { open: string; close: string; closed?: boolean }>

const EMPTY_SOCIALS: RestaurantSocialLinks = {
  facebook: '', instagram: '', tiktok: '', youtube: '', x: '',
}

const DEFAULT_HOURS: WorkingHours = Object.fromEntries(
  WEEK_DAYS.map((day) => [day.key, { open: '10:00', close: '23:00', closed: false }]),
)

export default function AdminStoreSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])
  const [form, setForm] = useState<FormState>({ name: '', description: '', business_type: '', city: '', address: '', phone: '', whatsapp: '', email: '', website: '', google_maps_url: '' })
  const [socialLinks, setSocialLinks] = useState<RestaurantSocialLinks>(EMPTY_SOCIALS)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_HOURS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([getRestaurantById(id), listBusinessTypes().catch(() => [])])
      .then(([r, types]) => {
        setRestaurant(r)
        setBusinessTypes(types)
        setForm({
          name: r.name || '',
          description: r.description || '',
          business_type: r.business_type || 'restaurant',
          city: r.city || '',
          address: r.address || '',
          phone: r.phone || '',
          whatsapp: r.whatsapp || '',
          email: r.email || '',
          website: r.website || '',
          google_maps_url: r.google_maps_url || '',
        })
        setSocialLinks({ ...EMPTY_SOCIALS, ...(r.social_links || {}) })
        setLogoUrl(r.logo_url || null)
        setCoverUrl(r.cover_url || null)
        setIsOpen(r.is_open !== false)
        if (r.working_hours && Object.keys(r.working_hours).length > 0) {
          setWorkingHours({ ...DEFAULT_HOURS, ...r.working_hours })
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر تحميل بيانات المتجر'))
      .finally(() => setLoading(false))
  }, [id])

  const selectedType = useMemo(() => businessTypes.find((item) => item.code === form.business_type), [businessTypes, form.business_type])
  const previewUrl = restaurant ? `${import.meta.env.BASE_URL}m/${restaurant.slug}` : ''
  const openNow = isRestaurantOpenNow({ is_open: isOpen, working_hours: workingHours })

  async function save() {
    if (!restaurant) return
    if (!form.name.trim()) { setError('اسم النشاط مطلوب'); return }
    setSaving(true); setSaved(false); setError(null)
    try {
      await updateRestaurant(restaurant.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        business_type: form.business_type || restaurant.business_type || 'restaurant',
        business_type_name: selectedType?.name || restaurant.business_type_name || null,
        city: form.city.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        google_maps_url: form.google_maps_url.trim() || null,
        social_links: {
          facebook: socialLinks.facebook?.trim() || null,
          instagram: socialLinks.instagram?.trim() || null,
          tiktok: socialLinks.tiktok?.trim() || null,
          youtube: socialLinks.youtube?.trim() || null,
          x: socialLinks.x?.trim() || null,
        },
        logo_url: logoUrl,
        cover_url: coverUrl,
        is_open: isOpen,
        working_hours: workingHours,
      })
      setRestaurant((current) => current ? { ...current, ...form, business_type_name: selectedType?.name || current.business_type_name, social_links: socialLinks, logo_url: logoUrl, cover_url: coverUrl, is_open: isOpen, working_hours: workingHours } : current)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر حفظ بيانات المتجر')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#f4efe7] flex items-center justify-center gap-2" dir="rtl"><LoaderCircle className="animate-spin" /> جارِ تحميل بيانات المتجر...</div>
  if (!restaurant) return <div className="min-h-screen bg-[#f4efe7] flex items-center justify-center px-6 text-center" dir="rtl">{error || 'المتجر غير موجود'}</div>

  return (
    <div className="min-h-screen bg-[#f4efe7]" dir="rtl">
      <header className="sticky top-0 z-30 bg-[#11120f] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link to="/admin" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><ArrowRight size={19} /></Link>
          <div className="flex-1 min-w-0"><p className="text-xs text-white/40">إدارة المتجر من لوحة الأدمن</p><h1 className="font-display text-xl font-bold truncate">{restaurant.name}</h1></div>
          <a href={previewUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold flex items-center gap-1.5"><ExternalLink size={14} /> معاينة</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6 space-y-5">
        <section className="rounded-[28px] bg-[#11120f] text-white overflow-hidden border border-white/10 shadow-xl">
          <div className="relative h-48 sm:h-64 bg-white/5">
            {coverUrl ? <img src={coverUrl} alt="" className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-white/20"><Store size={52} /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute bottom-5 right-5 left-5 flex items-end gap-4">
              <div className="w-20 h-20 rounded-[22px] bg-white border-4 border-white overflow-hidden flex items-center justify-center text-black font-black text-2xl">{logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain" /> : form.name.charAt(0) || 'E'}</div>
              <div className="min-w-0"><h2 className="text-2xl font-bold truncate">{form.name || 'اسم النشاط'}</h2><p className="text-sm text-white/55 mt-1">{selectedType?.icon || '🏪'} {selectedType?.name || restaurant.business_type_name || 'نوع النشاط'}{form.city ? ` · ${form.city}` : ''}</p></div>
            </div>
          </div>
          <div className="p-4 grid sm:grid-cols-2 gap-4"><ImageUpload label="اللوجو" value={logoUrl} onChange={setLogoUrl} folder={`restaurants/${restaurant.id}`} aspect="square" fit="contain" /><ImageUpload label="صورة الغلاف" value={coverUrl} onChange={setCoverUrl} folder={`restaurants/${restaurant.id}`} aspect="wide" /></div>
        </section>

        <section className="rounded-[28px] bg-white border border-black/5 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5"><div><h2 className="font-display text-lg font-bold">بيانات المتجر</h2><p className="text-xs text-stone mt-1">البيانات دي بتظهر في صفحة الكتالوج ودليل المتاجر.</p></div><button onClick={() => setIsOpen(!isOpen)} className={`rounded-full px-4 py-2 text-xs font-bold ${isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{isOpen ? 'النشاط شغّال' : 'مقفول مؤقتًا'}</button></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="اسم النشاط"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
            <Field label="نوع النشاط"><select value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} className="input"><option value="">اختار نوع النشاط</option>{businessTypes.map((item) => <option key={item.id} value={item.code}>{item.icon || '🏪'} {item.name}</option>)}</select></Field>
            <Field label="المدينة"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" /></Field>
            <Field label="العنوان"><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" /></Field>
            <div className="sm:col-span-2"><Field label="وصف النشاط"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-24" /></Field></div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white border border-black/5 p-5 sm:p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold mb-5">التواصل والروابط</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="رقم الاتصال"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" /></Field>
            <Field label="واتساب"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input" /></Field>
            <Field label="البريد الإلكتروني"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
            <Field label="الموقع الإلكتروني"><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input" placeholder="https://..." /></Field>
            <div className="sm:col-span-2"><Field label="Google Maps"><input value={form.google_maps_url} onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })} className="input" placeholder="https://maps.google.com/..." /></Field></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            <Social label="Facebook" value={socialLinks.facebook || ''} onChange={(v) => setSocialLinks({ ...socialLinks, facebook: v })} />
            <Social label="Instagram" value={socialLinks.instagram || ''} onChange={(v) => setSocialLinks({ ...socialLinks, instagram: v })} />
            <Social label="TikTok" value={socialLinks.tiktok || ''} onChange={(v) => setSocialLinks({ ...socialLinks, tiktok: v })} />
            <Social label="YouTube" value={socialLinks.youtube || ''} onChange={(v) => setSocialLinks({ ...socialLinks, youtube: v })} />
            <Social label="X / Twitter" value={socialLinks.x || ''} onChange={(v) => setSocialLinks({ ...socialLinks, x: v })} />
          </div>
        </section>

        <section className="rounded-[28px] bg-white border border-black/5 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div><h2 className="font-display text-lg font-bold flex items-center gap-2"><Clock size={18} className="text-[#b99047]" /> مواعيد العمل</h2><p className="text-xs text-stone mt-1">الأدمن يقدر يظبط مواعيد كل يوم، والحالة الحالية بتتحسب تلقائيًا.</p></div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${openNow ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{openNow ? 'مفتوح الآن' : 'مغلق حاليًا'}</span>
          </div>
          <div className="space-y-2">
            {WEEK_DAYS.map((day) => {
              const hours = workingHours[day.key] || { open: '10:00', close: '23:00', closed: false }
              return (
                <div key={day.key} className="rounded-2xl bg-[#faf7f2] border border-black/5 p-3 flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <span className="w-16 text-sm font-semibold shrink-0">{day.label}</span>
                  <label className="flex items-center gap-1.5 text-xs text-stone shrink-0"><input type="checkbox" checked={!hours.closed} onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...hours, closed: !e.target.checked } })} /> مفتوح</label>
                  {!hours.closed ? <><input type="time" value={hours.open} onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...hours, open: e.target.value } })} className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs" /><span className="text-xs text-stone">إلى</span><input type="time" value={hours.close} onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...hours, close: e.target.value } })} className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs" /></> : <span className="text-xs text-red-600">مغلق طول اليوم</span>}
                </div>
              )
            })}
          </div>
        </section>

        {error && <div className="rounded-2xl bg-red-50 text-red-700 border border-red-100 px-4 py-3 text-sm">{error}</div>}
        <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-[#171714] text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <LoaderCircle size={18} className="animate-spin" /> : saved ? <Check size={18} /> : <Save size={18} />}{saving ? 'جارِ الحفظ...' : saved ? 'تم الحفظ' : 'حفظ بيانات المتجر'}</button>
      </main>

      <style>{`.input{width:100%;border:1px solid rgba(0,0,0,.12);border-radius:12px;padding:.7rem .85rem;background:white;outline:none;font-size:.875rem}.input:focus{border-color:#d7b66f;box-shadow:0 0 0 3px rgba(215,182,111,.12)}`}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="text-sm font-semibold block mb-1.5">{label}</span>{children}</label> }
function Social({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="rounded-2xl border border-black/8 bg-[#faf7f2] p-3"><span className="text-xs font-semibold flex items-center gap-1.5 mb-2"><Globe2 size={14} /> {label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent outline-none text-xs" placeholder="https://..." /></label> }