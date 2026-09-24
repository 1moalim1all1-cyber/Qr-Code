import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface BusinessTypeRecord {
  id: string
  code: string
  name: string
  icon?: string | null
  image_url?: string | null
  description?: string | null
  sort_order: number
  is_active: boolean
  created_at?: unknown
  updated_at?: unknown
}

export const DEFAULT_BUSINESS_TYPES: Omit<BusinessTypeRecord, 'id'>[] = [
  { code: 'restaurant', name: 'مطاعم', icon: '🍽️', image_url: null, description: 'مطاعم ووجبات وأطعمة', sort_order: 10, is_active: true },
  { code: 'cafe', name: 'كافيهات', icon: '☕', image_url: null, description: 'كافيهات ومشروبات', sort_order: 20, is_active: true },
  { code: 'supermarket', name: 'سوبر ماركت', icon: '🛒', image_url: null, description: 'بقالة وسوبر ماركت', sort_order: 30, is_active: true },
  { code: 'cosmetics', name: 'مستحضرات تجميل', icon: '💄', image_url: null, description: 'تجميل وعناية شخصية', sort_order: 40, is_active: true },
  { code: 'mobiles', name: 'موبايلات وإكسسوارات', icon: '📱', image_url: null, description: null, sort_order: 50, is_active: true },
  { code: 'electronics', name: 'إلكترونيات وأجهزة كهربائية', icon: '💻', image_url: null, description: null, sort_order: 60, is_active: true },
  { code: 'clothing', name: 'ملابس', icon: '👕', image_url: null, description: null, sort_order: 70, is_active: true },
  { code: 'shoes_bags', name: 'أحذية وشنط', icon: '👟', image_url: null, description: null, sort_order: 80, is_active: true },
  { code: 'perfumes', name: 'عطور', icon: '🧴', image_url: null, description: null, sort_order: 90, is_active: true },
  { code: 'pharmacy', name: 'صيدليات', icon: '💊', image_url: null, description: null, sort_order: 100, is_active: true },
  { code: 'homeware', name: 'أدوات منزلية', icon: '🏠', image_url: null, description: null, sort_order: 110, is_active: true },
  { code: 'bookstores', name: 'مكتبات', icon: '📚', image_url: null, description: null, sort_order: 120, is_active: true },
  { code: 'sweets_bakery', name: 'حلويات ومخبوزات', icon: '🧁', image_url: null, description: null, sort_order: 130, is_active: true },
  { code: 'auto_parts', name: 'قطع غيار سيارات', icon: '🚗', image_url: null, description: null, sort_order: 140, is_active: true },
  { code: 'decor_finishing', name: 'ديكور وتشطيبات', icon: '🧱', image_url: null, description: null, sort_order: 150, is_active: true },
  { code: 'ceramics_sanitary', name: 'سيراميك وأدوات صحية', icon: '🚿', image_url: null, description: null, sort_order: 160, is_active: true },
  { code: 'furniture', name: 'أثاث ومفروشات', icon: '🛋️', image_url: null, description: null, sort_order: 170, is_active: true },
]

const businessTypesRef = collection(db, 'business_types')

function defaultsAsRecords() {
  return DEFAULT_BUSINESS_TYPES.map((item) => ({ id: item.code, ...item }))
}

export async function listBusinessTypes(options?: { includeInactive?: boolean }) {
  const snap = await getDocs(businessTypesRef)
  const rows = snap.docs.map((item) => ({ id: item.id, ...item.data() }) as BusinessTypeRecord)
  const source = rows.length > 0 ? rows : defaultsAsRecords()
  return source
    .filter((item) => options?.includeInactive || item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999) || a.name.localeCompare(b.name, 'ar'))
}

export async function seedDefaultBusinessTypes() {
  await Promise.all(DEFAULT_BUSINESS_TYPES.map(async (item) => {
    const ref = doc(db, 'business_types', item.code)
    const existing = await getDoc(ref)
    if (existing.exists()) return
    await setDoc(ref, { ...item, created_at: serverTimestamp(), updated_at: serverTimestamp() })
  }))
  return listBusinessTypes({ includeInactive: true })
}

export async function createBusinessType(input: { name: string; icon?: string; description?: string; sortOrder?: number }) {
  const ref = doc(businessTypesRef)
  const record = {
    code: ref.id,
    name: input.name.trim(),
    icon: input.icon?.trim() || '🏪',
    image_url: null,
    description: input.description?.trim() || null,
    sort_order: input.sortOrder ?? Date.now(),
    is_active: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
  await setDoc(ref, record)
  return { id: ref.id, ...record } as BusinessTypeRecord
}

export async function updateBusinessType(id: string, patch: Partial<Pick<BusinessTypeRecord, 'name' | 'icon' | 'description' | 'sort_order' | 'is_active'>>) {
  await updateDoc(doc(db, 'business_types', id), { ...patch, updated_at: serverTimestamp() })
}

export async function archiveBusinessType(id: string) {
  await updateBusinessType(id, { is_active: false })
}

export async function restoreBusinessType(id: string) {
  await updateBusinessType(id, { is_active: true })
}

// Hard delete is intentionally separate. Admin UI uses archiveBusinessType so stores already linked to a type keep working safely.
export async function deleteBusinessTypePermanently(id: string) {
  await deleteDoc(doc(db, 'business_types', id))
}
