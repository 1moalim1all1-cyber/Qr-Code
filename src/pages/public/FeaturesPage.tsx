import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, QrCode, Search, ShoppingBag, Store, Tags } from 'lucide-react'

const features = [
  { icon: Store, title: 'كتالوج على شكل متجر', text: 'أقسام ومنتجات وصور ومواصفات بشكل واضح وسهل للعميل.' },
  { icon: QrCode, title: 'QR ورابط مباشر', text: 'شارك متجرك على واتساب والسوشيال أو اطبع QR في المحل.' },
  { icon: ShoppingBag, title: 'اختيارات المنتج', text: 'اعرض اللون والمقاس والسعة والسعر والاختيارات المختلفة.' },
  { icon: BarChart3, title: 'لوحة تحكم بسيطة', text: 'ضيف وعدل المنتجات والأسعار والعروض من مكان واحد.' },
  { icon: Search, title: 'بحث وفلاتر', text: 'خلي العميل يوصل للمنتج بسرعة حسب القسم أو الاسم.' },
  { icon: Tags, title: 'خصومات وعروض', text: 'اعرض السعر الحالي والسعر قبل الخصم والعروض بشكل واضح.' },
]

export default function FeaturesPage() {
  return <div className="min-h-screen bg-[#f1ede6] text-[#171714]" dir="rtl">
    <header className="bg-[#0d0f0c] text-white"><div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between"><Link to="/" className="font-display font-black flex items-center gap-2"><QrCode className="text-[#d7b66f]"/> Egy Menu</Link><Link to="/" className="text-sm text-white/65 flex items-center gap-2"><ArrowRight size={16}/> الرئيسية</Link></div></header>
    <main className="max-w-6xl mx-auto px-5 py-12 sm:py-16"><p className="text-[#8d7444] text-sm font-bold">المميزات</p><h1 className="font-display text-3xl sm:text-5xl font-black mt-2">كل اللي تحتاجه لعرض منتجاتك</h1><p className="mt-4 text-stone leading-7 max-w-2xl">بدل إرسال الصور والأسعار كل مرة، خلى العميل يشوف الكتالوج كامل بنفسه.</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">{features.map((item) => <div key={item.title} className="rounded-[24px] bg-white border border-black/5 p-5 shadow-sm"><div className="w-11 h-11 rounded-2xl bg-[#d7b66f]/20 text-[#8d7444] flex items-center justify-center"><item.icon size={20}/></div><h2 className="font-display font-bold text-xl mt-4">{item.title}</h2><p className="text-sm text-stone leading-6 mt-2">{item.text}</p></div>)}</div><div className="text-center mt-10"><Link to="/register?src=features-page" className="inline-flex rounded-2xl bg-[#171714] text-white px-6 py-3 font-bold">ابدأ 72 ساعة مجانًا</Link></div></main>
  </div>
}
