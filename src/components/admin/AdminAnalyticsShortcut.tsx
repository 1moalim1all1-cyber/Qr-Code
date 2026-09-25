import { BarChart3 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function AdminAnalyticsShortcut() {
  const { pathname } = useLocation()
  if (!pathname.startsWith('/admin') || pathname === '/admin/analytics') return null

  return (
    <Link
      to="/admin/analytics"
      className="fixed bottom-5 left-5 z-[75] hidden items-center gap-2 rounded-full bg-[#d7b66f] px-5 py-3 font-bold text-[#171714] shadow-[0_18px_45px_rgba(0,0,0,.22)] transition-transform hover:-translate-y-1 sm:flex"
      dir="rtl"
    >
      <BarChart3 size={18} /> تحليلات التسجيل
    </Link>
  )
}
