import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, MapPin, Search, Store } from 'lucide-react'
import { listActiveRestaurants } from '@/services/restaurants'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import type { Restaurant } from '@/types/database'

export default function RestaurantsDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('all')
  const selectedType = searchParams.get('type') || 'all'

  useEffect(() => {
    Promise.all([listActiveRestaurants(250), listBusinessTypes()])
      .then(([stores, types]) => {
        setRestaurants(stores)
        setBusinessTypes(types)
      })
      .finally(() => setLoading(false))
  }, [])

  const businessTypeMap = useMemo(() => new Map(businessTypes.map((item) => [item.code, item])), [businessTypes])

  const cities = useMemo(() => {
    return Array.from(new Set(restaurants.map((r) => r.city?.trim()).filter((value): value is string => Boolean(value))))
      .sort((a, b) => a.localeCompare(b, 'ar'))
  }, [restaurants])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return restaurants.filter((r) => {
      const matchesType = selectedType === 'all' || r.business_type === selectedType
      const matchesCity = city === 'all' || r.city === city
      if (!matchesType || !matchesCity) return false
      if (!term) return true
      const typeName = r.business_type_name || businessTypeMap.get(r.business_type || '')?.name || ''
      return [r.name, r.address, r.city, typeName, r.description]
        .some((value) => String(value || '').toLowerCase().includes(term))
    })
  }, [restaurants, search, selectedType, city, businessTypeMap])

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    restaurants.forEach((restaurant) => {
      if (!restaurant.business_type) return
      counts.set(restaurant.business_type, (counts.get(restaurant.business_type) || 0) + 1)
    })
    return counts
  }, [restaurants])

  function chooseType(code: string) {
    if (code === 'all') setSearchParams({})
    else setSearchParams({ type: code })
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8]" dir="rtl">
      <header className="border-b border-black/5 sticky top-0 bg-[#f7f1e8]/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link to="/" className="text-stone hover:text-ink transition-colors"><ArrowRight size={20} /></Link>
          <span className="font-display font-semibold flex items-center gap-2"><Store size={18} className="text-saffron-dim" /> اكتشف المتاجر</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">
        <section className="rounded-[32px] bg-[#11120f] text-white p-6 sm:p-8 mb-7 overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#d7b66f]/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex rounded-full bg-white/7 border border-white/10 px-3 py-1.5 text-xs text-white/60">Catalog Marketplace</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-4">اكتشف المتاجر والكتالوجات</h1>
            <p className="text-white/50 text-sm sm:text-base mt-3 leading-7">اختار نوع النشاط أو المدينة، أو ابحث باسم المتجر والعنوان.</p>
          </div>
        </section>

        <section className="mb-7">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div><h2 className="font-display text-lg font-bold">أنواع الأنشطة</h2><p className="text-xs text-stone mt-1">الأنواع دي بتتحدث تلقائيًا من لوحة الإدارة.</p></div>
            <button onClick={() => chooseType('all')} className={`rounded-full px-3.5 py-2 text-xs font-semibold ${selectedType === 'all' ? 'bg-[#171714] text-white' : 'bg-white border border-black/5 text-stone'}`}>كل الأنشطة</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {businessTypes.map((item) => {
              const active = selectedType === item.code
              return <button key={item.id} onClick={() => chooseType(item.code)} className={`rounded-2xl border p-4 text-right transition-all hover:-translate-y-0.5 ${active ? 'bg-[#171714] text-white border-[#171714] shadow-lg' : 'bg-white border-black/5 hover:border-[#d7b66f]/40'}`}><div className="text-2xl mb-3">{item.icon || '🏪'}</div><div className="font-semibold text-sm line-clamp-2">{item.name}</div><div className={`text-[11px] mt-1 ${active ? 'text-white/45' : 'text-stone'}`}>{typeCounts.get(item.code) || 0} متجر</div></button>
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-black/5 p-4 sm:p-5 mb-6 shadow-sm">
          <div className="grid md:grid-cols-[1fr_220px] gap-3">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-light" size={18} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن متجر، نشاط، مدينة أو عنوان..." className="w-full rounded-2xl bg-[#faf7f1] border border-black/5 pr-11 pl-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30" />
            </div>
            <label className="relative"><MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-light" size={17} /><select value={city} onChange={(e) => setCity(e.target.value)} className="w-full appearance-none rounded-2xl bg-[#faf7f1] border border-black/5 pr-11 pl-4 py-3.5 text-sm outline-none"><option value="all">كل المدن</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-stone">
            <span>{filtered.length} متجر ظاهر</span>
            {(selectedType !== 'all' || city !== 'all' || search) && <button onClick={() => { chooseType('all'); setCity('all'); setSearch('') }} className="font-semibold text-[#8d7444]">مسح الفلاتر</button>}
          </div>
        </section>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="h-80 rounded-3xl bg-white/70 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl bg-white border border-black/5 text-center text-stone py-20"><Store size={38} className="mx-auto mb-3 opacity-25" /><p className="font-medium">{restaurants.length === 0 ? 'لسه مفيش متاجر منشورة.' : 'مفيش نتائج مطابقة للفلاتر الحالية.'}</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((r) => {
              const type = businessTypeMap.get(r.business_type || '')
              const typeName = r.business_type_name || type?.name || 'متجر'
              const location = [r.city, r.address].filter(Boolean).join(' · ')
              return (
                <a key={r.id} href={`${import.meta.env.BASE_URL}m/${r.slug}`} className="group overflow-hidden rounded-[28px] bg-white border border-black/5 shadow-[0_14px_45px_rgba(0,0,0,.06)] hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,.1)] transition-all">
                  <div className="h-40 relative bg-gradient-to-br from-[#25271f] to-[#a78545] overflow-hidden">
                    {r.cover_url ? <img src={r.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-5xl">{type?.icon || '🏪'}</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-black/55 backdrop-blur text-white px-2.5 py-1 text-[10px]">{type?.icon || '🏪'} {typeName}</span>
                    <div className="absolute -bottom-7 right-5 w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center font-bold text-xl">
                      {r.logo_url ? <img src={r.logo_url} alt="" className="w-full h-full object-contain" /> : r.name.charAt(0)}
                    </div>
                  </div>
                  <div className="p-5 pt-10">
                    <h2 className="font-display text-lg font-bold truncate">{r.name}</h2>
                    <p className="text-sm text-stone mt-1 min-h-5 truncate">{location || 'كتالوج إلكتروني على Egy Menu'}</p>
                    {r.description && <p className="text-xs text-stone mt-2 line-clamp-2 leading-5 min-h-10">{r.description}</p>}
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
