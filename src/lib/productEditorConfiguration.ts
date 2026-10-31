// Activity-specific product editor presets for EgyMenu.
// Use business_type saved on the restaurant, never infer it from a product.
export type ProductActivity = 'cafe' | 'restaurant' | 'retail' | 'grocery'
export function productActivity(type: string = '', label: string = ''): ProductActivity {
  const t = (type + ' ' + label).toLowerCase()
  if (/cafe|coffee|كاف|قهو|كوفي|مشروبات|عصائر/.test(t)) return 'cafe'
  if (/restaurant|مطعم|مطاعم|وجبات|مأكولات|طعام|food/.test(t)) return 'restaurant'
  if (/supermarket|grocery|بقال|سوبر ماركت|ماركت/.test(t)) return 'grocery'
  return 'retail'
}
export const productEditorPresets = {
  cafe: { fields: ['name','category','description','ingredients','extras','sizes','price','image'], quickOptions: { sizes:['صغير','وسط','كبير'], volume:['250 مل','350 مل','500 مل','1 لتر'], weight:['100 جم','250 جم','500 جم','1 كجم'] } },
  restaurant: { fields: ['name','category','description','ingredients','allergens','extras','sizes','price','image'], quickOptions: { sizes:['صغير','وسط','كبير'], weight:['ربع كيلو','نصف كيلو','كيلو'] } },
  retail: { fields: ['name','category','description','brand','barcode','colors','variants','stock','price','image'], quickOptions: {} },
  grocery: { fields: ['name','category','description','brand','barcode','unit','stock','price','image'], quickOptions: { weight:['250 جم','500 جم','1 كجم'], volume:['250 مل','500 مل','1 لتر'] } },
} as const
