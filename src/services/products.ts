import {
  collection, doc, addDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { withFirestoreError } from '@/lib/firestoreError'
import type { Product } from '@/types/database'

const productsRef = (restaurantId: string) => collection(db, 'restaurants', restaurantId, 'products')

export async function listProducts(restaurantId: string, categoryId?: string) {
  const q = categoryId
    ? query(productsRef(restaurantId), where('category_id', '==', categoryId), orderBy('sort_order', 'asc'))
    : query(productsRef(restaurantId), orderBy('sort_order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Product[]
}

export interface ProductInput {
  category_id?: string | null
  catalog_id?: string | null
  barcode?: string | null
  brand?: string | null
  unit_label?: string | null
  shade?: string | null
  name: { ar: string; en?: string }
  description?: { ar: string; en?: string }
  price: number
  discount_price?: number | null
  is_available: boolean
  is_best_seller: boolean
  is_new: boolean
  is_spicy: boolean
  is_vegetarian: boolean
  images?: { id: string; url: string; sort_order: number }[]
  ingredients?: string[]
  allergens?: string[]
  extras?: { name: string; price: number }[]
  sizes?: { name: string; price: number; stock?: number | null }[]
}

export async function createProduct(restaurantId: string, ownerId: string | null, input: ProductInput) {
  return withFirestoreError('تعذّر إضافة الصنف', async () => {
    const docRef = await addDoc(productsRef(restaurantId), {
      owner_id: ownerId,
      ...input,
      category_id: input.category_id ?? null,
      calories: null,
      ingredients: input.ingredients ?? [],
      allergens: input.allergens ?? [],
      extras: input.extras ?? [],
      sizes: input.sizes ?? [],
      video_url: null,
      sort_order: Date.now(),
      images: input.images ?? [],
    })
    return docRef.id
  })
}

export async function updateProduct(restaurantId: string, id: string, patch: Partial<ProductInput>) {
  await withFirestoreError('تعذّر تعديل الصنف', () =>
    updateDoc(doc(db, 'restaurants', restaurantId, 'products', id), patch)
  )
}

export async function deleteProduct(restaurantId: string, id: string) {
  await withFirestoreError('تعذّر حذف الصنف', () =>
    deleteDoc(doc(db, 'restaurants', restaurantId, 'products', id))
  )
}

export async function toggleAvailability(restaurantId: string, id: string, isAvailable: boolean) {
  await withFirestoreError('تعذّر تحديث إتاحة الصنف', () =>
    updateDoc(doc(db, 'restaurants', restaurantId, 'products', id), { is_available: isAvailable })
  )
}

export async function reorderProducts(restaurantId: string, orderedIds: string[]) {
  await withFirestoreError('تعذّر ترتيب الأصناف', async () => {
    const batch = writeBatch(db)
    orderedIds.forEach((id, index) => {
      batch.update(doc(db, 'restaurants', restaurantId, 'products', id), { sort_order: index })
    })
    await batch.commit()
  })
}
