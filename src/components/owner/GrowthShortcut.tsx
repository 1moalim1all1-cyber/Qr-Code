import { Link, useLocation } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

export default function GrowthShortcut() {
  const location = useLocation()
  const show = location.pathname.startsWith('/dashboard') && location.pathname !== '/dashboard/growth'
  if (!show) return null

  return (
    <Link
      to="/dashboard/growth"
      className="fixed bottom-5 left-5 z-30 rounded-full bg-[#11120f] text-white shadow-2xl border border-white/10 px-4 py-3 text-sm font-semibold flex items-center gap-2 hover:-translate-y-0.5 transition-transform"
      aria-label="مركز النمو والمبيعات"
    >
      <TrendingUp size={17} className="text-[#d7b66f]" />
      <span className="hidden sm:inline">المبيعات والعملاء</span>
    </Link>
  )
}
