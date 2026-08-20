import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-stone-light/30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <span className="font-display font-semibold">سياسة الخصوصية</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10 prose-sm text-stone leading-relaxed space-y-5">
        <p>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">إيه البيانات اللي بنجمعها</h2>
          <p>
            لأصحاب المطاعم: الاسم، رقم الهاتف، وبيانات المطعم (الاسم، الصور، الأصناف). لعملاء المطاعم اللي بيمسحوا
            كود الـ QR: بيانات الطلب (اسم، رقم هاتف اختياري) لو قرروا يطلبوا، وزيارات مجهولة الهوية لإحصائيات المطعم.
          </p>
        </section>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">إزاي بنستخدم البيانات</h2>
          <p>
            بنستخدم بياناتك عشان نشغّل حسابك، نعرض منيو مطعمك للعملاء، ونوصّل الطلبات لصاحب المطعم. مش بنبيع بياناتك
            لأي طرف تالت.
          </p>
        </section>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">مين بيشوف بيانات مطعمك</h2>
          <p>
            بيانات المطعم العامة (المنيو، الأسعار) ظاهرة لأي حد يمسح الكود. بيانات الطلبات والإحصائيات ظاهرة بس لصاحب
            المطعم وفريق دعم المنصة.
          </p>
        </section>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">حقك في حذف بياناتك</h2>
          <p>تقدر تطلب حذف حسابك وكل بياناته في أي وقت من خلال التواصل معانا.</p>
        </section>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">الأمان</h2>
          <p>بياناتك متخزّنة على Firebase (Google Cloud)، بسياسات أمان بتضمن إن كل مطعم يشوف بياناته هو بس.</p>
        </section>
      </main>
    </div>
  )
}
