export type CatalogBusinessType = 'supermarket' | 'cosmetics'

export interface CatalogProduct {
  id: string
  businessType: CatalogBusinessType
  category: string
  name: string
  brand?: string
  unit?: string
  barcode?: string
  description?: string
  imageUrl: string
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=900`
const photo = (keyword: string) => `https://loremflickr.com/900/900/${encodeURIComponent(keyword)}?lock=${encodeURIComponent(keyword)}`

export const PRODUCT_CATALOG: CatalogProduct[] = [
  { id: 'sm-coca-cola-330', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'كوكاكولا كان', brand: 'Coca-Cola', unit: '330 مل', description: 'كوكاكولا كان 330 مل', imageUrl: commons('Coca-Cola 330ml can.jpg') },
  { id: 'sm-pepsi-can', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'بيبسي كان', brand: 'Pepsi', unit: '330 مل', description: 'بيبسي كان', imageUrl: commons('Pepsi Can.jpg') },
  { id: 'sm-water-15', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مياه معدنية', unit: '1.5 لتر', description: 'عبوة مياه معدنية كبيرة', imageUrl: photo('sealed-mineral-water-bottle-product') },
  { id: 'sm-water-06', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مياه معدنية صغيرة', unit: '600 مل', description: 'عبوة مياه معدنية صغيرة', imageUrl: photo('water-bottle-product') },
  { id: 'sm-juice-1l', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'عصير فواكه', unit: '1 لتر', description: 'عصير فواكه معبأ', imageUrl: photo('juice-carton-product') },
  { id: 'sm-milk-1l', businessType: 'supermarket', category: 'ألبان وبيض', name: 'لبن كامل الدسم', unit: '1 لتر', description: 'لبن معبأ كامل الدسم', imageUrl: photo('milk-carton-product') },
  { id: 'sm-yogurt', businessType: 'supermarket', category: 'ألبان وبيض', name: 'زبادي', unit: 'علبة', description: 'علبة زبادي', imageUrl: photo('yogurt-cup-product') },
  { id: 'sm-cheese-white', businessType: 'supermarket', category: 'ألبان وبيض', name: 'جبنة بيضاء', unit: 'عبوة', description: 'جبنة بيضاء معبأة', imageUrl: photo('white-cheese-package') },
  { id: 'sm-eggs-30', businessType: 'supermarket', category: 'ألبان وبيض', name: 'طبق بيض', unit: '30 بيضة', description: 'طبق بيض كامل', imageUrl: photo('egg-tray-product') },
  { id: 'sm-nescafe', businessType: 'supermarket', category: 'بقالة أساسية', name: 'نسكافيه', brand: 'Nescafé', unit: 'برطمان', description: 'قهوة نسكافيه سريعة التحضير', imageUrl: commons('Nescafe.jpg') },
  { id: 'sm-lipton', businessType: 'supermarket', category: 'بقالة أساسية', name: 'شاي ليبتون', brand: 'Lipton', unit: 'علبة', description: 'شاي ليبتون', imageUrl: commons('Teaboxes Lipton, detail 09.jpg') },
  { id: 'sm-rice-1k', businessType: 'supermarket', category: 'بقالة أساسية', name: 'أرز أبيض', unit: '1 كجم', description: 'أرز أبيض معبأ', imageUrl: photo('rice-bag-product') },
  { id: 'sm-sugar-1k', businessType: 'supermarket', category: 'بقالة أساسية', name: 'سكر أبيض', unit: '1 كجم', description: 'سكر أبيض معبأ', imageUrl: photo('sugar-bag-product') },
  { id: 'sm-oil-1l', businessType: 'supermarket', category: 'بقالة أساسية', name: 'زيت طعام', unit: '1 لتر', description: 'زيت طعام نباتي', imageUrl: photo('cooking-oil-bottle-product') },
  { id: 'sm-pasta', businessType: 'supermarket', category: 'بقالة أساسية', name: 'مكرونة', unit: '400 جم', description: 'مكرونة جافة معبأة', imageUrl: photo('pasta-package-product') },
  { id: 'sm-oreo', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'أوريو', brand: 'Oreo', unit: 'عبوة', description: 'بسكويت أوريو', imageUrl: commons('Oreo.jpg') },
  { id: 'sm-chips', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'شيبسي', unit: 'كيس', description: 'رقائق بطاطس معبأة', imageUrl: photo('potato-chips-bag-product') },
  { id: 'sm-chocolate', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'شوكولاتة', unit: 'قطعة', description: 'لوح شوكولاتة', imageUrl: photo('chocolate-bar-product') },
  { id: 'sm-gum', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'لبان', unit: 'عبوة', description: 'علكة معبأة', imageUrl: photo('chewing-gum-pack-product') },
  { id: 'sm-detergent', businessType: 'supermarket', category: 'منظفات منزلية', name: 'مسحوق غسيل', unit: 'عبوة', description: 'مسحوق غسيل ملابس', imageUrl: photo('laundry-detergent-package') },
  { id: 'sm-dish', businessType: 'supermarket', category: 'منظفات منزلية', name: 'سائل غسيل أطباق', unit: 'عبوة', description: 'سائل تنظيف الأطباق', imageUrl: photo('dish-soap-bottle-product') },
  { id: 'sm-floor', businessType: 'supermarket', category: 'منظفات منزلية', name: 'منظف أرضيات', unit: 'عبوة', description: 'منظف أرضيات', imageUrl: photo('floor-cleaner-bottle-product') },
  { id: 'sm-tissue', businessType: 'supermarket', category: 'منظفات منزلية', name: 'مناديل ورقية', unit: 'عبوة', description: 'مناديل ورقية منزلية', imageUrl: photo('tissue-box-product') },
  { id: 'sm-frozen-fries', businessType: 'supermarket', category: 'مجمدات', name: 'بطاطس مجمدة', unit: 'كيس', description: 'بطاطس نصف مقلية مجمدة', imageUrl: photo('frozen-fries-package') },
  { id: 'sm-frozen-veg', businessType: 'supermarket', category: 'مجمدات', name: 'خضار مجمد', unit: 'كيس', description: 'خضار مجمد معبأ', imageUrl: photo('frozen-vegetables-package') },
  { id: 'sm-icecream', businessType: 'supermarket', category: 'مجمدات', name: 'آيس كريم', unit: 'عبوة', description: 'آيس كريم معبأ', imageUrl: photo('ice-cream-cup-product') },
  { id: 'sm-dove-shampoo', businessType: 'supermarket', category: 'عناية شخصية', name: 'شامبو دوف', brand: 'Dove', unit: 'عبوة', description: 'شامبو دوف للعناية بالشعر', imageUrl: commons('Dove shampoo bottle.jpg') },
  { id: 'sm-colgate', businessType: 'supermarket', category: 'عناية شخصية', name: 'معجون أسنان كولجيت', brand: 'Colgate', unit: 'عبوة', description: 'معجون أسنان كولجيت', imageUrl: commons('2022 Colgate Toothpaste for Russia market Total 12 Pro Visible Action.jpg') },
  { id: 'sm-soap', businessType: 'supermarket', category: 'عناية شخصية', name: 'صابونة', unit: 'قطعة', description: 'صابونة عناية شخصية', imageUrl: photo('soap-bar-product') },
  { id: 'sm-deodorant', businessType: 'supermarket', category: 'عناية شخصية', name: 'مزيل عرق', unit: 'عبوة', description: 'مزيل عرق', imageUrl: photo('deodorant-product') },
  { id: 'co-dove-shampoo', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'شامبو دوف', brand: 'Dove', unit: 'عبوة', description: 'شامبو دوف للعناية بالشعر', imageUrl: commons('Dove shampoo bottle.jpg') },
  { id: 'co-conditioner', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'بلسم شعر', unit: 'عبوة', description: 'بلسم لترطيب الشعر', imageUrl: photo('hair-conditioner-product') },
  { id: 'co-hair-oil', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'زيت شعر', unit: 'عبوة', description: 'زيت لتغذية وترطيب الشعر', imageUrl: photo('hair-oil-bottle-product') },
  { id: 'co-hair-mask', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'ماسك شعر', unit: 'عبوة', description: 'ماسك عناية عميقة للشعر', imageUrl: photo('hair-mask-product') },
  { id: 'co-nivea-creme', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'نيفيا كريم', brand: 'NIVEA', unit: 'علبة', description: 'كريم نيفيا للترطيب', imageUrl: commons('Nivea Creme.webp') },
  { id: 'co-nivea-body', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'نيفيا كريم جسم', brand: 'NIVEA', unit: 'عبوة', description: 'كريم نيفيا للعناية بالجسم', imageUrl: commons('Nivea Body Cream.jpg') },
  { id: 'co-face-wash', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'غسول وجه', unit: 'عبوة', description: 'غسول لتنظيف البشرة', imageUrl: photo('face-wash-product') },
  { id: 'co-sunscreen', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'واقي شمس', unit: 'عبوة', description: 'واقي شمس للبشرة', imageUrl: photo('sunscreen-product') },
  { id: 'co-serum', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'سيروم بشرة', unit: 'عبوة', description: 'سيروم عناية مركز للبشرة', imageUrl: photo('face-serum-product') },
  { id: 'co-lipstick', businessType: 'cosmetics', category: 'مكياج', name: 'روج', unit: 'قطعة', description: 'أحمر شفاه بدرجات متنوعة', imageUrl: photo('lipstick-product') },
  { id: 'co-mascara', businessType: 'cosmetics', category: 'مكياج', name: 'ماسكارا', unit: 'قطعة', description: 'ماسكارا للرموش', imageUrl: photo('mascara-product') },
  { id: 'co-foundation', businessType: 'cosmetics', category: 'مكياج', name: 'فاونديشن', unit: 'عبوة', description: 'كريم أساس بدرجات متنوعة', imageUrl: photo('foundation-makeup-product') },
  { id: 'co-concealer', businessType: 'cosmetics', category: 'مكياج', name: 'كونسيلر', unit: 'عبوة', description: 'خافي عيوب بدرجات متنوعة', imageUrl: photo('concealer-product') },
  { id: 'co-powder', businessType: 'cosmetics', category: 'مكياج', name: 'بودرة وجه', unit: 'علبة', description: 'بودرة تثبيت للوجه', imageUrl: photo('face-powder-product') },
  { id: 'co-perfume-women', businessType: 'cosmetics', category: 'عطور', name: 'برفان حريمي', unit: 'زجاجة', description: 'عطر نسائي', imageUrl: photo('women-perfume-bottle-product') },
  { id: 'co-perfume-men', businessType: 'cosmetics', category: 'عطور', name: 'برفان رجالي', unit: 'زجاجة', description: 'عطر رجالي', imageUrl: photo('men-perfume-bottle-product') },
  { id: 'co-body-mist', businessType: 'cosmetics', category: 'عطور', name: 'بودي ميست', unit: 'زجاجة', description: 'رذاذ معطر للجسم', imageUrl: photo('body-mist-product') },
  { id: 'co-body-lotion', businessType: 'cosmetics', category: 'العناية بالجسم', name: 'لوشن جسم', unit: 'عبوة', description: 'لوشن ترطيب للجسم', imageUrl: photo('body-lotion-product') },
  { id: 'co-shower-gel', businessType: 'cosmetics', category: 'العناية بالجسم', name: 'شاور جل', unit: 'عبوة', description: 'جل استحمام', imageUrl: photo('shower-gel-product') },
  { id: 'co-hand-cream', businessType: 'cosmetics', category: 'العناية بالجسم', name: 'كريم يدين', unit: 'عبوة', description: 'كريم لترطيب اليدين', imageUrl: photo('hand-cream-product') },
  { id: 'co-nail-polish', businessType: 'cosmetics', category: 'الأظافر', name: 'طلاء أظافر', unit: 'زجاجة', description: 'طلاء أظافر بدرجات مختلفة', imageUrl: photo('nail-polish-product') },
  { id: 'co-nail-remover', businessType: 'cosmetics', category: 'الأظافر', name: 'مزيل طلاء أظافر', unit: 'عبوة', description: 'مزيل طلاء للأظافر', imageUrl: photo('nail-polish-remover-product') },
]
