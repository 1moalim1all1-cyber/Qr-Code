import {
  collection, doc, addDoc, getDocs, query, orderBy, updateDoc, deleteDoc, writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { withFirestoreError } from '@/lib/firestoreError'
import type { Category } from '@/types/database'

const categoriesRef = (restaurantId: string) => collection(db, 'restaurants', restaurantId, 'categories')

export async function listCategories(restaurantId: string) {
  const q = query(categoriesRef(restaurantId), orderBy('sort_order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Category[]
}

export async function createCategory(
  restaurantId: string,
  ownerId: string | null,
  nameAr: string,
  nameEn: string,
  sortOrder: number
) {
  return withFirestoreError('تعذّر إضافة القسم', async () => {
    const docRef = await addDoc(categoriesRef(restaurantId), {
      owner_id: ownerId,
      name: { ar: nameAr, en: nameEn },
      icon: null,
      sort_order: sortOrder,
      is_visible: true,
    })
    return docRef.id
  })
}

export async function updateCategory(
  restaurantId: string,
  id: string,
  patch: Partial<Pick<Category, 'name' | 'icon' | 'is_visible' | 'sort_order'>>
) {
  await withFirestoreError('تعذّر تعديل القسم', () =>
    updateDoc(doc(db, 'restaurants', restaurantId, 'categories', id), patch)
  )
}

export async function deleteCategory(restaurantId: string, id: string) {
  await withFirestoreError('تعذّر حذف القسم', () =>
    deleteDoc(doc(db, 'restaurants', restaurantId, 'categories', id))
  )
}

// Persist a new order after drag-and-drop / arrow reordering
export async function reorderCategories(restaurantId: string, orderedIds: string[]) {
  await withFirestoreError('تعذّر إعادة ترتيب الأقسام', async () => {
    const batch = writeBatch(db)
    orderedIds.forEach((id, index) => {
      batch.update(doc(db, 'restaurants', restaurantId, 'categories', id), { sort_order: index })
    })
    await batch.commit()
  })
}
