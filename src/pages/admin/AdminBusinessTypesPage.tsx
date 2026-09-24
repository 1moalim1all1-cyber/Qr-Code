import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, LoaderCircle, Pencil, Plus, RotateCcw, Tags, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  archiveBusinessType,
  createBusinessType,
  listBusinessTypes,
  restoreBusinessType,
  seedDefaultBusinessTypes,
  updateBusinessType,
  type BusinessTypeRecord,
} from '@/services/businessTypes'

export default function AdminBusinessTypesPage() {
  const [items, setItems] = useState<BusinessTypeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', icon: '🏪', description: '', sortOrder: '' })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const current = await listBusinessTypes({ includeInactive: true })
      if (current.length === 0) {
        setItems(await seedDefaultBusinessTypes())
      } else {
        // First admin visit persists any newly-added built-in defaults without touching existing records.
        await seedDefaultBusinessTypes()
        setItems(await listBusinessTypes({ includeInactive: true }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر تحميل أنواع الأنشطة')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createBusinessType({
        name: form.name,
        icon: form.icon,
        description: form.description,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
      })
      setForm({ name: '', icon: '🏪', description: '', sortOrder: '' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر إضافة نوع النشاط')
    } finally {
      setSaving(false)
    }
  }

  async function edit(item: BusinessTypeRecord) {
    const name = window.prompt('اسم نوع النشاط', item.name)
    if (name === null || !name.trim()) return
    const icon = window.prompt('الأيقونة أو الإيموجي', item.icon || '🏪')
    if (icon === null) return
    const description = window.prompt('وصف مختصر (اختياري)', item.description || '')
    if (description === null) return
    try {
      await updateBusinessType(item.id, { name: name.trim(), icon: icon.trim() || '🏪', description: description.trim() || null })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر تعديل النوع')
    }
  }

  async function toggle(item: BusinessTypeRecord) {
    const message = item.is_active
      ? `إخفاء «${item.name}» من الاختيارات؟\nالمحلات المرتبطة به لن تُحذف أو تتأثر.`
      : `إعادة تفعيل «${item.name}»؟`
    if (!window.confirm(message)) return
    try {
      if (item.is_active) await archiveBusinessType(item.id)
      else await restoreBusinessType(item.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر تحديث النوع')
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8]" dir="rtl">
      <header className="bg-[#10110f] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-5 flex items-center gap-4">
          <Link to="/admin" className="rounded-xl p-2 bg-white/5 hover:bg-white/10"><ArrowRight size={19} /></Link>
          <div>
            <p className="text-xs text-white/45">إعدادات المنصة</p>
            <h1 className="font-display text-xl font-bold flex items-center gap-2"><Tags size={20} className="text-saffron" /> أنواع الأنشطة</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-7">
        <div className="rounded-3xl bg-white border border-black/5 shadow-sm p-5 mb-6">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold">إضافة نوع نشاط جديد</h2>
            <p className="text-sm text-stone mt-1">بعد إضافته هيظهر تلقائيًا في اختيارات إضافة المحلات، من غير أي تعديل في الكود.</p>
          </div>
          <form onSubmit={submit} className="grid md:grid-cols-[1.2fr_.5fr_1.5fr_.5fr_auto] gap-3 items-end">
            <label className="text-sm font-medium">الاسم<input className="mt-1 w-full rounded-xl border border-stone-light/50 bg-paper px-3 py-2.5 outline-none focus:border-saffron" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: ساعات وإكسسوارات" /></label>
            <label className="text-sm font-medium">الأيقونة<input className="mt-1 w-full rounded-xl border border-stone-light/50 bg-paper px-3 py-2.5 text-center outline-none focus:border-saffron" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label>
            <label className="text-sm font-medium">وصف مختصر<input className="mt-1 w-full rounded-xl border border-stone-light/50 bg-paper px-3 py-2.5 outline-none focus:border-saffron" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="اختياري" /></label>
            <label className="text-sm font-medium">الترتيب<input type="number" className="mt-1 w-full rounded-xl border border-stone-light/50 bg-paper px-3 py-2.5 outline-none focus:border-saffron" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} placeholder="100" /></label>
            <button disabled={saving || !form.name.trim()} className="rounded-xl bg-[#171714] text-white px-4 py-2.5 font-bold flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <LoaderCircle size={17} className="animate-spin" /> : <Plus size={17} />} إضافة</button>
          </form>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

        <div className="rounded-3xl bg-white border border-black/5 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
            <div><h2 className="font-display font-bold">كل أنواع الأنشطة</h2><p className="text-xs text-stone mt-1">الحذف هنا آمن: النوع بيتوقف فقط، والمحلات القديمة تفضل شغالة.</p></div>
            <span className="rounded-full bg-paper-dim px-3 py-1 text-xs text-stone">{items.length} نوع</span>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center gap-2 text-stone"><LoaderCircle className="animate-spin" size={18} /> جارِ التحميل...</div>
          ) : (
            <div className="divide-y divide-black/5">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#f3ede3] flex items-center justify-center text-2xl shrink-0">{item.icon || '🏪'}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap"><p className="font-bold">{item.name}</p><span className={`text-[10px] rounded-full px-2 py-0.5 ${item.is_active ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{item.is_active ? 'مفعّل' : 'مخفي'}</span></div>
                    <p className="text-xs text-stone mt-1 truncate">{item.description || `الكود: ${item.code}`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => edit(item)} className="rounded-xl border border-black/10 p-2.5 hover:bg-paper-dim" title="تعديل"><Pencil size={16} /></button>
                    <button onClick={() => toggle(item)} className={`rounded-xl p-2.5 ${item.is_active ? 'border border-red-100 text-red-600 hover:bg-red-50' : 'border border-green-100 text-green-700 hover:bg-green-50'}`} title={item.is_active ? 'حذف/إخفاء' : 'استرجاع'}>{item.is_active ? <Trash2 size={16} /> : <RotateCcw size={16} />}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
