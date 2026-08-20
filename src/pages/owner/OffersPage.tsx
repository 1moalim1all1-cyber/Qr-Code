import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Plus, Trash2, Percent, Tag, Gift } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'
import { getRestaurantByOwner, getRestaurantById } from '@/services/restaurants'
import { listOffers, createOffer, toggleOfferActive, deleteOffer, type OfferInput } from '@/services/offers'
import { listCoupons, createCoupon, toggleCouponActive, deleteCoupon, type Coupon } from '@/services/coupons'
import ImageUpload from '@/components/ui/ImageUpload'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Offer, Restaurant } from '@/types/database'

interface OffersPageProps {
  restaurantIdOverride?: string
  backTo?: string
}

export default function OffersPage({ restaurantIdOverride, backTo = '/dashboard' }: OffersPageProps) {
  const { user } = useAuth()
  const params = useParams<{ id?: string }>()
  const adminRestaurantId = restaurantIdOverride ?? params.id
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [tab, setTab] = useState<'offers' | 'coupons'>('offers')
  const [offers, setOffers] = useState<Offer[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [error, setError] = useState<string | null>(null)

  function loadAll(restaurantId: string) {
    listOffers(restaurantId).then(setOffers).catch((err) => setError(err.message))
    listCoupons(restaurantId).then(setCoupons).catch((err) => setError(err.message))
  }

  useEffect(() => {
    const fetcher = adminRestaurantId ? getRestaurantById(adminRestaurantId) : user ? getRestaurantByOwner(user.uid) : null
    if (!fetcher) return
    fetcher
      .then((r) => {
        setRestaurant(r)
        if (r) loadAll(r.id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, adminRestaurantId])

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center px-6 gap-3">
        {error ? <p className="text-sumac font-medium max-w-sm">{error}</p> : <p className="text-stone">جارِ التحميل...</p>}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to={backTo} className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="font-display text-lg font-semibold">العروض والكوبونات</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex rounded-full bg-paper-dim p-1 mb-6 max-w-xs">
          <button
            onClick={() => setTab('offers')}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${tab === 'offers' ? 'bg-paper shadow-sm' : 'text-stone'}`}
          >
            العروض
          </button>
          <button
            onClick={() => setTab('coupons')}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${tab === 'coupons' ? 'bg-paper shadow-sm' : 'text-stone'}`}
          >
            الكوبونات
          </button>
        </div>

        {error && <div className="rounded-xl bg-sumac/10 text-sumac text-sm px-4 py-3 mb-4">{error}</div>}

        {tab === 'offers' ? (
          <OffersTab restaurant={restaurant} offers={offers} onChanged={() => loadAll(restaurant.id)} />
        ) : (
          <CouponsTab restaurant={restaurant} coupons={coupons} onChanged={() => loadAll(restaurant.id)} />
        )}
      </main>
    </div>
  )
}

function OffersTab({ restaurant, offers, onChanged }: { restaurant: Restaurant; offers: Offer[]; onChanged: () => void }) {
  const [formOpen, setFormOpen] = useState(false)
  const [titleAr, setTitleAr] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titleAr.trim()) {
      setError('اكتب عنوان العرض')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const input: OfferInput = {
        titleAr: titleAr.trim(),
        descriptionAr: descriptionAr.trim(),
        imageUrl,
        discountPercent: discountPercent ? Number(discountPercent) : null,
      }
      await createOffer(restaurant.id, auth.currentUser?.uid ?? restaurant.owner_id, input)
      setTitleAr('')
      setDescriptionAr('')
      setDiscountPercent('')
      setImageUrl(null)
      setFormOpen(false)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setFormOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-saffron text-ink px-5 py-2.5 text-sm font-semibold mb-5"
      >
        <Plus size={16} /> عرض جديد
      </button>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-paper border border-stone-light/30 p-5 mb-5 flex flex-col gap-3">
          <ImageUpload label="صورة العرض" value={imageUrl} onChange={setImageUrl} folder={`restaurants/${restaurant.id}/offers`} aspect="wide" />
          <Input label="عنوان العرض" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="خصم 20% على البيتزا" />
          <Input label="تفاصيل (اختياري)" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} />
          <Input label="نسبة الخصم % (اختياري)" type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
          {error && <p className="text-sm text-sumac">{error}</p>}
          <Button type="submit" loading={submitting} className="w-full mt-1">
            حفظ العرض
          </Button>
        </form>
      )}

      {offers.length === 0 ? (
        <p className="text-center text-stone py-10">مفيش عروض لسه.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {offers.map((o) => (
            <div key={o.id} className="rounded-2xl bg-paper border border-stone-light/30 overflow-hidden">
              {o.image_url && <img src={o.image_url} alt="" className="w-full h-28 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium flex items-center gap-1.5">
                    <Gift size={14} className="text-saffron-dim" />
                    {o.title.ar}
                  </p>
                  <button onClick={() => deleteOffer(restaurant.id, o.id).then(onChanged)} className="text-stone hover:text-sumac">
                    <Trash2 size={14} />
                  </button>
                </div>
                {o.description?.ar && <p className="text-xs text-stone mb-2">{o.description.ar}</p>}
                <button
                  onClick={() => toggleOfferActive(restaurant.id, o.id, !o.is_active).then(onChanged)}
                  className={`text-xs rounded-full px-2.5 py-1 font-medium ${o.is_active ? 'bg-zaytoon/15 text-zaytoon' : 'bg-stone-light/30 text-stone'}`}
                >
                  {o.is_active ? 'فعّال' : 'متوقف'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CouponsTab({ restaurant, coupons, onChanged }: { restaurant: Restaurant; coupons: Coupon[]; onChanged: () => void }) {
  const [formOpen, setFormOpen] = useState(false)
  const [code, setCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState('10')
  const [maxUses, setMaxUses] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) {
      setError('اكتب كود الكوبون')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createCoupon(restaurant.id, auth.currentUser?.uid ?? restaurant.owner_id, {
        code: code.trim(),
        discountPercent: Number(discountPercent) || 0,
        maxUses: maxUses ? Number(maxUses) : null,
      })
      setCode('')
      setDiscountPercent('10')
      setMaxUses('')
      setFormOpen(false)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setFormOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-saffron text-ink px-5 py-2.5 text-sm font-semibold mb-5"
      >
        <Plus size={16} /> كوبون جديد
      </button>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-paper border border-stone-light/30 p-5 mb-5 flex flex-col gap-3">
          <Input label="الكود" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" dir="ltr" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="نسبة الخصم %" type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
            <Input label="أقصى عدد استخدام (اختياري)" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
          </div>
          {error && <p className="text-sm text-sumac">{error}</p>}
          <Button type="submit" loading={submitting} className="w-full mt-1">
            حفظ الكوبون
          </Button>
        </form>
      )}

      {coupons.length === 0 ? (
        <p className="text-center text-stone py-10">مفيش كوبونات لسه.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl bg-paper border border-stone-light/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Tag size={16} className="text-saffron-dim" />
                <div>
                  <p className="font-mono font-medium text-sm">{c.code}</p>
                  <p className="text-xs text-stone flex items-center gap-1">
                    <Percent size={10} /> {c.discount_percent}% {c.max_uses ? `· حد أقصى ${c.max_uses} استخدام` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCouponActive(restaurant.id, c.id, !c.is_active).then(onChanged)}
                  className={`text-xs rounded-full px-2.5 py-1 font-medium ${c.is_active ? 'bg-zaytoon/15 text-zaytoon' : 'bg-stone-light/30 text-stone'}`}
                >
                  {c.is_active ? 'فعّال' : 'متوقف'}
                </button>
                <button onClick={() => deleteCoupon(restaurant.id, c.id).then(onChanged)} className="text-stone hover:text-sumac">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
