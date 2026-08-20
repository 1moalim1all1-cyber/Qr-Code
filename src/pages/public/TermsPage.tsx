import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-stone-light/30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <span className="font-display font-semibold">الشروط والأحكام</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10 prose-sm text-stone leading-relaxed space-y-5">
        <p>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">1. استخدام المنصة</h2>
          <p>
            Egy Menu منصة لإنشاء منيو إلكتروني وإدارة طلبات المطاعم والكافيهات. باستخدامك المنصة، إنت موافق على
            إنك هتستخدمها بشكل قانوني ومسؤول، ومش هتحاول تضر بالمنصة أو بمستخدمين تانيين.
          </p>
        </section>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">2. حسابات المطاعم</h2>
          <p>
            إنت مسؤول عن دقة البيانات اللي بتدخلها (أسماء الأصناف، الأسعار، الصور). المنصة مش مسؤولة عن أي خطأ في
            البيانات اللي صاحب المطعم أدخلها بنفسه.
          </p>
        </section>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">3. الطلبات</h2>
          <p>
            الطلبات اللي بتتعمل من خلال المنصة بتتوصل مباشرة للمطعم. المنصة مش طرف في عملية البيع أو الدفع أو
            التوصيل — دي مسؤولية المطعم نفسه بالكامل.
          </p>
        </section>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">4. الاشتراكات والدفع</h2>
          <p>
            الباقات المجانية والمدفوعة موضّحة داخل المنصة. أي رسوم مدفوعة غير قابلة للاسترجاع إلا في حالات استثنائية
            بيحددها فريق الدعم.
          </p>
        </section>

        <section>
          <h2 className="font-display text-ink font-semibold mb-2">5. التعديلات</h2>
          <p>ممكن نعدّل الشروط دي من وقت للتاني، وهنعلن أي تغيير مهم من خلال المنصة.</p>
        </section>
      </main>
    </div>
  )
}
