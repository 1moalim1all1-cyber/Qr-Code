import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, Eye, EyeOff, ImagePlus, LoaderCircle, PhoneCall, Plus, Settings, ShieldCheck, Sparkles, Store, Tags } from 'lucide-react'
import AdminDashboardPage from './AdminDashboardPage'
import { changeMyLoginPhone, listAdminClients, setRestaurantHomepageVisibility, type AdminClientRecord } from '@/services/admin'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminHomePage() {
  const { profile } = useAuth()
  const [clients, setClients] = useState<AdminClientRecord[]>([])
  const [homeMenusLoading, setHomeMenusLoading] = useState(true)
  const [busyRestaurantId, setBusyRestaurantId] = useState<string | null>(null)
  const [homeMenusError, setHomeMenusError] = useState<string | null>(null)
  const [changingLoginPhone, setChangingLoginPhone] = useState(false)

  async function loadHomepageMenus() {
    setHomeMenusLoading(true)
    setHomeMenusError(null)
    try {
      setClients(await listAdminClients())
    } catch (err) {
      setHomeMenusError(err instanceof Error ? err.message : 'تعذّر تحميل المنيوهات')
    } finally {
      setHomeMenusLoading(false)
    }
  }

  useEffect(() => {
    loadHomepageMenus()
  }, [])

  const restaurants = useMemo(
    () => clients.map((client) => client.restaurant).filter((restaurant): restaurant is NonNullable<AdminClientRecord['restaurant']> => Boolean(restaurant)),
    [clients],
  )

  const visibleOnHomeCount = restaurants.filter((restaurant) => restaurant.show_on_home !== false).length

  async function toggleHomepageVisibility(restaurantId: string, nextVisible: boolean) {
    setBusyRestaurantId(restaurantId)
    setHomeMenusError(null)
    try {
      await setRestaurantHomepageVisibility(restaurantId, nextVisible)
      setClients((current) => current.map((client) => client.restaurant?.id === restaurantId
        ? { ...client, restaurant: { ...client.restaurant, show_on_home: nextVisible } }
        : client))
    } catch (err) {
      setHomeMenusError(err instanceof Error ? err.message : 'تعذّر تغيير ظهور المنيو في الرئيسية')
    } finally {
      setBusyRestaurantId(null)
    }
  }

  async function handleChangeLoginPhone() {
    const nextPhone = window.prompt(
      'اكتب رقم تسجيل الدخول الجديد للإدارة. الرقم ده هيحل محل رقم الدخول الحالي مع الحفاظ على نفس الحساب وكل المنيوهات المرتبطة به.',
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
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                <ShieldCheck size={14} /> مركز تحكم Egy Menu
              </span>
              <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold">لوحة الإدارة</h1>
              <p className="mt-2 max-w-2xl text-sm md:text-base text-white/60">العملاء والاشتراكات والكتالوج والصور وإعدادات الموقع من مكان واحد.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 w-full lg:w-auto">
              <QuickAction to="/admin/catalog" icon={ImagePlus} title="إدارة المنتجات والصور" subtitle="الكتالوج المعتمد" featured />
              <QuickAction to="/admin/business-types" icon={Tags} title="أنواع الأنشطة" subtitle="إضافة وتعديل وحذف" />
              <QuickAction to="/admin/site-settings" icon={Settings} title="بيانات الموقع" subtitle="التواصل والمكان والخصوصية" />
              <QuickAction to="/admin/clients/new" icon={Plus} title="إضافة محل يدويًا" subtitle="بدون حساب" />
              <QuickAction to="/restaurants" icon={Store} title="عرض المنيوهات" subtitle="المتاجر المنشورة" />
              <button
                type="button"
                onClick={handleChangeLoginPhone}
                disabled={changingLoginPhone}
                className="min-w-0 rounded-2xl px-4 py-3 text-right bg-white/7 border border-white/10 text-white hover:bg-white/10 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {changingLoginPhone ? <LoaderCircle size={20} className="mb-2 animate-spin" /> : <PhoneCall size={20} className="mb-2" />}
                <p className="text-sm font-bold leading-5">تغيير رقم الدخول</p>
                <p className="text-[11px] mt-0.5 text-white/45">نفس الحساب ونفس كلمة السر</p>
              </button>
            </div>
          </div>

          <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-white/45">المنيوهات اللي بتظهر في الصفحة الرئيسية</p>
                <h2 className="font-display text-lg font-bold mt-1">تحكم في ظهور كل منيو على الرئيسية فقط</h2>
                <p className="text-xs text-white/45 mt-1 leading-5">لو أخفيت منيو من هنا، رابط المنيو نفسه يفضل شغال عادي. اللي بيتغير بس هو ظهوره في قسم المنيوهات الحقيقية في الصفحة الرئيسية.</p>
              </div>
              <div className="rounded-2xl bg-white/7 border border-white/10 px-4 py-3 text-sm shrink-0">
                ظاهر على الرئيسية: <strong className="text-[#ead19a]">{visibleOnHomeCount}</strong> / {restaurants.length}
              </div>
            </div>

            {homeMenusError && <p className="mb-3 rounded-xl bg-sumac/10 border border-sumac/20 px-3 py-2 text-xs text-red-200">{homeMenusError}</p>}

            {homeMenusLoading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-white/45 text-sm"><LoaderCircle size={18} className="animate-spin" /> جارِ تحميل المنيوهات...</div>
            ) : restaurants.length === 0 ? (
              <div className="py-8 text-center text-white/45 text-sm">مفيش منيوهات لسه.</div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[430px] overflow-auto pr-1">
                {restaurants.map((restaurant) => {
                  const shown = restaurant.show_on_home !== false
                  const busy = busyRestaurantId === restaurant.id
                  return (
                    <div key={restaurant.id} className="rounded-2xl border border-white/10 bg-[#171815] p-3 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/8 overflow-hidden flex items-center justify-center shrink-0">
                        {restaurant.logo_url ? <img src={restaurant.logo_url} alt="" className="w-full h-full object-contain bg-white" /> : <Store size={18} className="text-[#d7b66f]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{restaurant.name}</p>
                        <p className={`text-[11px] mt-1 ${shown ? 'text-[#aebc91]' : 'text-white/35'}`}>{shown ? 'ظاهر في الرئيسية' : 'مخفي من الرئيسية'}</p>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggleHomepageVisibility(restaurant.id, !shown)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 ${shown ? 'bg-sumac/15 text-red-200' : 'bg-zaytoon/20 text-[#c9d9ad]'}`}
                      >
                        {busy ? <LoaderCircle size={14} className="animate-spin" /> : shown ? <EyeOff size={14} /> : <Eye size={14} />}
                        {shown ? 'إخفاء' : 'إظهار'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <Boxes className="text-saffron mb-2" size={20} />
              <p className="font-semibold">كتالوج مركزي</p>
              <p className="mt-1 text-xs text-white/50">ارفع صورة المنتج مرة واحدة وتظهر للعميل جاهزة للاختيار.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <Sparkles className="text-saffron mb-2" size={20} />
              <p className="font-semibold">أفضل عرض للمنيو</p>
              <p className="mt-1 text-xs text-white/50">القالب 3D الفاخر هو الاختيار المميز للعرض البصري.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <ShieldCheck className="text-saffron mb-2" size={20} />
              <p className="font-semibold">تحكم كامل</p>
              <p className="mt-1 text-xs text-white/50">إدارة التفعيل والتجديد والأصناف والـQR من نفس الشاشة.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="[&>div>header]:hidden [&>div>main]:pt-6">
        <AdminDashboardPage />
      </div>
    </div>
  )
}

function QuickAction({ to, icon: Icon, title, subtitle, featured = false }: { to: string; icon: typeof Plus; title: string; subtitle: string; featured?: boolean }) {
  return (
    <Link
      to={to}
      className={`min-w-0 rounded-2xl px-4 py-3 transition-all hover:-translate-y-0.5 ${featured ? 'bg-saffron text-ink shadow-[0_16px_35px_rgba(225,174,73,.22)]' : 'bg-white/7 border border-white/10 text-white hover:bg-white/10'}`}
    >
      <Icon size={20} className="mb-2" />
      <p className="text-sm font-bold leading-5">{title}</p>
      <p className={`text-[11px] mt-0.5 ${featured ? 'text-ink/60' : 'text-white/45'}`}>{subtitle}</p>
    </Link>
  )
}
