import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { DEFAULT_SITE_SETTINGS, getSiteSettings } from '@/services/siteSettings'

export default function PrivacyPage() {
  const [policy, setPolicy] = useState(DEFAULT_SITE_SETTINGS.privacy_policy)

  useEffect(() => {
    getSiteSettings().then((settings) => setPolicy(settings.privacy_policy)).catch(() => undefined)
  }, [])

  return (
    <div className="min-h-screen bg-paper-dim" dir="rtl">
      <header className="bg-ink text-paper">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <Link to="/" className="text-paper/70 hover:text-paper transition-colors"><ArrowRight size={20} /></Link>
          <ShieldCheck size={21} className="text-saffron" />
          <span className="font-display text-xl font-semibold">سياسة الخصوصية</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="rounded-3xl bg-paper border border-stone-light/30 p-6 sm:p-8 shadow-sm">
          <p className="text-xs text-stone mb-6">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
          <div className="space-y-4 text-stone leading-8 whitespace-pre-line">{policy}</div>
          <div className="mt-8 pt-6 border-t border-stone-light/30 flex flex-wrap gap-3 text-sm">
            <Link to="/contact" className="rounded-full bg-ink text-paper px-4 py-2">تواصل معنا</Link>
            <Link to="/terms" className="rounded-full border border-stone-light/40 px-4 py-2">الشروط والأحكام</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
