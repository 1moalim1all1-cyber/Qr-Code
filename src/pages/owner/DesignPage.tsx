import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Circle, Cuboid, Diamond, Hexagon, LayoutGrid, Moon, Sparkles, Square, Triangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurantByOwner, updateRestaurant } from '@/services/restaurants'
import type { MenuShape, MenuTemplate, Restaurant } from '@/types/database'

const TEMPLATES: { id: MenuTemplate; name: string; description: string; icon: typeof Cuboid }[] = [
  { id: 'three_d', name: '3D فاخر', description: 'بطاقات بارزة، عمق وظلال وحركة خفيفة — الشكل الأساسي', icon: Cuboid },
  { id: 'classic', name: 'كلاسيك', description: 'مرتب وواضح ومناسب لكل الأنشطة', icon: LayoutGrid },
  { id: 'minimal', name: 'مينيمال', description: 'أبيض ومساحات واسعة وتركيز على المنتجات', icon: Sparkles },
  { id: 'dark_luxe', name: 'دارك لوكس', description: 'غامق وفخم ومناسب للعطور والكافيهات', icon: Moon },
]

const SHAPES: { id: MenuShape; name: string; description: string; icon: typeof Square }[] = [
  { id: 'rounded', name: 'مدوّر ناعم', description: 'الأكثر راحة للعين ومناسب لأي نشاط', icon: Circle },
  { id: 'square', name: 'مربّع', description: 'زوايا مستقيمة وشكل منظم وقوي', icon: Square },
  { id: 'capsule', name: 'كبسولة', description: 'زوايا دائرية جدًا وشكل عصري', icon: Circle },
  { id: 'cut_corner', name: 'قصّات هندسية', description: 'زوايا مقصوصة بشكل مودرن', icon: Diamond },
  { id: 'hex', name: 'سداسي', description: 'شكل مختلف ومناسب للسوبر ماركت والمنتجات', icon: Hexagon },
  { id: 'triangle', name: 'مثلث مائل', description: 'حواف مائلة بطابع جريء مع الحفاظ على وضوح المحتوى', icon: Triangle },
]

function previewShape(shape: MenuShape) {
  if (shape === 'square') return 'rounded-none'
  if (shape === 'capsule') return 'rounded-[34px]'
  if (shape === 'cut_corner') return '[clip-path:polygon(16px_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%,0_16px)] rounded-none'
  if (shape === 'hex') return '[clip-path:polygon(14px_0,calc(100%-14px)_0,100%_50%,calc(100%-14px)_100%,14px_100%,0_50%)] rounded-none'
  if (shape === 'triangle') return '[clip-path:polygon(9%_0,100%_0,91%_100%,0_100%)] rounded-none'
  return 'rounded-2xl'
}

export default function DesignPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [template, setTemplate] = useState<MenuTemplate>('three_d')
  const [shape, setShape] = useState<MenuShape>('rounded')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    getRestaurantByOwner(user.uid).then((r) => {
      if (r) {
        setRestaurant(r)
        setTemplate(r.menu_template || 'three_d')
        setShape(r.menu_shape || 'rounded')
      }
    })
  }, [user])

  async function save() {
    if (!restaurant) return
    setSaving(true)
    setSaved(false)
    try {
      await updateRestaurant(restaurant.id, { menu_template: template, menu_shape: shape })
      setSaved(true)
      setRestaurant({ ...restaurant, menu_template: template, menu_shape: shape })
    } finally {
      setSaving(false)
    }
  }

  if (!restaurant) return <div className="min-h-screen flex items-center justify-center bg-paper">جارِ التحميل...</div>

  return (
    <div className="min-h-screen bg-paper-dim" dir="rtl">
      <header className="bg-paper border-b border-stone-light/30">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="text-stone"><ArrowRight size={20} /></Link>
          <div>
            <h1 className="font-display text-lg font-semibold">شكل صفحة نشاطك</h1>
            <p className="text-xs text-stone">غيّر القالب والشكل الهندسي من غير ما تفقد المنتجات أو الأسعار</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-[1fr_420px] gap-7">
          <section className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">1) اختار القالب</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {TEMPLATES.map((item) => {
                  const active = template === item.id
                  const Icon = item.icon
                  return (
                    <button key={item.id} onClick={() => setTemplate(item.id)} className={`text-right rounded-3xl border p-5 transition-all ${active ? 'border-saffron bg-paper shadow-xl -translate-y-1' : 'border-stone-light/30 bg-paper hover:-translate-y-0.5'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-ink text-saffron flex items-center justify-center shadow-lg"><Icon size={23} /></div>
                        {active && <span className="w-7 h-7 rounded-full bg-zaytoon text-paper flex items-center justify-center"><Check size={15} /></span>}
                      </div>
                      <h3 className="font-display text-lg font-semibold mt-4">{item.name}</h3>
                      <p className="text-sm text-stone mt-1 leading-6">{item.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold mb-2">2) اختار شكل كروت المنيو</h2>
              <p className="text-sm text-stone mb-4">المثلث الكامل بيضيّق مساحة الكلام، فعملته بشكل مائل يحافظ على الاسم والسعر واضحين.</p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {SHAPES.map((item) => {
                  const active = shape === item.id
                  const Icon = item.icon
                  return (
                    <button key={item.id} onClick={() => setShape(item.id)} className={`text-right border bg-paper p-4 transition-all ${previewShape(item.id)} ${active ? 'border-saffron shadow-lg -translate-y-1' : 'border-stone-light/30 hover:-translate-y-0.5'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <Icon size={24} className="text-saffron-dim" />
                        {active && <span className="w-6 h-6 rounded-full bg-zaytoon text-paper flex items-center justify-center"><Check size={13} /></span>}
                      </div>
                      <h3 className="font-semibold mt-3">{item.name}</h3>
                      <p className="text-xs text-stone mt-1 leading-5">{item.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-zaytoon text-paper py-3.5 font-semibold disabled:opacity-50">
              {saving ? 'جارِ الحفظ...' : saved ? 'تم حفظ الشكل ✓' : 'حفظ القالب والشكل'}
            </button>
          </section>

          <aside className="lg:sticky lg:top-6 h-fit">
            <p className="text-sm font-medium mb-3">معاينة سريعة</p>
            <div className={`overflow-hidden min-h-[650px] ${template === 'three_d' ? 'rounded-[34px] bg-[#131411] text-white shadow-[0_35px_80px_rgba(0,0,0,.3)] border border-white/10' : template === 'dark_luxe' ? 'rounded-3xl bg-black text-white border border-amber-500/20' : template === 'minimal' ? 'rounded-2xl bg-white text-black border' : 'rounded-3xl bg-[#f7f0e4] text-[#241d16] border'}`}>
              <div className={`h-32 ${template === 'three_d' ? 'bg-gradient-to-br from-[#725b2d] via-[#29271e] to-black' : template === 'dark_luxe' ? 'bg-gradient-to-r from-black to-[#2b2318]' : 'bg-stone-light/50'}`} />
              <div className="px-5 -mt-9 relative">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-bold ${template === 'three_d' ? 'bg-gradient-to-br from-white to-stone-300 text-black shadow-[0_15px_30px_rgba(0,0,0,.45)] rotate-[-3deg]' : 'bg-paper border shadow'}`}>{restaurant.name.charAt(0)}</div>
                <h3 className="font-display text-xl font-bold mt-4">{restaurant.name}</h3>
                <p className="text-sm opacity-60 mt-1">معاينة القالب + شكل الكارت</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {['الأكثر طلبًا', 'العروض', 'منتج جديد', 'الأقسام'].map((x, i) => (
                    <div key={x} className={`p-4 ${previewShape(shape)} ${template === 'three_d' ? 'bg-white/7 border border-white/10 shadow-[0_12px_25px_rgba(0,0,0,.25)]' : 'bg-black/5 border border-black/10'}`} style={template === 'three_d' ? { transform: `perspective(500px) rotateY(${i % 2 ? -2 : 2}deg)` } : undefined}>
                      <div className={`w-full h-20 bg-gradient-to-br from-saffron/30 to-zaytoon/20 mb-3 ${shape === 'square' ? 'rounded-none' : shape === 'capsule' ? 'rounded-[28px]' : 'rounded-xl'}`} />
                      <p className="font-semibold text-sm">{x}</p>
                      <p className="text-xs opacity-60 mt-1">شكل المنتج والسعر</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
