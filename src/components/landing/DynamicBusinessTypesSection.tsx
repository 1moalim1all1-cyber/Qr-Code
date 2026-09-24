import { useEffect, useState } from 'react'
import { ArrowLeft, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'

export default function DynamicBusinessTypesSection() {
  const [items, setItems] = useState<BusinessTypeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listBusinessTypes()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-[#efe9df] py-14 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-7">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-[#756d61]">منصة واحدة لأنشطة مختلفة</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">اختار نوع النشاط واكتشف المتاجر</h2>
            <p className="text-sm text-[#776f63] mt-2 max-w-2xl leading-6">كل نوع نشاط بيتضاف من لوحة الإدارة يظهر هنا تلقائيًا، من غير تعديل في الكود.</p>
          </div>
          <Link to="/restaurants" className="inline-flex items-center gap-2 rounded-2xl bg-[#171714] text-white px-4 py-2.5 text-sm font-bold self-start sm:self-auto">كل المتاجر <ArrowLeft size={16} /></Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="h-36 rounded-[26px] bg-white/70 animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="rounded-[28px] border border-black/5 bg-[#f8f4ed] p-8 text-center text-[#776f63]"><Store className="mx-auto mb-3 opacity-40" />أنواع الأنشطة هتظهر هنا تلقائيًا.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <Link key={item.id} to={`/restaurants?type=${encodeURIComponent(item.code)}`} className="group rounded-[26px] bg-[#f8f4ed] border border-black/5 p-5 shadow-[0_16px_36px_rgba(53,45,34,.07)] hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(53,45,34,.11)] transition-all min-h-36 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#171714] text-[#d7b66f] flex items-center justify-center text-2xl shadow-lg">{item.icon || '🏪'}</div>
                <div className="mt-5">
                  <h3 className="font-display font-bold leading-6">{item.name}</h3>
                  <p className="text-xs text-[#776f63] leading-5 mt-1 line-clamp-2">{item.description || 'متاجر وكتالوجات متخصصة على Egy Menu'}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8d7444] mt-3">عرض المتاجر <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
