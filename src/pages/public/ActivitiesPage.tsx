import { Link } from 'react-router-dom'
import { ArrowRight, QrCode } from 'lucide-react'
import DynamicBusinessTypesSection from '@/components/landing/DynamicBusinessTypesSection'

export default function ActivitiesPage() {
  return <div className="min-h-screen bg-[#f1ede6]" dir="rtl">
    <header className="bg-[#0d0f0c] text-white border-b border-white/10"><div className="max-w-7xl mx-auto px-5 sm:px-7 py-4 flex items-center justify-between"><Link to="/" className="flex items-center gap-2 font-display font-black"><QrCode className="text-[#d7b66f]" /> Egy Menu</Link><Link to="/" className="text-sm text-white/65 flex items-center gap-2"><ArrowRight size={16}/> الرئيسية</Link></div></header>
    <section className="bg-[#0d0f0c] text-white"><div className="max-w-7xl mx-auto px-5 sm:px-7 py-12 sm:py-16"><p className="text-[#d7b66f] text-sm font-bold">الأنشطة</p><h1 className="font-display text-3xl sm:text-5xl font-black mt-2">اختار نشاطك وابدأ متجرك</h1><p className="text-white/55 mt-4 max-w-2xl leading-7">كل نشاط له طريقة عرض مناسبة للمنتجات والأقسام والمواصفات.</p></div></section>
    <DynamicBusinessTypesSection />
  </div>
}
