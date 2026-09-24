import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, QrCode } from 'lucide-react'
import { createRestaurantByAdmin } from '@/services/restaurants'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function AdminCreateClientPage() {
  const navigate = useNavigate()
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])
  const [form, setForm] = useState({
    name: '',
    businessType: 'restaurant',
    clientName: '',
    clientContact: '',
    amountPaid: '',
    paymentNote: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listBusinessTypes()
      .then((items) => {
        setBusinessTypes(items)
        if (items.length > 0 && !items.some((item) => item.code === form.businessType)) {
          setForm((current) => ({ ...current, businessType: items[0].code }))
        }
      })
      .catch(() => setError('تعذّر تحميل أنواع الأنشطة'))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('لازم تكتب اسم النشاط/المحل')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const selectedType = businessTypes.find((item) => item.code === form.businessType)
      const restaurant = await createRestaurantByAdmin({
        name: form.name,
        businessType: form.businessType,
        businessTypeName: selectedType?.name,
        clientName: form.clientName,
        clientContact: form.clientContact,
        amountPaid: Number(form.amountPaid) || 0,
        paymentNote: form.paymentNote,
      })
      navigate(`/admin/clients/${restaurant.id}/qr`)
    } catch {
      setError('حصل خطأ، حاول تاني')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-dim" dir="rtl">
      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/admin" className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="font-display text-lg font-semibold flex items-center gap-2">
            <QrCode size={18} className="text-saffron-dim" />
            إضافة محل يدويًا
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-stone text-sm mb-6">
          أضف أي محل أو نشاط من الإدارة بدون إنشاء حساب للمالك. اسم المحل فقط مطلوب، وباقي البيانات اختيارية. الكتالوج والـQR يتعملوا فورًا.
        </p>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-paper border border-stone-light/30 p-6 flex flex-col gap-4">
          <Input
            label="اسم النشاط أو المحل"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثال: موبايلي ستور"
          />

          <label className="text-sm font-medium text-ink">
            نوع النشاط
            <select
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-stone-light/50 bg-white px-3 py-3 outline-none focus:border-saffron"
            >
              {businessTypes.map((item) => (
                <option key={item.id} value={item.code}>{item.icon || '🏪'} {item.name}</option>
              ))}
            </select>
          </label>

          <Input
            label="اسم صاحب المحل (اختياري)"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          />
          <Input
            label="رقم تواصل / واتساب (اختياري)"
            value={form.clientContact}
            onChange={(e) => setForm({ ...form, clientContact: e.target.value })}
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="المبلغ المدفوع (اختياري)"
              type="number"
              value={form.amountPaid}
              onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
              placeholder="0"
            />
            <Input
              label="ملاحظة الدفع (اختياري)"
              value={form.paymentNote}
              onChange={(e) => setForm({ ...form, paymentNote: e.target.value })}
              placeholder="كاش / فودافون كاش..."
            />
          </div>

          {error && <p className="text-sm text-sumac">{error}</p>}

          <Button type="submit" loading={saving} className="w-full mt-2">
            إنشاء المحل وتوليد QR
          </Button>
        </form>
      </main>
    </div>
  )
}
