import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurantByOwner, updateRestaurant } from '@/services/restaurants'
import type { Restaurant } from '@/types/database'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ui/ImageUpload'

export default function SettingsPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    google_maps_url: '',
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getRestaurantByOwner(user.uid)
      .then((r) => {
        if (!r) return
        setRestaurant(r)
        setForm({
          name: r.name ?? '',
          description: r.description ?? '',
          phone: r.phone ?? '',
          whatsapp: r.whatsapp ?? '',
          email: r.email ?? '',
          website: r.website ?? '',
          address: r.address ?? '',
          google_maps_url: r.google_maps_url ?? '',
        })
        setLogoUrl(r.logo_url ?? null)
        setCoverUrl(r.cover_url ?? null)
        setIsOpen(r.is_open)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني'))
  }, [user])

  async function handleSave() {
    if (!restaurant) return
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await updateRestaurant(restaurant.id, {
        ...form,
        logo_url: logoUrl,
        cover_url: coverUrl,
        is_open: isOpen,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    } finally {
      setSaving(false)
    }
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center px-6 gap-3">
        {error ? (
          <p className="text-sumac font-medium max-w-sm">{error}</p>
        ) : (
          <p className="text-stone">جارِ التحميل...</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="font-display text-lg font-semibold">بيانات المطعم</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="rounded-2xl bg-paper border border-stone-light/30 p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <ImageUpload
              label="اللوجو"
              value={logoUrl}
              onChange={setLogoUrl}
              folder={`restaurants/${restaurant.id}`}
              aspect="square"
            />
            <div className="flex-1">
              <ImageUpload
                label="صورة الغلاف"
                value={coverUrl}
                onChange={setCoverUrl}
                folder={`restaurants/${restaurant.id}`}
                aspect="wide"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="اسم المطعم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input
              label="واتساب"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="201234567890"
            />
            <Input label="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="الموقع الإلكتروني" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <Input
              label="رابط Google Maps"
              value={form.google_maps_url}
              onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
            />
            <Input label="العنوان" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Input
              label="الوصف"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-stone-light/30">
            <div>
              <p className="text-sm font-medium">حالة المطعم</p>
              <p className="text-xs text-stone">اللي هيظهر للعميل في صفحة المنيو</p>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isOpen ? 'bg-zaytoon/15 text-zaytoon' : 'bg-sumac/15 text-sumac'
              }`}
            >
              {isOpen ? 'مفتوح الآن' : 'مغلق حاليًا'}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-sumac mb-3">{error}</p>}

        <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
          {saved ? (
            <>
              <Check size={16} /> اتحفظ
            </>
          ) : (
            'حفظ التعديلات'
          )}
        </Button>
      </main>
    </div>
  )
}
