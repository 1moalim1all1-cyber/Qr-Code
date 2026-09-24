import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search, Store } from 'lucide-react'
import { listFeaturedRestaurants } from '@/services/restaurants'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import type { Restaurant } from '@/types/database'

export default function RestaurantsDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const selectedType = searchParams.get('type') || 'all'

  useEffect(() => {
    Promise.all([listFeaturedRestaurants(200), listBusinessTypes()])
      .then(([stores, types]) => {
        setRestaurants(stores)
        setBusinessTypes(types)
      })
      .finally(() => setLoading(false))
  }, [])

  const businessTypeMap = useMemo(() => new Map(businessTypes.map((item) => [item.code, item])), [businessTypes])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return restaurants.filter((r) => {
      const matchesType = selectedType === 'all' || r.business_type === selectedType
      if (!matchesType) return false
      if (!term) return true
      const typeName = r.business_type_name || businessTypeMap.get(r.business_type || '')?.name || ''
      return r.name.toLowerCase().includes(term) || r.address?.toLowerCase().includes(term) || typeName.toLowerCase().includes(term)
    })
  }, [restaurants, search, selectedType, businessTypeMap])

  function chooseType(code: string) {
    if (code === 'all') setSearchParams({})
    else setSearchParams({ type: code })
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8]" dir="rtl">
      <header className="border-b border-black/5 sticky top-0 bg-[#f7f1e8]/95 backdrop-blur-sm z-20">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link to="/" className="text-stone hover:text-ink transition-colors"><ArrowRight size={20} /></Link>
          <span className="font-display font-semibold flex items-center gap-2"><Store size={18} className="text-saffron-dim" /> اكتشف المتاجر</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="mb-7">
          <h1 className="font-display text-3xl font-bold">كل المتاجر والكتالوجات</h1>
          <p className="text-stone text-sm mt-2">اختار نوع النشاط أو ابحث باسم المتجر أو المدينة.</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-light" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن متجر، نشاط أو عنوان..." className="w-full rounded-2xl bg-white border border-black/5 pr-11 pl-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
          <button onClick={() => chooseType('all')} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedType === 'all' ? 'bg-[#171714] text-white' : 'bg-white border border-black/5 text-stone'}`}>كل الأنشطة</button>
          {businessTypes.map((item) => (
            <button key={item.id} onClick={() => chooseType(item.code)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedType === item.code ? 'bg-[#171714] text-white' : 'bg-white border border-black/5 text-stone'}`}>{item.icon || '🏪'} {item.name}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3,4,5,6].map((i) => <div key={i} className="h-72 rounded-3xl bg-white/70 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-stone py-20"><Store size={34} className="mx-auto mb-3 opacity-30" /><p>{restaurants.length === 0 ? 'لسه مفيش متاجر منشورة.' : 'مفيش نتائج مطابقة.'}</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => {
              const type = businessTypeMap.get(r.business_type || '')
              const typeName = r.business_type_name || type?.name || 'متجر'
              return (
                <a key={r.id} href={`${import.meta.env.BASE_URL}m/${r.slug}`} className="group overflow-hidden rounded-[28px] bg-white border border-black/5 shadow-[0_14px_45px_rgba(0,0,0,.06)] hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,.1)] transition-all">
                  <div className="h-36 relative bg-gradient-to-br from-[#25271f] to-[#a78545] overflow-hidden">
                    {r.cover_url ? <img src={r.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-5xl">{type?.icon || '🏪'}</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    <div className="absolute -bottom-7 right-5 w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center font-bold text-xl">
                      {r.logo_url ? <img src={r.logo_url} alt="" className="w-full h-full object-contain" /> : r.name.charAt(0)}
                    </div>
                  </div>
                  <div className="p-5 pt-10">
                    <span className="inline-flex rounded-full bg-[#f3ede3] px-2.5 py-1 text-[11px] text-stone">{type?.icon || '🏪'} {typeName}</span>
                    <h2 className="font-display text-lg font-bold mt-3 truncate">{r.name}</h2>
                    <p className="text-sm text-stone mt-1 h-5 truncate">{r.address || 'كتالوج إلكتروني على Egy Menu'}</p>
                    <div className="mt-5 rounded-xl bg-[#171714] text-white text-center py-2.5 text-sm font-bold group-hover:bg-saffron group-hover:text-ink transition-colors">عرض الكتالوج</div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
