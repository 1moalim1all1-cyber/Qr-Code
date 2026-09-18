import type { BusinessType } from '@/types/database'

export interface CatalogProduct {
  id: string
  businessType: Extract<BusinessType, 'supermarket' | 'cosmetics'>
  category: string
  name: string
  brand?: string
  unit?: string
  barcode?: string
  suggestedPrice?: number
  imageUrl?: string
}

export const PRODUCT_CATALOG: CatalogProduct[] = [
  { id: 'sm-water-15', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مياه معدنية 1.5 لتر', unit: '1.5 لتر' },
  { id: 'sm-water-06', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مياه معدنية 600 مل', unit: '600 مل' },
  { id: 'sm-cola-can', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مشروب غازي كان', unit: '330 مل' },
  { id: 'sm-juice-1l', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'عصير عبوة 1 لتر', unit: '1 لتر' },
  { id: 'sm-milk-1l', businessType: 'supermarket', category: 'ألبان', name: 'لبن كامل الدسم', unit: '1 لتر' },
  { id: 'sm-yogurt', businessType: 'supermarket', category: 'ألبان', name: 'زبادي', unit: 'علبة' },
  { id: 'sm-cheese', businessType: 'supermarket', category: 'ألبان', name: 'جبنة بيضاء', unit: 'عبوة' },
  { id: 'sm-eggs-30', businessType: 'supermarket', category: 'ألبان', name: 'طبق بيض', unit: '30 بيضة' },
  { id: 'sm-rice-1k', businessType: 'supermarket', category: 'بقالة', name: 'أرز أبيض', unit: '1 كجم' },
  { id: 'sm-sugar-1k', businessType: 'supermarket', category: 'بقالة', name: 'سكر أبيض', unit: '1 كجم' },
  { id: 'sm-oil-1l', businessType: 'supermarket', category: 'بقالة', name: 'زيت طعام', unit: '1 لتر' },
  { id: 'sm-pasta', businessType: 'supermarket', category: 'بقالة', name: 'مكرونة', unit: '400 جم' },
  { id: 'sm-chips', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'شيبسي', unit: 'كيس' },
  { id: 'sm-biscuit', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'بسكويت', unit: 'عبوة' },
  { id: 'sm-chocolate', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'شوكولاتة', unit: 'قطعة' },
  { id: 'sm-detergent', businessType: 'supermarket', category: 'منظفات', name: 'مسحوق غسيل', unit: 'عبوة' },
  { id: 'sm-dish', businessType: 'supermarket', category: 'منظفات', name: 'سائل غسيل أطباق', unit: 'عبوة' },
  { id: 'sm-tissue', businessType: 'supermarket', category: 'منظفات', name: 'مناديل ورقية', unit: 'عبوة' },

  { id: 'co-shampoo', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'شامبو', unit: 'عبوة' },
  { id: 'co-conditioner', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'بلسم', unit: 'عبوة' },
  { id: 'co-hair-oil', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'زيت شعر', unit: 'عبوة' },
  { id: 'co-face-wash', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'غسول وجه', unit: 'عبوة' },
  { id: 'co-moisturizer', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'مرطب', unit: 'عبوة' },
  { id: 'co-sunscreen', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'واقي شمس', unit: 'عبوة' },
  { id: 'co-lipstick', businessType: 'cosmetics', category: 'مكياج', name: 'روج', unit: 'قطعة' },
  { id: 'co-mascara', businessType: 'cosmetics', category: 'مكياج', name: 'ماسكارا', unit: 'قطعة' },
  { id: 'co-foundation', businessType: 'cosmetics', category: 'مكياج', name: 'فاونديشن', unit: 'عبوة' },
  { id: 'co-perfume', businessType: 'cosmetics', category: 'عطور', name: 'برفان', unit: 'زجاجة' },
]
