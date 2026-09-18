import { MessageCircle, Phone } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const CONTACT_LOCAL = '01039177959'
const CONTACT_WHATSAPP = '201039177959'

export default function FloatingContact() {
  const { pathname } = useLocation()
  if (pathname !== '/') return null

  const whatsappUrl = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent('السلام عليكم، عايز أعرف تفاصيل Egy Menu')}`

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-[70] flex flex-col items-end gap-2" dir="rtl">
      <a
        href={`tel:${CONTACT_LOCAL}`}
        className="rounded-full bg-[#11120f]/95 text-white border border-white/10 shadow-[0_14px_35px_rgba(0,0,0,.28)] px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur"
        aria-label={`اتصل بنا على ${CONTACT_LOCAL}`}
      >
        <Phone size={15} className="text-[#d7b66f]" />
        <span>للتواصل: <b dir="ltr">{CONTACT_LOCAL}</b></span>
      </a>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="group rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_rgba(37,211,102,.35)] px-4 sm:px-5 py-3 flex items-center gap-2.5 font-bold hover:-translate-y-1 transition-transform"
        aria-label={`تواصل عبر واتساب على ${CONTACT_LOCAL}`}
      >
        <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
          <MessageCircle size={20} fill="currentColor" />
        </span>
        <span className="leading-tight text-right">
          <span className="block text-[11px] font-medium text-white/80">تواصل معنا على واتساب</span>
          <span className="block text-sm" dir="ltr">{CONTACT_LOCAL}</span>
        </span>
      </a>
    </div>
  )
}
