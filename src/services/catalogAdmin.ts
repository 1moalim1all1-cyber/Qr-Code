import { collection, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PRODUCT_CATALOG, type CatalogProduct } from '@/data/productCatalog'
import type { BusinessType } from '@/types/database'

export interface CatalogAdminRecord {
  id: string
  business_type?: Extract<BusinessType, 'supermarket' | 'cosmetics'>
  name?: string
  category?: string
  brand?: string | null
  unit?: string | null
  barcode?: string | null
  description?: string | null
  image_url?: string | null
  active?: boolean
  custom?: boolean
}

const catalogRef = collection(db, 'catalog_products')

export async function listCatalogAdminRecords() {
  const snap = await getDocs(catalogRef)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CatalogAdminRecord[]
}

export async function saveCatalogAdminRecord(id: string, patch: Omit<Partial<CatalogAdminRecord>, 'id'>) {
  await setDoc(doc(db, 'catalog_products', id), {
    ...patch,
    updated_at: serverTimestamp(),
  }, { merge: true })
}

export async function createCatalogProduct(input: {
  id: string
  businessType: Extract<BusinessType, 'supermarket' | 'cosmetics'>
  name: string
  category: string
  brand?: string
  unit?: string
  barcode?: string
  description?: string
  imageUrl?: string | null
}) {
  await setDoc(doc(db, 'catalog_products', input.id), {
    business_type: input.businessType,
    name: input.name.trim(),
    category: input.category.trim(),
    brand: input.brand?.trim() || null,
    unit: input.unit?.trim() || null,
    barcode: input.barcode?.trim() || null,
    description: input.description?.trim() || null,
    image_url: input.imageUrl || null,
    active: true,
    custom: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }, { merge: true })
}

export async function getCatalogForBusiness(
  businessType: Extract<BusinessType, 'supermarket' | 'cosmetics'>,
): Promise<CatalogProduct[]> {
  const records = await listCatalogAdminRecords()
  const byId = new Map(records.map((r) => [r.id, r]))

  const builtIn = PRODUCT_CATALOG
    .filter((p) => p.businessType === businessType)
    .map((p) => {
      const override = byId.get(p.id)
      return {
        ...p,
        // Intentionally ignore old remote/random catalog images. The exact image
        // shown to owners is the one approved/uploaded from the admin catalog.
        imageUrl: override?.image_url || '',
        ...(override?.brand !== undefined ? { brand: override.brand || undefined } : {}),
        ...(override?.unit !== undefined ? { unit: override.unit || undefined } : {}),
        ...(override?.barcode !== undefined ? { barcode: override.barcode || undefined } : {}),
        ...(override?.description !== undefined ? { description: override.description || undefined } : {}),
      }
    })
    .filter((p) => byId.get(p.id)?.active !== false)

  const custom = records
    .filter((r) => r.custom && r.active !== false && r.business_type === businessType && r.name && r.category)
    .map((r) => ({
      id: r.id,
      businessType,
      category: r.category!,
      name: r.name!,
      brand: r.brand || undefined,
      unit: r.unit || undefined,
      barcode: r.barcode || undefined,
      description: r.description || undefined,
      imageUrl: r.image_url || '',
    } satisfies CatalogProduct))

  return [...builtIn, ...custom]
}
