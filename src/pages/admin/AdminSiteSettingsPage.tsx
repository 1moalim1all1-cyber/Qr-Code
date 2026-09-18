import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, LoaderCircle, MapPin, MessageCircle, Phone, Save, ShieldCheck } from 'lucide-react'
import { getSiteSettings, saveSiteSettings, type SiteSettings } from '@/services/siteSettings'

export default function AdminSiteSettingsPage() {
  const [form, setForm] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    getSiteSettings()
      .then(setForm)
      .catch((err) => setMessage(err instanceof Error ? err.message : 'تعذّر تحميل إعدادات الموقع'))
  }, [])

  function change<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((current) => current ? { ...current, [key]: value } : current)
  }

  async function save() {
    if (!form) return
    setSaving(true)
    setMessage(null)
    try {
      await saveSiteSettings(form)
      setMessage('تم حفظ إعدادات الموقع بنجاح')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'تعذّر حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  if (!form) return <div className="min-h-screen bg-paper flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-paper-dim" dir="rtl">
      <div className="max-w-4xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink mb-3"><ArrowRight size={16} /> رجوع للوحة الإدارة</Link>
            <h1 className="font-display text-3xl font-bold">بيانات الموقع والتواصل</h1>
            <p className="text-stone mt-2">عدّل رقم التواصل والواتساب والمكان وسياسة الخصوصية من هنا.</p>
          </div>
          <ShieldCheck className="text-saffron-dim" size={30} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field icon={Phone} label="رقم التواصل" value={form.contact_phone} onChange={(v) => change('contact_phone', v)} placeholder="01039177959" />
          <Field icon={MessageCircle} label="رقم واتساب الدولي" value={form.whatsapp_number} onChange={(v) => change('whatsapp_number', v)} placeholder="201039177959" />
          <Field label="البريد الإلكتروني" value={form.contact_email} onChange={(v) => change('contact_email', v)} placeholder="info@example.com" />
          <Field icon={MapPin} label="العنوان / المكان" value={form.address} onChange={(v) => change('address', v)} placeholder="القاهرة - مصر" />
          <div className="md:col-span-2">
            <Field label="رابط Google Maps" value={form.google_maps_url} onChange={(v) => change('google_maps_url', v)} placeholder="https://maps.google.com/..." />
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-paper border border-stone-light/30 p-5 shadow-sm">
          <label className="font-display text-lg font-semibold">سياسة الخصوصية</label>
          <p className="text-xs text-stone mt-1 mb-3">النص ده هيظهر مباشرة في صفحة سياسة الخصوصية.</p>
          <textarea
            value={form.privacy_policy}
            onChange={(e) => change('privacy_policy', e.target.value)}
            className="w-full min-h-[340px] rounded-2xl border border-stone-light/40 bg-white p-4 leading-7 outline-none focus:border-saffron"
          />
        </div>

        {message && <div className="mt-4 rounded-2xl bg-white border border-stone-light/30 p-3 text-sm">{message}</div>}

        <button onClick={save} disabled={saving} className="mt-5 rounded-2xl bg-ink text-paper px-6 py-3 font-semibold inline-flex items-center gap-2 disabled:opacity-50">
          {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, icon: Icon }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; icon?: typeof Phone }) {
  return (
    <label className="block rounded-2xl bg-paper border border-stone-light/30 p-4">
      <span className="text-sm font-semibold flex items-center gap-2">{Icon && <Icon size={16} className="text-saffron-dim" />}{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-stone-light/40 bg-white px-3 py-2.5 outline-none focus:border-saffron" />
    </label>
  )
}
