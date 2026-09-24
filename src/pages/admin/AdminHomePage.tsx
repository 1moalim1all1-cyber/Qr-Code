import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Boxes, Eye, EyeOff, ImagePlus, LoaderCircle, PackagePlus, PhoneCall, Plus, Settings, ShieldCheck, Sparkles, Store, Tags, Trophy } from 'lucide-react'
import AdminDashboardPage from './AdminDashboardPage'
import { changeMyLoginPhone, listAllRestaurants, setRestaurantHomepageVisibility } from '@/services/admin'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import { useAuth } from '@/contexts/AuthContext'
import type { Restaurant } from '@/types/database'

type RestaurantWithSource = Restaurant & { registration_source?: string | null; managed_by_admin?: boolean | null }

const SOURCE_LABELS: Record<string, string> = {
  self_service: 'تسجيل مباشر',
  'business-type': 'من كارت نوع النشاط',
  homepage: 'من الرئيسية',
  hero: 'من الهيرو',
  'footer-cta': 'من زر آخر الصفحة',
  whatsapp: 'واتساب',
  admin_manual: 'إضافة الإدارة',
}

export default function AdminHomePage() {
  const { profile } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])
  const [homeMenusLoading, setHomeMenusLoading] = useState(true)
  const [busyRestaurantId, setBusyRestaurantId] = useState<string | null>(null)
  const [homeMenusError, setHomeMenusError] = useState<string | null>(null)
  const [changingLoginPhone, setChangingLoginPhone] = useState(false)

  async function loadHomepageMenus() {
    setHomeMenusLoading(true)
    setHomeMenusError(null)
    try {
      const [allRestaurants, types] = await Promise.all([
        listAllRestaurants(),
        listBusinessTypes({ includeInactive: true }),
      ])
      setRestaurants(allRestaurants)
      setBusinessTypes(types)
    } catch (err) {
      setHomeMenusError(err instanceof Error ? err.message : 'تعذّر تحميل المتاجر')
    } finally {
      setHomeMenusLoading(false)
    }
  }

  useEffect(() => {
    loadHomepageMenus()
  }, [])

  const businessTypeMap = useMemo(
    () => new Map(businessTypes.map((item) => [item.code, item])),
    [businessTypes],
  )

  const visibleOnHomeCount = restaurants.filter((restaurant) => restaurant.show_on_home !== false).length

  const registrationStats = useMemo(() => {
    const sourceCounts = new Map<string, number>()
    const typeCounts = new Map<string, number>()
    let selfServiceTotal = 0
    let adminManualTotal = 0

    restaurants.forEach((restaurant) => {
      const row = restaurant as RestaurantWithSource
      const source = row.registration_source || (row.managed_by_admin ? 'admin_manual' : 'self_service')
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1)

      if (source === 'admin_manual' || row.managed_by_admin) adminManualTotal += 1
      else selfServiceTotal += 1

      const typeCode = restaurant.business_type || 'unknown'
      if (typeCode !== 'pharmacy') typeCounts.set(typeCode, (typeCounts.get(typeCode) || 0) + 1)
    })

    const sources = Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({
        source,
        count,
        label: SOURCE_LABELS[source] || source,
        percentage: restaurants.length ? Math.round((count / restaurants.length) * 100) : 0,
      }))

    const topBusinessTypes = Array.from(typeCounts.entries())
      .map(([code, count]) => {
        const type = businessTypeMap.get(code)
        return {
          code,
          count,
          name: type?.name || restaurants.find((restaurant) => restaurant.business_type === code)?.business_type_name || code,
          icon: type?.icon || '🏪',
          percentage: restaurants.length ? Math.round((count / restaurants.length) * 100) : 0,
        }
      })
      .sort((a, b) => b.count - a.count)

    const selfServiceRate = restaurants.length ? Math.round((selfServiceTotal / restaurants.length) * 100) : 0
    const adminManualRate = restaurants.length ? Math.round((adminManualTotal / restaurants.length) * 100) : 0

    return {
      total: restaurants.length,
      selfServiceTotal,
      adminManualTotal,
      selfServiceRate,
      adminManualRate,
      businessTypeTotal: sourceCounts.get('business-type') || 0,
      sources,
      topBusinessTypes,
      topSource: sources[0] || null,
      topBusinessType: topBusinessTypes[0] || null,
    }
  }, [restaurants, businessTypeMap])

  async function toggleHomepageVisibility(restaurantId: string, nextVisible: boolean) {
    setBusyRestaurantId(restaurantId)
    setHomeMenusError(null)
    try {
      await setRestaurantHomepageVisibility(restaurantId, nextVisible)
      setRestaurants((current) => current.map((restaurant) => restaurant.id === restaurantId
        ? { ...restaurant, show_on_home: nextVisible }
        : restaurant))
    } catch (err) {
      setHomeMenusError(err instanceof Error ? err.message : 'تعذّر تغيير ظهور المتجر في الرئيسية')
    } finally {
      setBusyRestaurantId(null)
    }
  }

  async function handleChangeLoginPhone() {
    const nextPhone = window.prompt(
      'اكتب رقم تسجيل الدخول الجديد للإدارة. الرقم ده هيحل محل رقم الدخول الحالي مع الحفاظ على نفس الحساب وكل المتاجر المرتبطة به.',
      profile?.phone || '',
    )
    if (nextPhone === null) return
    const trimmed = nextPhone.trim()
    if (!trimmed) return

    const confirmed = window.confirm(`تأكيد تغيير رقم تسجيل الدخول إلى ${trimmed}?\nكلمة السر هتفضل زي ما هي.`)
    if (!confirmed) return

    setChangingLoginPhone(true)
    setHomeMenusError(null)
    try {
      const result = await changeMyLoginPhone(trimmed)
      window.alert(`تم تغيير رقم تسجيل الدخول بنجاح إلى ${result.phone}.\nمن المرة الجاية استخدم الرقم الجديد مع نفس كلمة السر.`)
    } catch (err) {
      setHomeMenusError(err instanceof Error ? err.message : 'تعذّر تغيير رقم تسجيل الدخول')
    } finally {
      setChangingLoginPhone(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8]" dir="rtl">
      <section className="relative overflow-hidden bg-[#10110f] text-white">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-saffron/15 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-zaytoon/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-5 py-8 md:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70"><ShieldCheck size={14} /> مركز تحكم Egy Menu</span>
              <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold">لوحة الإدارة</h1>
              <p className="mt-2 max-w-2xl text-sm md:text-base text-white/60">العملاء والاشتراكات والمتاجر والكتالوجات والصور وإعدادات الموقع من مكان واحد.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 w-full lg:w-auto">
              <QuickAction to="/admin/catalog" icon={ImagePlus} title="الكتالوج المركزي" subtitle="المنتجات والصور المعتمدة" featured />
              <QuickAction to="/admin/business-types" icon={Tags} title="أنواع الأنشطة" subtitle="إضافة وتعديل وإخفاء" />
              <QuickAction to="/admin/site-settings" icon={Settings} title="بيانات الموقع" subtitle="التواصل والمكان والخصوصية" />
              <QuickAction to="/admin/clients/new" icon={Plus} title="إضافة متجر يدويًا" subtitle="بدون حساب" />
              <QuickAction to="/restaurants" icon={Store} title="دليل المتاجر" subtitle="المتاجر المنشورة" />
              <button type="button" onClick={handleChangeLoginPhone} disabled={changingLoginPhone} className="min-w-0 rounded-2xl px-4 py-3 text-right bg-white/7 border border-white/10 text-white hover:bg-white/10 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                {changingLoginPhone ? <LoaderCircle size={20} className="mb-2 animate-spin" /> : <PhoneCall size={20} className="mb-2" />}
                <p className="text-sm font-bold leading-5">تغيير رقم الدخول</p>
                <p className="text-[11px] mt-0.5 text-white/45">نفس الحساب ونفس كلمة السر</p>
              </button>
            </div>
          </div>

          <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={19} className="text-[#d7b66f]" />
              <div><p className="font-display font-bold">تحليل التسجيلات</p><p className="text-xs text-white/45 mt-0.5">مين بيسجل، جاي منين، وأنهي نشاط عليه إقبال أكتر.</p></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SourceMetric label="إجمالي المتاجر" value={registrationStats.total} />
              <SourceMetric label={`تسجيل ذاتي ${registrationStats.selfServiceRate}%`} value={registrationStats.selfServiceTotal} highlight />
              <SourceMetric label={`إضافة الإدارة ${registrationStats.adminManualRate}%`} value={registrationStats.adminManualTotal} />
              <SourceMetric label="من كروت الأنشطة" value={registrationStats.businessTypeTotal} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mt-4">
              <div className="rounded-2xl border border-white/10 bg-[#171815] p-4">
                <div className="flex items-center gap-2 mb-3"><Trophy size={17} className="text-[#d7b66f]" /><p className="font-semibold text-sm">أفضل مصادر التسجيل</p></div>
                <div className="space-y-3">
                  {registrationStats.sources.length === 0 ? <p className="text-xs text-white/35">مفيش بيانات كفاية لسه.</p> : registrationStats.sources.slice(0, 6).map((item, index) => (
                    <div key={item.source}>
                      <div className="flex items-center justify-between gap-3 text-xs"><span className="text-white/65">#{index + 1} {item.label}</span><strong>{item.count} <span className="text-white/35 font-normal">({item.percentage}%)</span></strong></div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-[#d7b66f]" style={{ width: `${item.percentage}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#171815] p-4">
                <div className="flex items-center gap-2 mb-3"><Store size={17} className="text-[#aebc91]" /><p className="font-semibold text-sm">أكثر أنواع النشاط تسجيلًا</p></div>
                <div className="space-y-3">
                  {registrationStats.topBusinessTypes.length === 0 ? <p className="text-xs text-white/35">مفيش بيانات كفاية لسه.</p> : registrationStats.topBusinessTypes.slice(0, 6).map((item, index) => (
                    <div key={item.code} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.035] px-3 py-2.5">
                      <div className="min-w-0"><span className="text-xs text-white/35 ml-2">#{index + 1}</span><span className="text-sm">{item.icon} {item.name}</span></div>
                      <strong className="text-sm text-[#ead19a]">{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(registrationStats.topSource || registrationStats.topBusinessType) && (
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {registrationStats.topSource && <div className="rounded-2xl bg-[#d7b66f]/10 border border-[#d7b66f]/20 p-4"><p className="text-[11px] text-[#d7b66f]">أقوى مصدر حاليًا</p><p className="font-bold mt-1">{registrationStats.topSource.label} — {registrationStats.topSource.count} تسجيل</p></div>}
                {registrationStats.topBusinessType && <div className="rounded-2xl bg-[#71805c]/10 border border-[#71805c]/20 p-4"><p className="text-[11px] text-[#b8c99c]">أكثر نشاط تسجيلًا</p><p className="font-bold mt-1">{registrationStats.topBusinessType.icon} {registrationStats.topBusinessType.name} — {registrationStats.topBusinessType.count}</p></div>}
              </div>
            )}
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
              <div><p className="text-xs text-white/45">كل المتاجر الموجودة بالفعل في قاعدة البيانات</p><h2 className="font-display text-lg font-bold mt-1">إدارة المتاجر ونوع النشاط وظهورها في الرئيسية</h2><p className="text-xs text-white/45 mt-1 leading-5">القائمة دي بتقرأ مجموعة المتاجر نفسها مباشرة، فبتظهر كل المتاجر القديمة والجديدة واليدوية حتى لو مفيش حساب مالك مرتبط بيها.</p></div>
              <div className="rounded-2xl bg-white/7 border border-white/10 px-4 py-3 text-sm shrink-0">ظاهر على الرئيسية: <strong className="text-[#ead19a]">{visibleOnHomeCount}</strong> / {restaurants.length}</div>
            </div>

            {homeMenusError && <p className="mb-3 rounded-xl bg-sumac/10 border border-sumac/20 px-3 py-2 text-xs text-red-200">{homeMenusError}</p>}

            {homeMenusLoading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-white/45 text-sm"><LoaderCircle size={18} className="animate-spin" /> جارِ تحميل المتاجر...</div>
            ) : restaurants.length === 0 ? (
              <div className="py-8 text-center text-white/45 text-sm">مفيش متاجر لسه.</div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[560px] overflow-auto pr-1">
                {restaurants.map((restaurant) => {
                  const shown = restaurant.show_on_home !== false
                  const busy = busyRestaurantId === restaurant.id
                  const type = businessTypeMap.get(restaurant.business_type || '')
                  const typeName = restaurant.business_type_name || type?.name || restaurant.business_type || 'نوع النشاط غير محدد'
                  const typeIcon = type?.icon || '🏪'
                  const sourceRow = restaurant as RestaurantWithSource
                  const source = sourceRow.registration_source || (sourceRow.managed_by_admin ? 'admin_manual' : 'self_service')
                  const sourceLabel = SOURCE_LABELS[source] || source
                  return (
                    <div key={restaurant.id} className="rounded-2xl border border-white/10 bg-[#171815] p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/8 overflow-hidden flex items-center justify-center shrink-0">{restaurant.logo_url ? <img src={restaurant.logo_url} alt="" className="w-full h-full object-contain bg-white" /> : <Store size={18} className="text-[#d7b66f]" />}</div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{restaurant.name}</p>
                          <p className="text-[11px] text-[#ead19a] mt-0.5 truncate">{typeIcon} {typeName}</p>
                          <p className="text-[11px] text-white/40 mt-0.5 truncate">{restaurant.city || restaurant.address || 'الموقع غير محدد'}</p>
                          <div className="mt-1 flex flex-wrap gap-1.5"><span className={`text-[10px] rounded-full px-2 py-1 ${shown ? 'bg-[#71805c]/20 text-[#b8c99c]' : 'bg-white/5 text-white/35'}`}>{shown ? 'ظاهر في الرئيسية' : 'مخفي من الرئيسية'}</span><span className="text-[10px] rounded-full bg-[#d7b66f]/10 text-[#ead19a] px-2 py-1">{sourceLabel}</span></div>
                        </div>
                        <button type="button" disabled={busy} onClick={() => toggleHomepageVisibility(restaurant.id, !shown)} className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 ${shown ? 'bg-sumac/15 text-red-200' : 'bg-zaytoon/20 text-[#c9d9ad]'}`}>{busy ? <LoaderCircle size={14} className="animate-spin" /> : shown ? <EyeOff size={14} /> : <Eye size={14} />}{shown ? 'إخفاء' : 'إظهار'}</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/8">
                        <Link to={`/admin/clients/${restaurant.id}/products`} className="rounded-xl bg-[#d7b66f] text-[#171714] px-2 py-2 text-[11px] font-bold flex items-center justify-center gap-1"><PackagePlus size={13} /> المنتجات</Link>
                        <Link to={`/admin/clients/${restaurant.id}/settings`} className="rounded-xl bg-white/10 border border-white/10 px-2 py-2 text-[11px] font-semibold flex items-center justify-center gap-1"><Settings size={13} /> بيانات المتجر</Link>
                        <a href={`${import.meta.env.BASE_URL}m/${restaurant.slug}`} target="_blank" rel="noreferrer" className="rounded-xl bg-white/7 border border-white/10 px-2 py-2 text-[11px] font-semibold flex items-center justify-center">عرض الكتالوج</a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <InfoCard icon={Boxes} title="كتالوج مركزي" text="ارفع صورة المنتج مرة واحدة وتكون جاهزة للاختيار والاستخدام." />
            <InfoCard icon={Sparkles} title="واجهات احترافية" text="عرض مناسب للموبايلات والملابس والإلكترونيات وباقي الأنشطة." />
            <InfoCard icon={ShieldCheck} title="تحكم كامل" text="إدارة التفعيل والتجديد والمنتجات والـQR من نفس الشاشة." />
          </div>
        </div>
      </section>

      <div className="[&>div>header]:hidden [&>div>main]:pt-6"><AdminDashboardPage /></div>
    </div>
  )
}

function SourceMetric({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return <div className={`rounded-2xl border p-4 ${highlight ? 'border-[#d7b66f]/35 bg-[#d7b66f]/10' : 'border-white/10 bg-white/[0.04]'}`}><div className={`text-3xl font-black ${highlight ? 'text-[#ead19a]' : 'text-white'}`}>{value}</div><div className="text-xs text-white/45 mt-1">{label}</div></div>
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Boxes; title: string; text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"><Icon className="text-saffron mb-2" size={20} /><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-white/50">{text}</p></div>
}

function QuickAction({ to, icon: Icon, title, subtitle, featured = false }: { to: string; icon: typeof Plus; title: string; subtitle: string; featured?: boolean }) {
  return <Link to={to} className={`min-w-0 rounded-2xl px-4 py-3 transition-all hover:-translate-y-0.5 ${featured ? 'bg-saffron text-ink shadow-[0_16px_35px_rgba(225,174,73,.22)]' : 'bg-white/7 border border-white/10 text-white hover:bg-white/10'}`}><Icon size={20} className="mb-2" /><p className="text-sm font-bold leading-5">{title}</p><p className={`text-[11px] mt-0.5 ${featured ? 'text-ink/60' : 'text-white/45'}`}>{subtitle}</p></Link>
}
