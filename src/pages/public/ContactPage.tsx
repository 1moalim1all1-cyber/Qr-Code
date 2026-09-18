import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { DEFAULT_SITE_SETTINGS, getSiteSettings, type SiteSettings } from '@/services/siteSettings'

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => undefined)
  }, [])

  const whatsapp = settings.whatsapp_number.replace(/\D/g, '')

  return (
    <div className="min-h-screen bg-paper-dim" dir="rtl">
      <header className="bg-ink text-paper">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
          <Link to="/" className="text-paper/70 hover:text-paper"><ArrowRight size={20} /></Link>
          <div>
            <h1 className="font-display text-2xl font-bold">تواصل معنا</h1>
            <p className="text-xs text-paper/50 mt-1">فريق Egy Menu جاهز يساعدك</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-4">
          {settings.contact_phone && <ContactCard icon={Phone} title="اتصال" value={settings.contact_phone} href={`tel:${settings.contact_phone}`} />}
          {settings.whatsapp_number && <ContactCard icon={MessageCircle} title="واتساب" value={settings.contact_phone || settings.whatsapp_number} href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('السلام عليكم، عايز أعرف تفاصيل Egy Menu')}`} external />}
          {settings.contact_email && <ContactCard icon={Mail} title="البريد الإلكتروني" value={settings.contact_email} href={`mailto:${settings.contact_email}`} />}
          {settings.address && <ContactCard icon={MapPin} title="العنوان" value={settings.address} href={settings.google_maps_url || undefined} external={Boolean(settings.google_maps_url)} />}
        </div>
      </main>
    </div>
  )
}

function ContactCard({ icon: Icon, title, value, href, external = false }: { icon: typeof Phone; title: string; value: string; href?: string; external?: boolean }) {
  const content = (
    <div className="rounded-3xl bg-paper border border-stone-light/30 p-5 shadow-sm h-full hover:border-saffron/40 transition-colors">
      <div className="w-11 h-11 rounded-2xl bg-saffron/15 text-saffron-dim flex items-center justify-center mb-4"><Icon size={20} /></div>
      <p className="text-sm text-stone">{title}</p>
      <p className="font-semibold mt-1 break-words" dir={title === 'اتصال' || title === 'واتساب' ? 'ltr' : undefined}>{value}</p>
    </div>
  )
  return href ? <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{content}</a> : content
}
