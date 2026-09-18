import { Link, useLocation } from 'react-router-dom'

export default function SiteFooterLinks() {
  const { pathname } = useLocation()
  if (pathname !== '/') return null

  return (
    <div className="bg-[#0b0c0a] border-t border-white/5" dir="rtl">
      <div className="max-w-7xl mx-auto px-5 sm:px-7 pb-8 -mt-1 flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-2 text-sm text-white/55">
        <Link to="/contact" className="hover:text-white transition-colors">تواصل معنا</Link>
        <span className="text-white/20">•</span>
        <Link to="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
      </div>
    </div>
  )
}
