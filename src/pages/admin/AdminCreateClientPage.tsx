import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, QrCode } from 'lucide-react'
import { createRestaurantByAdmin } from '@/services/restaurants'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function AdminCreateClientPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    clientName: '',
    clientContact: '',
    amountPaid: '',
    paymentNote: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('لازم تكتب اسم النشاط/المحل')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const restaurant = await createRestaurantByAdmin({
        name: form.name,
        clientName: form.clientName,
        clientContact: form.clientContact,
        amountPaid: Number(form.amountPaid) || 0,
        paymentNote: form.paymentNote,
      })
      // Straight to the QR page so you can print/share it immediately
      navigate(`/admin/clients/${restaurant.id}/qr`)
    } catch {
      setError('حصل خطأ، حاول تاني')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/admin" className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="font-display text-lg font-semibold flex items-center gap-2">
            <QrCode size={18} className="text-saffron-dim" />
            إنشاء QR جديد لعميل
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-stone text-sm mb-6">
          استخدم الفورم ده لو عميل جاي يطلب كود QR بسرعة وهو مش عايز يسجل بنفسه — هتعمله المطعم/المحل، تاخد منه الفلوس، وتطلعله الكود جاهز للطباعة فورًا.
        </p>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-paper border border-stone-light/30 p-6 flex flex-col gap-4">
          <Input
            label="اسم النشاط أو المحل"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثال: كافيه الأصدقاء"
          />
          <Input
            label="اسم العميل (اختياري)"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          />
          <Input
            label="رقم تواصل العميل (اختياري)"
            value={form.clientContact}
            onChange={(e) => setForm({ ...form, clientContact: e.target.value })}
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="المبلغ المدفوع (جنيه)"
              type="number"
              value={form.amountPaid}
              onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
              placeholder="0"
            />
            <Input
              label="طريقة الدفع (اختياري)"
              value={form.paymentNote}
              onChange={(e) => setForm({ ...form, paymentNote: e.target.value })}
              placeholder="كاش / فودافون كاش..."
            />
          </div>

          {error && <p className="text-sm text-sumac">{error}</p>}

          <Button type="submit" loading={saving} className="w-full mt-2">
            إنشاء وتوليد QR
          </Button>
        </form>
      </main>
    </div>
  )
}
