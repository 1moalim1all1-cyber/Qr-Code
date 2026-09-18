import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Cuboid, LayoutGrid, Moon, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurantByOwner, updateRestaurant } from '@/services/restaurants'
import type { MenuTemplate, Restaurant } from '@/types/database'

const TEMPLATES: { id: MenuTemplate; name: string; description: string; icon: typeof Cuboid }[] = [
  { id: 'three_d', name: '3D فاخر', description: 'بطاقات بارزة، عمق وظلال وحركة خفيفة — الشكل الأساسي', icon: Cuboid },
  { id: 'classic', name: 'كلاسيك', description: 'مرتب وواضح ومناسب لكل الأنشطة', icon: LayoutGrid },
  { id: 'minimal', name: 'مينيمال', description: 'أبيض ومساحات واسعة وتركيز على المنتجات', icon: Sparkles },
  { id: 'dark_luxe', name: 'دارك لوكس', description: 'غامق وفخم ومناسب للعطور والكافيهات', icon: Moon },
]

export default function DesignPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [template, setTemplate] = useState<MenuTemplate>('three_d')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    getRestaurantByOwner(user.uid).then((r) => { if (r) { setRestaurant(r); setTemplate(r.menu_template || 'three_d') } })
  }, [user])

  async function save() {
    if (!restaurant) return
    setSaving(true); setSaved(false)
    try {
      await updateRestaurant(restaurant.id, { menu_template: template })
      setSaved(true)
      setRestaurant({ ...restaurant, menu_template: template })
    } finally { setSaving(false) }
  }

  if (!restaurant) return <div className="min-h-screen flex items-center justify-center bg-paper">جارِ التحميل...</div>

  return (
    <div className="min-h-screen bg-paper-dim" dir="rtl">
      <header className="bg-paper border-b border-stone-light/30"><div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-4"><Link to="/dashboard" className="text-stone"><ArrowRight size={20} /></Link><div><h1 className="font-display text-lg font-semibold">شكل صفحة نشاطك</h1><p className="text-xs text-stone">تقدر تغيّر القالب في أي وقت من غير ما تفقد المنتجات</p></div></div></header>
      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-[1fr_420px] gap-7">
          <section>
            <div className="grid sm:grid-cols-2 gap-4">
              {TEMPLATES.map((item) => {
                const active = template === item.id
                const Icon = item.icon
                return <button key={item.id} onClick={() => setTemplate(item.id)} className={`text-right rounded-3xl border p-5 transition-all ${active ? 'border-saffron bg-paper shadow-xl -translate-y-1' : 'border-stone-light/30 bg-paper hover:-translate-y-0.5'}`}>
                  <div className="flex items-start justify-between gap-3"><div className="w-12 h-12 rounded-2xl bg-ink text-saffron flex items-center justify-center shadow-lg"><Icon size={23} /></div>{active && <span className="w-7 h-7 rounded-full bg-zaytoon text-paper flex items-center justify-center"><Check size={15} /></span>}</div>
                  <h2 className="font-display text-lg font-semibold mt-4">{item.name}</h2><p className="text-sm text-stone mt-1 leading-6">{item.description}</p>
                </button>
              })}
            </div>
            <button onClick={save} disabled={saving} className="mt-5 w-full rounded-2xl bg-zaytoon text-paper py-3.5 font-semibold disabled:opacity-50">{saving ? 'جارِ الحفظ...' : saved ? 'تم حفظ الشكل ✓' : 'حفظ الشكل المختار'}</button>
          </section>

          <aside className="lg:sticky lg:top-6 h-fit">
            <p className="text-sm font-medium mb-3">معاينة سريعة</p>
            <div className={`overflow-hidden min-h-[650px] ${template === 'three_d' ? 'rounded-[34px] bg-[#131411] text-white shadow-[0_35px_80px_rgba(0,0,0,.3)] border border-white/10' : template === 'dark_luxe' ? 'rounded-3xl bg-black text-white border border-amber-500/20' : template === 'minimal' ? 'rounded-2xl bg-white text-black border' : 'rounded-3xl bg-[#f7f0e4] text-[#241d16] border'}`}>
              <div className={`h-32 ${template === 'three_d' ? 'bg-gradient-to-br from-[#725b2d] via-[#29271e] to-black' : template === 'dark_luxe' ? 'bg-gradient-to-r from-black to-[#2b2318]' : 'bg-stone-light/50'}`} />
              <div className="px-5 -mt-9 relative"><div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-bold ${template === 'three_d' ? 'bg-gradient-to-br from-white to-stone-300 text-black shadow-[0_15px_30px_rgba(0,0,0,.45)] rotate-[-3deg]' : 'bg-paper border shadow'}`}>{restaurant.name.charAt(0)}</div><h3 className="font-display text-xl font-bold mt-4">{restaurant.name}</h3><p className="text-sm opacity-60 mt-1">واجهة تجريبية للقالب المختار</p>
                <div className="mt-5 grid grid-cols-2 gap-3">{['الأكثر طلبًا','العروض','منتج جديد','الأقسام'].map((x, i) => <div key={x} className={`p-4 rounded-2xl ${template === 'three_d' ? 'bg-white/7 border border-white/10 shadow-[0_12px_25px_rgba(0,0,0,.25)]' : 'bg-black/5 border border-black/10'}`} style={template === 'three_d' ? { transform: `perspective(500px) rotateY(${i % 2 ? -2 : 2}deg)` } : undefined}><div className="w-full h-20 rounded-xl bg-gradient-to-br from-saffron/30 to-zaytoon/20 mb-3" /><p className="font-semibold text-sm">{x}</p><p className="text-xs opacity-60 mt-1">شكل المنتج والسعر</p></div>)}</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
