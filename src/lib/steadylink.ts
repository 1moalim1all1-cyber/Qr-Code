import { auth } from './firebase'

const WORKER_URL = 'https://misty-dew-76fd.1moalim1all1.workers.dev/upload'
const MAX_SIZE = 8 * 1024 * 1024

export async function uploadSteadyImage(file: File, restaurantId: string): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('ارفع صورة JPG أو PNG أو WebP')
  }
  if (!file.size || file.size > MAX_SIZE) {
    throw new Error('حجم الصورة لازم يكون أقل من 8 ميجا')
  }
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(restaurantId)) {
    throw new Error('معرّف المتجر غير صحيح')
  }
  const user = auth.currentUser
  if (!user) throw new Error('لازم تسجّل دخول قبل رفع الصور')

  const form = new FormData()
  form.append('file', file, file.name)
  form.append('restaurantId', restaurantId)

  let response: Response
  try {
    response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: form,
    })
  } catch {
    throw new Error('تعذر الاتصال بخدمة الصور. حاول مرة أخرى')
  }
  const result = await response.json().catch(() => null) as { url?: string; error?: string } | null
  if (!response.ok || !result?.url) {
    const errors: Record<string, string> = {
      NOT_CONFIGURED: 'خدمة رفع الصور لم تكتمل إعداداتها بعد',
      ACCESS_DENIED: 'مش مسموح لك ترفع صور للمتجر ده',
      INVALID_TOKEN: 'انتهت جلسة الدخول؛ سجل دخول مرة تانية',
      LOGIN_REQUIRED: 'لازم تسجّل دخول',
      FREE_LIMIT_REACHED: 'الحصة المجانية للصور خلصت. تواصل مع الإدارة',
      PROCESSING: 'الصورة لسه قيد الفحص؛ حاول لاحقًا',
      STORAGE_UNAVAILABLE: 'خدمة التخزين غير متاحة حاليًا',
      FILE_TOO_LARGE: 'الصورة أكبر من الحجم المسموح',
    }
    throw new Error(errors[result?.error || ''] || 'تعذر رفع الصورة؛ حاول مرة أخرى')
  }
  if (!/^https:\/\/cdn\.steadylink\.io\/a\/[\w-]+$/i.test(result.url)) {
    throw new Error('رابط الصورة المستلم غير صالح')
  }
  return result.url
}
