import { CheckCircle2, LayoutDashboard, PackagePlus, QrCode, Share2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f3eee6] px-4 py-10 sm:px-6" dir="rtl">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[34px] bg-[#11120f] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,.18)] sm:p-9">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7b66f]"><QrCode size={22} className="text-[#171714]" /></div>
            <div><div className="font-display text-xl font-black">Egy Menu</div><div className="text-xs text-white/40">تم إنشاء متجرك بنجاح</div></div>
          </div>

          <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#769060]/18 text-[#bdcda5]"><CheckCircle2 size={34} /></div>
          <h1 className="mt-5 font-display text-3xl font-black sm:text-4xl">مبروك 🎉 متجرك اتعمل</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">دلوقتي فاضلك كام خطوة بسيطة عشان تخلي المتجر جاهز وتبدأ تبعت الرابط لعملائك.</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><PackagePlus size={19} className="text-[#d7b66f]" /><div className="mt-3 font-bold">1. ضيف أول منتج</div><div className="mt-1 text-xs leading-5 text-white/40">اسم وصورة وسعر، والباقي اختياري.</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Sparkles size={19} className="text-[#d7b66f]" /><div className="mt-3 font-bold">2. ظبط شكل متجرك</div><div className="mt-1 text-xs leading-5 text-white/40">لوجو، غلاف، ألوان وترتيب الأقسام.</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Share2 size={19} className="text-[#d7b66f]" /><div className="mt-3 font-bold">3. شارك الرابط</div><div className="mt-1 text-xs leading-5 text-white/40">واتساب أو QR أو السوشيال ميديا.</div></div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link to="/dashboard/products" className="flex items-center justify-center gap-2 rounded-2xl bg-[#d7b66f] px-5 py-4 font-black text-[#171714] hover:-translate-y-0.5 transition-transform"><PackagePlus size={18} /> ضيف أول منتج دلوقتي</Link>
            <Link to="/dashboard" className="flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-4 font-bold hover:bg-white/[0.08]"><LayoutDashboard size={18} /> افتح لوحة التحكم</Link>
          </div>

          <div className="mt-6 rounded-2xl bg-[#d7b66f]/10 p-4 text-sm text-[#e6d1a2]">عندك 10 أيام تجربة مجانية. استخدمهم في تجهيز المتجر وإضافة المنتجات وتجربة الرابط مع العملاء.</div>
        </div>
      </div>
    </div>
  )
}
