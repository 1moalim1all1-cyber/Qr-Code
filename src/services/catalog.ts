import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createCategory, listCategories } from '@/services/categories'
import { createProduct } from '@/services/products'
import type { Restaurant } from '@/types/database'
import type { CatalogProduct } from '@/data/productCatalog'

async function ensureCategory(restaurant: Restaurant, categoryName: string) {
  const categories = await listCategories(restaurant.id)
  const existing = categories.find((c) => c.name.ar === categoryName)
  if (existing) return existing.id
  return createCategory(restaurant.id, restaurant.owner_id, categoryName, '', categories.length)
}

export async function importCatalogProducts(
  restaurant: Restaurant,
  products: CatalogProduct[],
  prices: Record<string, number>,
) {
  const missingPrice = products.find((item) => !Number.isFinite(Number(prices[item.id])) || Number(prices[item.id]) <= 0)
  if (missingPrice) throw new Error(`اكتب سعر ${missingPrice.name} قبل الإضافة`)

  const categories = await listCategories(restaurant.id)
  const categoryMap = new Map(categories.map((c) => [c.name.ar, c.id]))

  for (const item of products) {
    let categoryId = categoryMap.get(item.category)
    if (!categoryId) {
      categoryId = await createCategory(restaurant.id, restaurant.owner_id, item.category, '', categoryMap.size)
      categoryMap.set(item.category, categoryId)
    }

    await createProduct(restaurant.id, restaurant.owner_id, {
      category_id: categoryId,
      catalog_id: item.id,
      barcode: item.barcode ?? null,
      brand: item.brand ?? null,
      unit_label: item.unit ?? null,
      name: { ar: item.name },
      description: { ar: item.description || [item.brand, item.unit].filter(Boolean).join(' • ') },
      price: Number(prices[item.id]),
      discount_price: null,
      is_available: true,
      is_best_seller: false,
      is_new: false,
      is_spicy: false,
      is_vegetarian: false,
      ingredients: [],
      allergens: [],
      extras: [],
      sizes: [],
      images: [{ id: `${item.id}-img`, url: item.imageUrl, sort_order: 0 }],
    })
  }
}

export async function addCustomCatalogProduct(input: {
  restaurant: Restaurant
  name: string
  category: string
  price: number
  brand?: string
  barcode?: string
  unit?: string
}) {
  const categoryId = await ensureCategory(input.restaurant, input.category)
  await createProduct(input.restaurant.id, input.restaurant.owner_id, {
    category_id: categoryId,
    catalog_id: null,
    brand: input.brand?.trim() || null,
    barcode: input.barcode?.trim() || null,
    unit_label: input.unit?.trim() || null,
    name: { ar: input.name.trim() },
    description: { ar: [input.brand, input.unit, input.barcode ? `باركود: ${input.barcode}` : ''].filter(Boolean).join(' • ') },
    price: Math.max(0.01, Number(input.price)),
    discount_price: null,
    is_available: true,
    is_best_seller: false,
    is_new: true,
    is_spicy: false,
    is_vegetarian: false,
    ingredients: [],
    allergens: [],
    extras: [],
    sizes: [],
    images: [],
  })
  await suggestCatalogProduct(input)
}

export async function suggestCatalogProduct(input: {
  restaurant: Restaurant
  name: string
  category: string
  brand?: string
  barcode?: string
  unit?: string
}) {
  await addDoc(collection(db, 'catalog_suggestions'), {
    restaurant_id: input.restaurant.id,
    owner_id: input.restaurant.owner_id,
    business_type: input.restaurant.business_type || 'supermarket',
    name: input.name.trim(),
    category: input.category.trim(),
    brand: input.brand?.trim() || null,
    barcode: input.barcode?.trim() || null,
    unit: input.unit?.trim() || null,
    status: 'pending',
    created_at: serverTimestamp(),
  })
}
