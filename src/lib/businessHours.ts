import type { Restaurant } from '@/types/database'

export const WEEK_DAYS = [
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الاثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
  { key: 'saturday', label: 'السبت' },
] as const

// Computes whether a restaurant is open RIGHT NOW based on its configured
// weekly hours. `is_open` on the restaurant doc still works as a manual
// override for "temporarily closed" (holiday, ran out of stock, etc.) —
// setting it to false always shows closed regardless of the schedule.
// If no hours are configured for today, we fall back to the manual flag
// alone so existing restaurants that never filled this in keep working.
export function isRestaurantOpenNow(restaurant: Pick<Restaurant, 'is_open' | 'working_hours'>): boolean {
  if (!restaurant.is_open) return false

  const todayKey = WEEK_DAYS[new Date().getDay()].key
  const todayHours = restaurant.working_hours?.[todayKey]
  if (!todayHours || !todayHours.open || !todayHours.close) return true // no schedule set — trust the manual flag
  if (todayHours.closed) return false

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const [openH, openM] = todayHours.open.split(':').map(Number)
  const [closeH, closeM] = todayHours.close.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  let closeMinutes = closeH * 60 + closeM

  // Overnight hours (e.g. open 17:00, close 02:00) — closing time is "next day"
  if (closeMinutes <= openMinutes) {
    closeMinutes += 24 * 60
    const adjustedNow = nowMinutes < openMinutes ? nowMinutes + 24 * 60 : nowMinutes
    return adjustedNow >= openMinutes && adjustedNow < closeMinutes
  }

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes
}
