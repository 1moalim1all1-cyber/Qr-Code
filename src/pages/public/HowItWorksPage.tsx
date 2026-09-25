import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, QrCode } from 'lucide-react'

const steps = [
  ['1', 'سجّل نشاطك', 'اختار نوع النشاط واكتب اسم المتجر وبيانات الدخول.'],
  ['2', 'ضيف الأقسام والمنتجات', 'ضيف الصور والأسعار والمواصفات والاختيارات اللي تناسب نشاطك.'],
  ['3', 'شارك الرابط أو QR', 'العميل يفتح المتجر من أي موبايل بدون تطبيق ويشوف المنتجات مباشرة.'],
]

export default function HowItWorksPage() {
  return <div className="min-h-screen bg-[#0d0f0c] text-white" dir="rtl">
    <header className="border-b border-white/10"><div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between"><Link to="/" className="font-display font-black flex items-center gap-2"><QrCode className="text-[#d7b66f]"/> Egy Menu</Link><Link to="/" className="text-sm text-white/65 flex items-center gap-2"><ArrowRight size={16}/> الرئيسية</Link></div></header>
    <main className="max-w-5xl mx-auto px-5 py-12 sm:py-16"><p className="text-[#d7b66f] text-sm font-bold">طريقة العمل</p><h1 className="font-display text-3xl sm:text-5xl font-black mt-2">3 خطوات ومتجرك يبقى جاهز</h1><div className="grid md:grid-cols-3 gap-4 mt-10">{steps.map(([n,title,text]) => <div key={n} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6"><div className="w-12 h-12 rounded-2xl bg-[#d7b66f] text-[#171714] flex items-center justify-center text-xl font-black">{n}</div><h2 className="font-display text-xl font-bold mt-5">{title}</h2><p className="text-sm text-white/50 leading-7 mt-2">{text}</p></div>)}</div><div className="mt-10 rounded-[24px] border border-[#d7b66f]/20 bg-[#d7b66f]/10 p-5"><div className="flex items-center gap-2 font-bold text-[#efd59d]"><CheckCircle2 size={18}/> 72 ساعة تجربة مجانية</div><p className="text-sm text-white/55 mt-2">بدون بطاقة بنكية، وتقدر تعدّل منتجاتك في أي وقت.</p></div><div className="mt-8"><Link to="/register?src=how-page" className="inline-flex rounded-2xl bg-[#d7b66f] text-[#171714] px-6 py-3 font-black">ابدأ دلوقتي</Link></div></main>
  </div>
}
