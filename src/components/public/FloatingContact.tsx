import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageCircle, Phone } from 'lucide-react'
import { DEFAULT_SITE_SETTINGS, getSiteSettings } from '@/services/siteSettings'

export default function FloatingContact() {
  const { pathname } = useLocation()
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => undefined)
  }, [])

  if (pathname !== '/') return null

  const whatsappNumber = settings.whatsapp_number.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، عايز أعرف تفاصيل Egy Menu')}`

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-[70] flex flex-col items-end gap-2" dir="rtl">
      <div className="flex items-center gap-2 text-[11px] bg-white/95 border border-black/5 shadow-sm rounded-full px-3 py-1.5">
        <Link to="/contact" className="font-semibold hover:text-saffron-dim">تواصل معنا</Link>
        <span className="text-stone-light">•</span>
        <Link to="/privacy" className="text-stone hover:text-ink">سياسة الخصوصية</Link>
      </div>

      {settings.contact_phone && (
        <a
          href={`tel:${settings.contact_phone}`}
          className="rounded-full bg-[#11120f]/95 text-white border border-white/10 shadow-[0_14px_35px_rgba(0,0,0,.28)] px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur"
          aria-label={`اتصل بنا على ${settings.contact_phone}`}
        >
          <Phone size={15} className="text-[#d7b66f]" />
          <span>للتواصل: <b dir="ltr">{settings.contact_phone}</b></span>
        </a>
      )}

      {whatsappNumber && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="group rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_rgba(37,211,102,.35)] px-4 sm:px-5 py-3 flex items-center gap-2.5 font-bold hover:-translate-y-1 transition-transform"
          aria-label="تواصل عبر واتساب"
        >
          <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"><MessageCircle size={20} fill="currentColor" /></span>
          <span className="leading-tight text-right">
            <span className="block text-[11px] font-medium text-white/80">تواصل معنا على واتساب</span>
            <span className="block text-sm" dir="ltr">{settings.contact_phone || settings.whatsapp_number}</span>
          </span>
        </a>
      )}
    </div>
  )
}
