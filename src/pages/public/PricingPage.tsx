import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, QrCode } from 'lucide-react'

const plans = [
  { title: '3 شهور', price: '599', text: 'مناسبة للبداية وتجربة البيع بالكتالوج' },
  { title: '6 شهور', price: '899', text: 'اختيار عملي للنشاط اللي عايز يستمر' },
  { title: 'سنة', price: '1499', text: 'الأوفر للاستمرار طول السنة', badge: 'الأوفر' },
]

export default function PricingPage() {
  return <div className="min-h-screen bg-[#f1ede6] text-[#171714]" dir="rtl">
    <header className="bg-[#0d0f0c] text-white"><div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between"><Link to="/" className="font-display font-black flex items-center gap-2"><QrCode className="text-[#d7b66f]"/> Egy Menu</Link><Link to="/" className="text-sm text-white/65 flex items-center gap-2"><ArrowRight size={16}/> الرئيسية</Link></div></header>
    <main className="max-w-6xl mx-auto px-5 py-12 sm:py-16"><p className="text-[#8d7444] text-sm font-bold">الباقات</p><h1 className="font-display text-3xl sm:text-5xl font-black mt-2">اختار مدة الاشتراك المناسبة</h1><p className="mt-4 text-stone leading-7">كل حساب جديد يبدأ بـ72 ساعة تجربة مجانية قبل الاشتراك.</p><div className="grid md:grid-cols-3 gap-4 mt-10">{plans.map((plan) => <div key={plan.title} className={`relative rounded-[28px] border p-6 bg-white shadow-sm ${plan.badge ? 'border-[#d7b66f]' : 'border-black/5'}`}>{plan.badge && <span className="absolute -top-3 right-5 rounded-full bg-[#171714] text-[#d7b66f] px-3 py-1 text-xs font-bold">{plan.badge}</span>}<h2 className="font-display text-2xl font-bold">{plan.title}</h2><div className="mt-4"><span className="text-4xl font-black">{plan.price}</span><span className="text-stone mr-1">جنيه</span></div><p className="text-sm text-stone leading-6 mt-3">{plan.text}</p><div className="mt-5 space-y-2 text-sm">{['كتالوج منتجات كامل','QR ورابط مباشر','لوحة تحكم وتعديل الأسعار'].map((x)=><div key={x} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#758060]"/>{x}</div>)}</div><Link to="/register?src=pricing-page" className="mt-6 flex justify-center rounded-2xl bg-[#171714] text-white px-5 py-3 font-bold">ابدأ 72 ساعة مجانًا</Link></div>)}</div></main>
  </div>
}
