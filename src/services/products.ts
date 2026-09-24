import {
  collection, doc, addDoc, getDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { withFirestoreError } from '@/lib/firestoreError'
import type { Product, ProductSpecification, ProductVariant, ProductVariantOption } from '@/types/database'

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
  compare_at_price?: number | null
  discount_percent?: number | null
  is_available: boolean
  is_best_seller: boolean
  is_new: boolean
  is_spicy: boolean
  is_vegetarian: boolean
  is_featured?: boolean
  images?: { id: string; url: string; sort_order: number }[]
  ingredients?: string[]
  allergens?: string[]
  extras?: { name: string; price: number }[]
  sizes?: { name: string; price: number; stock?: number | null }[]
  variant_options?: ProductVariantOption[]
  variants?: ProductVariant[]
  specifications?: ProductSpecification[]
  colors?: string[]
  badges?: string[]
  views_count?: number
}

export async function createProduct(restaurantId: string, ownerId: string | null, input: ProductInput) {
  return withFirestoreError('تعذّر إضافة الصنف', async () => {
    const docRef = await addDoc(productsRef(restaurantId), {
      owner_id: ownerId,
      ...input,
      category_id: input.category_id ?? null,
      compare_at_price: input.compare_at_price ?? null,
      discount_percent: input.discount_percent ?? null,
      calories: null,
      ingredients: input.ingredients ?? [],
      allergens: input.allergens ?? [],
      extras: input.extras ?? [],
      sizes: input.sizes ?? [],
      variant_options: input.variant_options ?? [],
      variants: input.variants ?? [],
      specifications: input.specifications ?? [],
      colors: input.colors ?? [],
      badges: input.badges ?? [],
      is_featured: input.is_featured ?? false,
      views_count: input.views_count ?? 0,
      video_url: null,
      sort_order: Date.now(),
      images: input.images ?? [],
    })
    return docRef.id
  })
}

export async function updateProduct(restaurantId: string, id: string, patch: Partial<ProductInput>) {
  await withFirestoreError('تعذّر تعديل الصنف', async () => {
    const ref = doc(db, 'restaurants', restaurantId, 'products', id)
    const safePatch: Partial<ProductInput> = { ...patch }

    // The professional product editor intentionally exposes generic catalog fields,
    // while the legacy food editor still owns ingredients, allergens, extras,
    // sizes and food-only flags. When an existing restaurant product is edited in
    // the professional editor, preserve those hidden legacy values instead of
    // silently wiping them with the editor's empty defaults.
    const advancedEdit = 'variant_options' in patch && 'specifications' in patch && 'compare_at_price' in patch

    if (advancedEdit) {
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const existing = snap.data() as Partial<ProductInput>

        if (Array.isArray(patch.ingredients) && patch.ingredients.length === 0 && Array.isArray(existing.ingredients) && existing.ingredients.length > 0) safePatch.ingredients = existing.ingredients
        if (Array.isArray(patch.allergens) && patch.allergens.length === 0 && Array.isArray(existing.allergens) && existing.allergens.length > 0) safePatch.allergens = existing.allergens
        if (Array.isArray(patch.extras) && patch.extras.length === 0 && Array.isArray(existing.extras) && existing.extras.length > 0) safePatch.extras = existing.extras
        if (Array.isArray(patch.sizes) && patch.sizes.length === 0 && Array.isArray(existing.sizes) && existing.sizes.length > 0) safePatch.sizes = existing.sizes
        if (patch.is_spicy === false && existing.is_spicy === true) safePatch.is_spicy = true
        if (patch.is_vegetarian === false && existing.is_vegetarian === true) safePatch.is_vegetarian = true

        // Older restaurant products store the sale price in discount_price.
        // If the advanced editor opens such a product and the user did not change
        // its price fields, keep the old discount representation intact.
        const existingPrice = typeof existing.price === 'number' ? existing.price : null
        const existingDiscount = typeof existing.discount_price === 'number' ? existing.discount_price : null
        const looksUnchangedFromLegacyDiscount =
          existingPrice !== null &&
          existingDiscount !== null &&
          existingDiscount < existingPrice &&
          patch.price === existingPrice &&
          patch.discount_price == null &&
          patch.compare_at_price === existingPrice

        if (looksUnchangedFromLegacyDiscount) {
          safePatch.discount_price = existingDiscount
          safePatch.compare_at_price = existing.compare_at_price ?? existingPrice
          safePatch.discount_percent = existing.discount_percent ?? Math.round(((existingPrice - existingDiscount) / existingPrice) * 100)
        }
      }
    }

    await updateDoc(ref, safePatch)
  })
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
