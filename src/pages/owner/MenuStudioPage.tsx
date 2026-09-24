import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import MenuPage from './MenuPage'

export default function MenuStudioPage() {
  return (
    <div className="relative">
      <MenuPage />
      <Link
        to="/dashboard/products"
        className="fixed z-40 left-4 bottom-24 sm:left-6 sm:bottom-6 rounded-full bg-[#171714] text-white shadow-2xl border border-white/10 px-4 py-3 flex items-center gap-2 text-sm font-bold hover:-translate-y-1 transition-transform"
      >
        <Sparkles size={17} className="text-[#d7b66f]" />
        إدارة المنتجات الاحترافية
      </Link>
    </div>
  )
}
