import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Circle, Crown, Cuboid, Diamond, Hexagon, LayoutGrid, Moon, Sparkles, Square, Triangle, Waves } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurantByOwner, updateRestaurant } from '@/services/restaurants'
import type { MenuShape, MenuTemplate, Restaurant } from '@/types/database'

const TEMPLATES: { id: MenuTemplate; name: string; description: string; icon: typeof Cuboid; recommended?: boolean }[] = [
  { id: 'three_d', name: '3D فاخر', description: 'صور كبيرة وكروت بارزة وعمق واضح — أفضل شكل للعرض', icon: Cuboid, recommended: true },
  { id: 'classic', name: 'كلاسيك', description: 'مرتب وسهل القراءة ومناسب للمطاعم التقليدية', icon: LayoutGrid },
  { id: 'minimal', name: 'متجر عصري', description: 'خلفية فاتحة وتركيز قوي على صورة المنتج والسعر', icon: Sparkles },
  { id: 'dark_luxe', name: 'دارك لوكس', description: 'أسود وذهبي وفخم جدًا للعطور والكافيهات والبراندات', icon: Moon },
]

const SHAPES: { id: MenuShape; name: string; description: string; icon: typeof Square; recommended?: boolean }[] = [
  { id: 'rounded', name: 'مدوّر ناعم', description: 'أفضل اختيار عام؛ واضح ومريح على الموبايل', icon: Circle, recommended: true },
  { id: 'square', name: 'مربّع', description: 'منظم وقوي ومناسب للكتالوجات', icon: Square },
  { id: 'capsule', name: 'كبسولة', description: 'مودرن وزواياه ناعمة جدًا', icon: Circle },
  { id: 'cut_corner', name: 'قصّات هندسية', description: 'شكل مودرن ومميز للمنتجات', icon: Diamond },
  { id: 'hex', name: 'سداسي', description: 'مختلف ومناسب للسوبر ماركت', icon: Hexagon },
  { id: 'triangle', name: 'مثلث مائل', description: 'جريء من غير ما يضيّق مساحة المحتوى', icon: Triangle },
  { id: 'diamond', name: 'ماسي', description: 'حواف ماسية خفيفة وفخمة', icon: Diamond },
  { id: 'arch', name: 'قوس', description: 'مناسب للعطور ومستحضرات التجميل', icon: Circle },
  { id: 'wave', name: 'موجة', description: 'شكل بصري مختلف وحيوي', icon: Waves },
]

function previewShape(shape: MenuShape) {
  if (shape === 'square') return 'rounded-none'
  if (shape === 'capsule') return 'rounded-[34px]'
  if (shape === 'cut_corner') return '[clip-path:polygon(16px_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%,0_16px)] rounded-none'
  if (shape === 'hex') return '[clip-path:polygon(14px_0,calc(100%-14px)_0,100%_50%,calc(100%-14px)_100%,14px_100%,0_50%)] rounded-none'
  if (shape === 'triangle') return '[clip-path:polygon(9%_0,100%_0,91%_100%,0_100%)] rounded-none'
  if (shape === 'diamond') return '[clip-path:polygon(7%_0,93%_0,100%_50%,93%_100%,7%_100%,0_50%)] rounded-none'
  if (shape === 'arch') return 'rounded-t-[42px] rounded-b-2xl'
  if (shape === 'wave') return '[clip-path:polygon(0_8%,18%_0,42%_6%,65%_0,100%_8%,100%_92%,78%_100%,55%_94%,30%_100%,0_92%)] rounded-none'
  return 'rounded-2xl'
}

function TemplatePreview({ id }: { id: MenuTemplate }) {
  const dark = id === 'three_d' || id === 'dark_luxe'
  return (
    <div className={`h-32 rounded-2xl overflow-hidden border ${dark ? 'bg-[#11110f] border-white/10' : id === 'classic' ? 'bg-[#f4eadc] border-[#d8c7aa]' : 'bg-white border-stone-light/40'}`}>
      <div className={`h-8 ${id === 'three_d' ? 'bg-gradient-to-r from-[#7a6333] to-[#171712]' : id === 'dark_luxe' ? 'bg-gradient-to-r from-black to-[#2a1d0c]' : id === 'classic' ? 'bg-[#d3c2a4]' : 'bg-stone-light/20'}`} />
      <div className="p-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${id === 'three_d' ? 'bg-white/8 shadow-lg' : id === 'dark_luxe' ? 'bg-white/5 border border-amber-500/15' : 'bg-black/5'} rounded-xl p-2`}>
            <div className={`${dark ? 'bg-white/10' : 'bg-black/10'} h-8 rounded-lg mb-2`} />
            <div className={`${dark ? 'bg-white/20' : 'bg-black/20'} h-1.5 rounded-full w-4/5`} />
            <div className={`${dark ? 'bg-saffron/40' : 'bg-zaytoon/25'} h-1.5 rounded-full w-1/2 mt-1.5`} />
          </div>
        ))}
      </div>
    </div>
  )
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

  function applyPreset(nextTemplate: MenuTemplate, nextShape: MenuShape) {
    setTemplate(nextTemplate)
    setShape(nextShape)
    setSaved(false)
  }

  if (!restaurant) return <div className="min-h-screen flex items-center justify-center bg-paper">جارِ التحميل...</div>

  return (
    <div className="min-h-screen bg-[#f7f1e8]" dir="rtl">
      <header className="bg-[#10110f] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 py-5 flex items-center gap-4">
          <Link to="/dashboard" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><ArrowRight size={20} /></Link>
          <div>
            <h1 className="font-display text-xl font-semibold">اختار شكل المنيو</h1>
            <p className="text-xs text-white/50 mt-1">اختار التصميم والشكل، وشوف المعاينة قبل الحفظ</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">
        <section className="rounded-[30px] bg-[#11110f] text-white p-5 md:p-7 mb-8 overflow-hidden relative">
          <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-saffron/15 blur-3xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-saffron text-ink px-3 py-1.5 text-xs font-bold"><Crown size={14} /> أفضل اختيار</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mt-4">3D فاخر + مدوّر ناعم</h2>
              <p className="text-white/55 text-sm mt-2 max-w-xl">ده الشكل اللي اخترته كأفضل منيو عام: صور المنتج واضحة، الكارت بارز، والسعر وزر الإضافة باينين بسرعة على الموبايل.</p>
            </div>
            <button onClick={() => applyPreset('three_d', 'rounded')} className="rounded-2xl bg-saffron text-ink px-6 py-3 font-bold shrink-0">استخدم أفضل شكل</button>
          </div>
        </section>

        <div className="grid xl:grid-cols-[1fr_430px] gap-8">
          <section className="space-y-9">
            <div>
              <div className="flex items-end justify-between gap-3 mb-4"><div><p className="text-xs text-stone">الخطوة 1</p><h2 className="font-display text-2xl font-semibold">اختار تصميم المنيو</h2></div></div>
              <div className="grid sm:grid-cols-2 gap-4">
                {TEMPLATES.map((item) => {
                  const active = template === item.id
                  const Icon = item.icon
                  return (
                    <button key={item.id} onClick={() => { setTemplate(item.id); setSaved(false) }} className={`text-right rounded-[26px] border p-4 transition-all bg-paper ${active ? 'border-saffron shadow-xl -translate-y-1 ring-2 ring-saffron/15' : 'border-stone-light/30 hover:-translate-y-0.5'}`}>
                      <TemplatePreview id={item.id} />
                      <div className="flex items-start justify-between gap-3 mt-4">
                        <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-ink text-saffron flex items-center justify-center"><Icon size={20} /></div><div><div className="flex items-center gap-2"><h3 className="font-display font-semibold">{item.name}</h3>{item.recommended && <span className="rounded-full bg-saffron/15 text-saffron-dim px-2 py-0.5 text-[10px] font-bold">موصى به</span>}</div><p className="text-xs text-stone mt-1 leading-5">{item.description}</p></div></div>
                        {active && <span className="w-7 h-7 rounded-full bg-zaytoon text-paper flex items-center justify-center shrink-0"><Check size={15} /></span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-stone">الخطوة 2</p>
              <h2 className="font-display text-2xl font-semibold mb-2">اختار شكل كارت المنتج</h2>
              <p className="text-sm text-stone mb-4">الأشكال المختلفة بتدي هوية للمنيو، لكن المدور الناعم أو المربع هما أوضح اختيار للمنتجات الكتير.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHAPES.map((item) => {
                  const active = shape === item.id
                  const Icon = item.icon
                  return (
                    <button key={item.id} onClick={() => { setShape(item.id); setSaved(false) }} className={`text-right border bg-paper p-4 min-h-32 transition-all ${previewShape(item.id)} ${active ? 'border-saffron shadow-lg -translate-y-1 ring-2 ring-saffron/15' : 'border-stone-light/30 hover:-translate-y-0.5'}`}>
                      <div className="flex items-center justify-between gap-3"><Icon size={23} className="text-saffron-dim" />{active && <span className="w-6 h-6 rounded-full bg-zaytoon text-paper flex items-center justify-center"><Check size={13} /></span>}</div>
                      <div className="flex items-center gap-2 mt-3"><h3 className="font-semibold">{item.name}</h3>{item.recommended && <span className="text-[9px] rounded-full bg-zaytoon/10 text-zaytoon px-2 py-0.5">أفضل وضوح</span>}</div>
                      <p className="text-xs text-stone mt-1 leading-5">{item.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold mb-3">اختيارات جاهزة حسب النشاط</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <button onClick={() => applyPreset('three_d', 'rounded')} className="rounded-2xl bg-paper border border-stone-light/30 p-4 text-right"><p className="font-semibold">مطعم / كافيه</p><p className="text-xs text-stone mt-1">3D فاخر + مدور</p></button>
                <button onClick={() => applyPreset('minimal', 'square')} className="rounded-2xl bg-paper border border-stone-light/30 p-4 text-right"><p className="font-semibold">سوبر ماركت</p><p className="text-xs text-stone mt-1">متجر عصري + مربع</p></button>
                <button onClick={() => applyPreset('dark_luxe', 'arch')} className="rounded-2xl bg-paper border border-stone-light/30 p-4 text-right"><p className="font-semibold">تجميل / عطور</p><p className="text-xs text-stone mt-1">دارك لوكس + قوس</p></button>
              </div>
            </div>

            <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-zaytoon text-paper py-4 font-bold text-base shadow-lg disabled:opacity-50">
              {saving ? 'جارِ الحفظ...' : saved ? 'تم حفظ الشكل ✓' : 'حفظ التصميم والشكل'}
            </button>
          </section>

          <aside className="xl:sticky xl:top-6 h-fit">
            <div className="flex items-center justify-between mb-3"><p className="font-semibold">معاينة المنيو</p><span className="text-xs text-stone">بتتغير فورًا</span></div>
            <div className={`overflow-hidden min-h-[690px] ${template === 'three_d' ? 'rounded-[36px] bg-[#11110f] text-white shadow-[0_35px_80px_rgba(0,0,0,.28)] border border-white/10' : template === 'dark_luxe' ? 'rounded-3xl bg-black text-white border border-amber-500/20 shadow-2xl' : template === 'minimal' ? 'rounded-3xl bg-white text-black border shadow-xl' : 'rounded-3xl bg-[#f7f0e4] text-[#241d16] border shadow-xl'}`}>
              <div className={`h-36 ${template === 'three_d' ? 'bg-gradient-to-br from-[#7b6537] via-[#2a281e] to-black' : template === 'dark_luxe' ? 'bg-gradient-to-r from-black via-[#281c0c] to-black' : template === 'classic' ? 'bg-[#cdbc9d]' : 'bg-stone-light/30'}`} />
              <div className="px-5 -mt-9 relative">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-bold ${template === 'three_d' ? 'bg-gradient-to-br from-white to-stone-300 text-black shadow-[0_15px_30px_rgba(0,0,0,.45)] rotate-[-3deg]' : 'bg-paper border shadow'}`}>{restaurant.name.charAt(0)}</div>
                <h3 className="font-display text-xl font-bold mt-4">{restaurant.name}</h3>
                <p className="text-sm opacity-55 mt-1">منيو إلكتروني</p>
                <div className="mt-4 h-10 rounded-full border border-current/10 bg-current/5" />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {['منتج مميز', 'عرض اليوم', 'الأكثر طلبًا', 'منتج جديد'].map((x, i) => (
                    <div key={x} className={`overflow-hidden ${previewShape(shape)} ${template === 'three_d' ? 'bg-white/7 border border-white/10 shadow-[0_12px_25px_rgba(0,0,0,.25)]' : 'bg-black/5 border border-black/10'}`} style={template === 'three_d' ? { transform: `perspective(500px) rotateY(${i % 2 ? -1.7 : 1.7}deg)` } : undefined}>
                      <div className="h-28 bg-gradient-to-br from-saffron/35 via-zaytoon/15 to-black/10" />
                      <div className="p-3"><p className="font-semibold text-sm">{x}</p><div className="flex justify-between items-center mt-2"><span className="text-xs opacity-55">وصف المنتج</span><span className="text-sm font-bold">75 ج</span></div></div>
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
