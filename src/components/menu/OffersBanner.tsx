import { useEffect, useState } from 'react'
import { Gift } from 'lucide-react'
import { listOffers } from '@/services/offers'
import type { Offer } from '@/types/database'

export default function OffersBanner({ restaurantId }: { restaurantId: string }) {
  const [offers, setOffers] = useState<Offer[]>([])

  useEffect(() => {
    listOffers(restaurantId)
      .then((all) => setOffers(all.filter((o) => o.is_active)))
      .catch(() => setOffers([]))
  }, [restaurantId])

  if (offers.length === 0) return null

  return (
    <div className="flex gap-3 overflow-x-auto mb-5 -mx-5 px-5 pb-1">
      {offers.map((o) => (
        <div
          key={o.id}
          className="shrink-0 w-64 rounded-2xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, var(--color-paprika), var(--color-sumac))' }}
        >
          {o.image_url && <img src={o.image_url} alt="" className="w-full h-20 object-cover opacity-90" />}
          <div className="p-3 text-paper">
            <p className="font-display font-semibold text-sm flex items-center gap-1.5">
              <Gift size={13} />
              {o.title.ar}
            </p>
            {o.discount_percent ? (
              <p className="text-xs opacity-90 mt-0.5">خصم {o.discount_percent}%</p>
            ) : (
              o.description?.ar && <p className="text-xs opacity-90 mt-0.5 line-clamp-1">{o.description.ar}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
