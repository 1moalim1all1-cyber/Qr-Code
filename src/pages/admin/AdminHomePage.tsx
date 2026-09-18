import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, Eye, EyeOff, ImagePlus, LoaderCircle, Plus, ShieldCheck, Sparkles, Store } from 'lucide-react'
import AdminDashboardPage from './AdminDashboardPage'
import { getGlobalMenuVisibility, setGlobalMenuVisibility } from '@/services/platformSettings'

export default function AdminHomePage() {
  const [menusVisible, setMenusVisible] = useState<boolean | null>(null)
  const [menuControlBusy, setMenuControlBusy] = useState(false)
  const [menuControlError, setMenuControlError] = useState<string | null>(null)

  useEffect(() => {
    getGlobalMenuVisibility()
      .then(setMenusVisible)
      .catch((err) => setMenuControlError(err instanceof Error ? err.message : 'تعذّر تحميل حالة المنيوهات'))
  }, [])

  async function toggleAllMenus(nextVisible: boolean) {
    if (menuControlBusy || menusVisible === nextVisible) return
    if (!nextVisible) {
      const ok = window.confirm('إخفاء كل المنيوهات؟ العملاء هيشوفوا إن المنيو غير متاح لحد ما تظهرهم تاني من هنا.')
      if (!ok) return
    }

    setMenuControlBusy(true)
    setMenuControlError(null)
    try {
      await setGlobalMenuVisibility(nextVisible)
      setMenusVisible(nextVisible)
    } catch (err) {
      setMenuControlError(err instanceof Error ? err.message : 'تعذّر تغيير حالة المنيوهات')
    } finally {
      setMenuControlBusy(false)
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
              <p className="mt-2 max-w-2xl text-sm md:text-base text-white/60">العملاء والاشتراكات والكتالوج والصور من مكان واحد، بشكل أسرع وأوضح.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <QuickAction to="/admin/catalog" icon={ImagePlus} title="إدارة المنتجات والصور" subtitle="الكتالوج المعتمد" featured />
              <QuickAction to="/admin/clients/new" icon={Plus} title="إضافة عميل" subtitle="حساب جديد" />
              <QuickAction to="/restaurants" icon={Store} title="عرض المنيوهات" subtitle="المتاجر المنشورة" />
            </div>
          </div>

          <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-11 h-11 rounded-2xl flex items-center justify-center ${menusVisible === false ? 'bg-sumac/15 text-sumac' : 'bg-zaytoon/15 text-[#b8c99a]'}`}>
                  {menusVisible === null ? <LoaderCircle size={20} className="animate-spin" /> : menusVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                </div>
                <div>
                  <p className="text-xs text-white/45">تحكم عام في المنصة</p>
                  <h2 className="font-display text-lg font-bold mt-0.5">
                    {menusVisible === null ? 'جارِ تحميل حالة المنيوهات...' : menusVisible ? 'كل المنيوهات ظاهرة حاليًا' : 'كل المنيوهات مخفية حاليًا'}
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-5">الإخفاء العام بيوقف عرض صفحات المنيو للزوار فقط، من غير ما يغيّر حالة حسابات العملاء أو اشتراكاتهم.</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={menuControlBusy || menusVisible === true || menusVisible === null}
                  onClick={() => toggleAllMenus(true)}
                  className="rounded-xl bg-zaytoon text-white px-4 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-35"
                >
                  <Eye size={16} /> إظهار كل المنيوهات
                </button>
                <button
                  type="button"
                  disabled={menuControlBusy || menusVisible === false || menusVisible === null}
                  onClick={() => toggleAllMenus(false)}
                  className="rounded-xl bg-sumac text-white px-4 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-35"
                >
                  <EyeOff size={16} /> إخفاء كل المنيوهات
                </button>
              </div>
            </div>
            {menuControlError && <p className="mt-3 rounded-xl bg-sumac/10 border border-sumac/20 px-3 py-2 text-xs text-red-200">{menuControlError}</p>}
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
