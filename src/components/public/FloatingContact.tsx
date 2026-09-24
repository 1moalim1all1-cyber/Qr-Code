import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageCircle, Phone, Sparkles } from 'lucide-react'
import { DEFAULT_SITE_SETTINGS, getSiteSettings } from '@/services/siteSettings'

export default function FloatingContact() {
  const { pathname } = useLocation()
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => undefined)
  }, [])

  if (pathname !== '/') return null

  const whatsappNumber = settings.whatsapp_number.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، عايز أعمل متجر على Egy Menu ومحتاج مساعدة في التسجيل')}`

  return (
    <>
      <div className="fixed inset-x-3 bottom-3 z-[68] sm:hidden" dir="rtl">
        <div className="rounded-[20px] border border-white/10 bg-[#11120f]/95 p-2.5 shadow-[0_18px_50px_rgba(0,0,0,.32)] backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between gap-2 px-1 text-[11px] text-white/55">
            <span className="inline-flex items-center gap-1.5"><Sparkles size={12} className="text-[#d7b66f]" /> أقل من دقيقتين</span>
            <span>10 أيام مجانًا • بدون بطاقة</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Link to="/register" className="flex items-center justify-center rounded-2xl bg-[#d7b66f] px-4 py-3 text-sm font-black text-[#171714]">ابدأ متجرك مجانًا</Link>
            {whatsappNumber && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="مساعدة التسجيل على واتساب" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg"><MessageCircle size={21} /></a>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 right-4 z-[70] hidden flex-col items-end gap-2 sm:flex sm:right-6" dir="rtl">
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

        <div className="rounded-full border border-white/10 bg-[#11120f]/95 px-4 py-2 text-[11px] text-white/65 shadow-lg backdrop-blur">10 أيام مجانًا • بدون بطاقة بنكية • تقدر تكمل تسجيلك لاحقًا</div>

        <Link to="/register" className="rounded-full bg-[#d7b66f] text-[#171714] shadow-[0_16px_40px_rgba(215,182,111,.28)] px-5 py-3 flex items-center gap-2 font-black hover:-translate-y-1 transition-transform">
          <Sparkles size={18} /> ابدأ متجرك مجانًا
        </Link>

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
              <span className="block text-[11px] font-medium text-white/80">مش عايز تسجل لوحدك؟ نساعدك</span>
              <span className="block text-sm" dir="ltr">{settings.contact_phone || settings.whatsapp_number}</span>
            </span>
          </a>
        )}
      </div>
    </>
  )
}
