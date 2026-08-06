import {
  collection, doc, addDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { withFirestoreError } from '@/lib/firestoreError'
import type { Product } from '@/types/database'

const productsRef = (restaurantId: string) => collection(db, 'restaurants', restaurantId, 'products')

export async function listProducts(restaurantId: string, categoryId?: string) {
  // Filtering by category_id + ordering by sort_order needs a composite index;
  // Firestore will show a one-click link to create it the first time this runs.
  const q = categoryId
    ? query(productsRef(restaurantId), where('category_id', '==', categoryId), orderBy('sort_order', 'asc'))
    : query(productsRef(restaurantId), orderBy('sort_order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Product[]
}

export interface ProductInput {
  category_id: string | null
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
}

export async function createProduct(restaurantId: string, ownerId: string | null, input: ProductInput) {
  return withFirestoreError('تعذّر إضافة الصنف', async () => {
    const docRef = await addDoc(productsRef(restaurantId), {
      owner_id: ownerId,
      ...input,
      calories: null,
      ingredients: [],
      extras: [],
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
