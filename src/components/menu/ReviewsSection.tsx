import { useEffect, useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { listReviews, createReview } from '@/services/reviews'
import type { Review } from '@/types/database'

export default function ReviewsSection({ restaurantId }: { restaurantId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    listReviews(restaurantId)
      .then(setReviews)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) {
      setError('اكتب اسمك وتعليقك الأول')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createReview(restaurantId, name.trim(), rating, comment.trim())
      setName('')
      setComment('')
      setRating(5)
      setFormOpen(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <MessageSquare size={18} className="text-saffron-dim" />
            تقييمات العملاء
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={13}
                    className={n <= Math.round(average) ? 'text-saffron' : 'text-stone-light'}
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="text-xs text-stone">
                {average.toFixed(1)} ({reviews.length} تقييم)
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="text-xs rounded-full bg-saffron/15 text-saffron-dim px-3 py-1.5 font-medium hover:bg-saffron/25 transition-colors"
        >
          أضف تقييمك
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-paper border border-stone-light/30 p-4 mb-4 flex flex-col gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} نجوم`}>
                <Star size={22} className={n <= rating ? 'text-saffron' : 'text-stone-light'} fill="currentColor" />
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك"
            className="rounded-xl border border-stone-light/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="رأيك في المطعم..."
            rows={2}
            className="rounded-xl border border-stone-light/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-saffron/40"
          />
          {error && <p className="text-xs text-sumac">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-saffron text-ink font-semibold py-2.5 text-sm disabled:opacity-60"
          >
            {submitting ? 'جارِ الإرسال...' : 'إرسال التقييم'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-stone">جارِ التحميل...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-stone-light">لسه مفيش تقييمات — كن أول من يقيّم.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.slice(0, 6).map((r) => (
            <div key={r.id} className="rounded-xl bg-paper border border-stone-light/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{r.customer_name}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={11} className={n <= r.rating ? 'text-saffron' : 'text-stone-light'} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-stone">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
