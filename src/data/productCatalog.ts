import type { BusinessType } from '@/types/database'

export interface CatalogProduct {
  id: string
  businessType: Extract<BusinessType, 'supermarket' | 'cosmetics'>
  category: string
  name: string
  brand?: string
  unit?: string
  barcode?: string
  description?: string
  imageUrl: string
}

const img = (keyword: string) => `https://loremflickr.com/640/640/${encodeURIComponent(keyword)}?lock=${encodeURIComponent(keyword)}`

export const PRODUCT_CATALOG: CatalogProduct[] = [
  // ========================= SUPERMARKET =========================
  { id: 'sm-water-15', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مياه معدنية 1.5 لتر', unit: '1.5 لتر', description: 'عبوة مياه معدنية كبيرة', imageUrl: img('mineral-water-bottle') },
  { id: 'sm-water-06', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مياه معدنية 600 مل', unit: '600 مل', description: 'عبوة مياه معدنية صغيرة', imageUrl: img('water-bottle') },
  { id: 'sm-cola-can', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مشروب غازي كان', unit: '330 مل', description: 'كان مشروب غازي', imageUrl: img('soda-can') },
  { id: 'sm-cola-bottle', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مشروب غازي زجاجة', unit: '1 لتر', description: 'زجاجة مشروب غازي عائلية', imageUrl: img('soda-bottle') },
  { id: 'sm-juice-1l', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'عصير عبوة 1 لتر', unit: '1 لتر', description: 'عصير فواكه معبأ', imageUrl: img('juice-carton') },
  { id: 'sm-energy', businessType: 'supermarket', category: 'مياه ومشروبات', name: 'مشروب طاقة', unit: 'كان', description: 'مشروب طاقة معلب', imageUrl: img('energy-drink-can') },

  { id: 'sm-milk-1l', businessType: 'supermarket', category: 'ألبان وبيض', name: 'لبن كامل الدسم', unit: '1 لتر', description: 'لبن معبأ كامل الدسم', imageUrl: img('milk-carton') },
  { id: 'sm-yogurt', businessType: 'supermarket', category: 'ألبان وبيض', name: 'زبادي', unit: 'علبة', description: 'علبة زبادي', imageUrl: img('yogurt-cup') },
  { id: 'sm-cheese-white', businessType: 'supermarket', category: 'ألبان وبيض', name: 'جبنة بيضاء', unit: 'عبوة', description: 'جبنة بيضاء معبأة', imageUrl: img('white-cheese') },
  { id: 'sm-cheddar', businessType: 'supermarket', category: 'ألبان وبيض', name: 'جبنة شيدر', unit: 'عبوة', description: 'شرائح أو قالب جبنة شيدر', imageUrl: img('cheddar-cheese') },
  { id: 'sm-eggs-30', businessType: 'supermarket', category: 'ألبان وبيض', name: 'طبق بيض', unit: '30 بيضة', description: 'طبق بيض كامل', imageUrl: img('egg-tray') },
  { id: 'sm-butter', businessType: 'supermarket', category: 'ألبان وبيض', name: 'زبدة', unit: 'عبوة', description: 'زبدة معبأة', imageUrl: img('butter-pack') },

  { id: 'sm-rice-1k', businessType: 'supermarket', category: 'بقالة أساسية', name: 'أرز أبيض', unit: '1 كجم', description: 'أرز أبيض معبأ', imageUrl: img('rice-bag') },
  { id: 'sm-sugar-1k', businessType: 'supermarket', category: 'بقالة أساسية', name: 'سكر أبيض', unit: '1 كجم', description: 'سكر أبيض معبأ', imageUrl: img('sugar-bag') },
  { id: 'sm-oil-1l', businessType: 'supermarket', category: 'بقالة أساسية', name: 'زيت طعام', unit: '1 لتر', description: 'زيت طعام نباتي', imageUrl: img('cooking-oil-bottle') },
  { id: 'sm-pasta', businessType: 'supermarket', category: 'بقالة أساسية', name: 'مكرونة', unit: '400 جم', description: 'مكرونة جافة معبأة', imageUrl: img('pasta-package') },
  { id: 'sm-flour', businessType: 'supermarket', category: 'بقالة أساسية', name: 'دقيق', unit: '1 كجم', description: 'دقيق أبيض معبأ', imageUrl: img('flour-bag') },
  { id: 'sm-tea', businessType: 'supermarket', category: 'بقالة أساسية', name: 'شاي', unit: 'عبوة', description: 'عبوة شاي', imageUrl: img('tea-box') },
  { id: 'sm-coffee', businessType: 'supermarket', category: 'بقالة أساسية', name: 'قهوة', unit: 'عبوة', description: 'قهوة معبأة', imageUrl: img('coffee-package') },
  { id: 'sm-tomato-paste', businessType: 'supermarket', category: 'بقالة أساسية', name: 'صلصة طماطم', unit: 'عبوة', description: 'صلصة طماطم جاهزة', imageUrl: img('tomato-paste-can') },

  { id: 'sm-chips', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'شيبسي', unit: 'كيس', description: 'كيس رقائق بطاطس', imageUrl: img('potato-chips-bag') },
  { id: 'sm-biscuit', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'بسكويت', unit: 'عبوة', description: 'بسكويت معبأ', imageUrl: img('biscuit-package') },
  { id: 'sm-chocolate', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'شوكولاتة', unit: 'قطعة', description: 'لوح شوكولاتة', imageUrl: img('chocolate-bar') },
  { id: 'sm-candy', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'حلوى', unit: 'عبوة', description: 'حلوى معبأة', imageUrl: img('candy-package') },
  { id: 'sm-popcorn', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'فشار جاهز', unit: 'كيس', description: 'فشار معبأ', imageUrl: img('popcorn-bag') },
  { id: 'sm-gum', businessType: 'supermarket', category: 'سناكس وحلويات', name: 'لبان', unit: 'عبوة', description: 'علكة معبأة', imageUrl: img('chewing-gum-pack') },

  { id: 'sm-detergent', businessType: 'supermarket', category: 'منظفات منزلية', name: 'مسحوق غسيل', unit: 'عبوة', description: 'مسحوق غسيل ملابس', imageUrl: img('laundry-detergent') },
  { id: 'sm-dish', businessType: 'supermarket', category: 'منظفات منزلية', name: 'سائل غسيل أطباق', unit: 'عبوة', description: 'سائل تنظيف الأطباق', imageUrl: img('dish-soap') },
  { id: 'sm-floor', businessType: 'supermarket', category: 'منظفات منزلية', name: 'منظف أرضيات', unit: 'عبوة', description: 'سائل تنظيف وتعطير الأرضيات', imageUrl: img('floor-cleaner') },
  { id: 'sm-bleach', businessType: 'supermarket', category: 'منظفات منزلية', name: 'مبيض ومنظف', unit: 'عبوة', description: 'مبيض ومنظف منزلي', imageUrl: img('bleach-bottle') },
  { id: 'sm-tissue', businessType: 'supermarket', category: 'منظفات منزلية', name: 'مناديل ورقية', unit: 'عبوة', description: 'مناديل ورقية منزلية', imageUrl: img('tissue-box') },
  { id: 'sm-trashbags', businessType: 'supermarket', category: 'منظفات منزلية', name: 'أكياس قمامة', unit: 'رول', description: 'رول أكياس قمامة', imageUrl: img('trash-bags-roll') },

  { id: 'sm-frozen-veg', businessType: 'supermarket', category: 'مجمدات', name: 'خضار مجمد', unit: 'كيس', description: 'كيس خضار مجمد', imageUrl: img('frozen-vegetables') },
  { id: 'sm-frozen-fries', businessType: 'supermarket', category: 'مجمدات', name: 'بطاطس مجمدة', unit: 'كيس', description: 'بطاطس نصف مقلية مجمدة', imageUrl: img('frozen-fries') },
  { id: 'sm-frozen-burger', businessType: 'supermarket', category: 'مجمدات', name: 'برجر مجمد', unit: 'عبوة', description: 'برجر مجمد جاهز للطهي', imageUrl: img('frozen-burger') },
  { id: 'sm-icecream', businessType: 'supermarket', category: 'مجمدات', name: 'آيس كريم', unit: 'عبوة', description: 'آيس كريم معبأ', imageUrl: img('ice-cream-cup') },

  { id: 'sm-soap', businessType: 'supermarket', category: 'عناية شخصية', name: 'صابونة', unit: 'قطعة', description: 'صابونة عناية شخصية', imageUrl: img('soap-bar') },
  { id: 'sm-shampoo', businessType: 'supermarket', category: 'عناية شخصية', name: 'شامبو', unit: 'عبوة', description: 'شامبو للشعر', imageUrl: img('shampoo-bottle') },
  { id: 'sm-toothpaste', businessType: 'supermarket', category: 'عناية شخصية', name: 'معجون أسنان', unit: 'عبوة', description: 'معجون أسنان', imageUrl: img('toothpaste') },
  { id: 'sm-deodorant', businessType: 'supermarket', category: 'عناية شخصية', name: 'مزيل عرق', unit: 'عبوة', description: 'مزيل عرق', imageUrl: img('deodorant') },
  { id: 'sm-diapers', businessType: 'supermarket', category: 'عناية شخصية', name: 'حفاضات أطفال', unit: 'باكت', description: 'باكت حفاضات أطفال', imageUrl: img('baby-diapers') },

  // ========================= COSMETICS =========================
  { id: 'co-shampoo', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'شامبو', unit: 'عبوة', description: 'شامبو للعناية اليومية بالشعر', imageUrl: img('premium-shampoo') },
  { id: 'co-conditioner', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'بلسم', unit: 'عبوة', description: 'بلسم لترطيب الشعر', imageUrl: img('hair-conditioner') },
  { id: 'co-hair-oil', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'زيت شعر', unit: 'عبوة', description: 'زيت لتغذية وترطيب الشعر', imageUrl: img('hair-oil') },
  { id: 'co-hair-mask', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'ماسك شعر', unit: 'عبوة', description: 'ماسك عناية عميقة للشعر', imageUrl: img('hair-mask') },
  { id: 'co-serum-hair', businessType: 'cosmetics', category: 'العناية بالشعر', name: 'سيروم شعر', unit: 'عبوة', description: 'سيروم لمعان وحماية الشعر', imageUrl: img('hair-serum') },

  { id: 'co-face-wash', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'غسول وجه', unit: 'عبوة', description: 'غسول لتنظيف البشرة', imageUrl: img('face-wash') },
  { id: 'co-moisturizer', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'مرطب', unit: 'عبوة', description: 'كريم أو جل ترطيب للبشرة', imageUrl: img('face-moisturizer') },
  { id: 'co-sunscreen', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'واقي شمس', unit: 'عبوة', description: 'واقي شمس للبشرة', imageUrl: img('sunscreen') },
  { id: 'co-serum', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'سيروم بشرة', unit: 'عبوة', description: 'سيروم عناية مركز للبشرة', imageUrl: img('face-serum') },
  { id: 'co-toner', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'تونر', unit: 'عبوة', description: 'تونر للعناية بالبشرة', imageUrl: img('face-toner') },
  { id: 'co-micellar', businessType: 'cosmetics', category: 'العناية بالبشرة', name: 'مياه ميسيلار', unit: 'عبوة', description: 'مزيل مكياج ومنظف للبشرة', imageUrl: img('micellar-water') },

  { id: 'co-lipstick', businessType: 'cosmetics', category: 'مكياج', name: 'روج', unit: 'قطعة', description: 'أحمر شفاه بدرجات متنوعة', imageUrl: img('lipstick') },
  { id: 'co-mascara', businessType: 'cosmetics', category: 'مكياج', name: 'ماسكارا', unit: 'قطعة', description: 'ماسكارا للرموش', imageUrl: img('mascara') },
  { id: 'co-foundation', businessType: 'cosmetics', category: 'مكياج', name: 'فاونديشن', unit: 'عبوة', description: 'كريم أساس بدرجات متنوعة', imageUrl: img('foundation-makeup') },
  { id: 'co-concealer', businessType: 'cosmetics', category: 'مكياج', name: 'كونسيلر', unit: 'عبوة', description: 'خافي عيوب بدرجات متنوعة', imageUrl: img('concealer-makeup') },
  { id: 'co-powder', businessType: 'cosmetics', category: 'مكياج', name: 'بودرة وجه', unit: 'علبة', description: 'بودرة تثبيت للوجه', imageUrl: img('face-powder-makeup') },
  { id: 'co-eyeliner', businessType: 'cosmetics', category: 'مكياج', name: 'آيلاينر', unit: 'قطعة', description: 'محدد عيون', imageUrl: img('eyeliner') },
  { id: 'co-blush', businessType: 'cosmetics', category: 'مكياج', name: 'بلاشر', unit: 'علبة', description: 'أحمر خدود بدرجات مختلفة', imageUrl: img('blush-makeup') },

  { id: 'co-perfume-women', businessType: 'cosmetics', category: 'عطور', name: 'برفان حريمي', unit: 'زجاجة', description: 'عطر نسائي', imageUrl: img('women-perfume') },
  { id: 'co-perfume-men', businessType: 'cosmetics', category: 'عطور', name: 'برفان رجالي', unit: 'زجاجة', description: 'عطر رجالي', imageUrl: img('men-perfume') },
  { id: 'co-body-splash', businessType: 'cosmetics', category: 'عطور', name: 'بودي سبلاش', unit: 'زجاجة', description: 'معطر جسم خفيف', imageUrl: img('body-splash') },
  { id: 'co-body-mist', businessType: 'cosmetics', category: 'عطور', name: 'بودي ميست', unit: 'زجاجة', description: 'رذاذ معطر للجسم', imageUrl: img('body-mist') },

  { id: 'co-body-lotion', businessType: 'cosmetics', category: 'العناية بالجسم', name: 'لوشن جسم', unit: 'عبوة', description: 'لوشن ترطيب للجسم', imageUrl: img('body-lotion') },
  { id: 'co-shower-gel', businessType: 'cosmetics', category: 'العناية بالجسم', name: 'شاور جل', unit: 'عبوة', description: 'جل استحمام', imageUrl: img('shower-gel') },
  { id: 'co-hand-cream', businessType: 'cosmetics', category: 'العناية بالجسم', name: 'كريم يدين', unit: 'عبوة', description: 'كريم لترطيب اليدين', imageUrl: img('hand-cream') },
  { id: 'co-body-scrub', businessType: 'cosmetics', category: 'العناية بالجسم', name: 'سكراب جسم', unit: 'عبوة', description: 'مقشر للجسم', imageUrl: img('body-scrub') },

  { id: 'co-nail-polish', businessType: 'cosmetics', category: 'الأظافر', name: 'طلاء أظافر', unit: 'زجاجة', description: 'طلاء أظافر بدرجات مختلفة', imageUrl: img('nail-polish') },
  { id: 'co-nail-remover', businessType: 'cosmetics', category: 'الأظافر', name: 'مزيل طلاء أظافر', unit: 'عبوة', description: 'مزيل طلاء للأظافر', imageUrl: img('nail-polish-remover') },
  { id: 'co-nail-file', businessType: 'cosmetics', category: 'الأظافر', name: 'مبرد أظافر', unit: 'قطعة', description: 'مبرد للعناية بالأظافر', imageUrl: img('nail-file') },
]
