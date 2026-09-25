import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BarChart3, CheckCircle2, MousePointerClick, Store, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listSiteAnalytics, type SiteAnalyticsRecord } from '@/services/siteAnalytics'

const EVENT_LABELS: Record<string, string> = {
  register_started: 'بدأ التسجيل',
  register_step_2: 'وصل للخطوة 2',
  register_step_3: 'وصل للخطوة 3',
  register_completed: 'أنشأ الحساب',
  register_failed: 'فشل التسجيل',
  homepage_cta_click: 'ضغط زر تسجيل من الرئيسية',
  homepage_demo_click: 'فتح متجر تجريبي',
  homepage_whatsapp_click: 'ضغط واتساب من الرئيسية',
  business_type_cta_click: 'بدأ من نوع نشاط',
}

function detailsValue(record: SiteAnalyticsRecord, key: string) {
  const value = record.details?.[key]
  return typeof value === 'string' ? value : ''
}

export default function AdminAnalyticsPage() {
  const [records, setRecords] = useState<SiteAnalyticsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listSiteAnalytics()
      .then(setRecords)
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر تحميل التحليلات'))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const count = (event: string) => records.filter((item) => item.event === event).length
    const started = count('register_started')
    const step2 = count('register_step_2')
    const step3 = count('register_step_3')
    const completed = count('register_completed')
    const failed = count('register_failed')
    const homepageClicks = count('homepage_cta_click')
    const demoClicks = count('homepage_demo_click')
    const whatsappClicks = count('homepage_whatsapp_click')
    const businessTypeClicks = count('business_type_cta_click')

    const rate = (value: number, base: number) => base > 0 ? Math.round((value / base) * 100) : 0

    const sourceCounts = new Map<string, number>()
    records.filter((item) => item.event === 'homepage_cta_click').forEach((item) => {
      const source = detailsValue(item, 'source') || item.source || 'homepage'
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1)
    })

    const businessTypeCounts = new Map<string, number>()
    records.filter((item) => item.event === 'business_type_cta_click').forEach((item) => {
      const businessType = detailsValue(item, 'businessType') || 'unknown'
      businessTypeCounts.set(businessType, (businessTypeCounts.get(businessType) || 0) + 1)
    })

    return {
      started,
      step2,
      step3,
      completed,
      failed,
      homepageClicks,
      demoClicks,
      whatsappClicks,
      businessTypeClicks,
      step2Rate: rate(step2, started),
      step3Rate: rate(step3, started),
      completionRate: rate(completed, started),
      sources: Array.from(sourceCounts.entries()).sort((a, b) => b[1] - a[1]),
      businessTypes: Array.from(businessTypeCounts.entries()).sort((a, b) => b[1] - a[1]),
    }
  }, [records])

  const funnel = [
    { label: 'بدأ التسجيل', value: stats.started, rate: 100 },
    { label: 'وصل للخطوة 2', value: stats.step2, rate: stats.step2Rate },
    { label: 'وصل للخطوة 3', value: stats.step3, rate: stats.step3Rate },
    { label: 'أنشأ الحساب', value: stats.completed, rate: stats.completionRate },
  ]

  return (
    <div className="min-h-screen bg-[#f4efe7]" dir="rtl">
      <header className="bg-[#11120f] text-white border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-xs text-white/45">Egy Menu Analytics</p>
            <h1 className="mt-1 font-display text-2xl font-bold">تحليلات التسجيل والتحويل</h1>
          </div>
          <Link to="/admin" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"><ArrowRight size={16} /> رجوع للإدارة</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7">
        {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="py-16 text-center text-stone">جارِ تحميل التحليلات...</div> : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric icon={Users} label="بدأوا التسجيل" value={stats.started} />
              <Metric icon={CheckCircle2} label="تم إنشاء حساب" value={stats.completed} highlight />
              <Metric icon={MousePointerClick} label="ضغطات التسجيل من الرئيسية" value={stats.homepageClicks} />
              <Metric icon={BarChart3} label="نسبة الإكمال" value={`${stats.completionRate}%`} />
            </div>

            <section className="mt-6 rounded-[28px] bg-[#11120f] p-5 text-white sm:p-7">
              <div className="mb-5 flex items-center gap-2"><BarChart3 size={20} className="text-[#d7b66f]" /><div><h2 className="font-display text-xl font-bold">Funnel التسجيل</h2><p className="mt-1 text-xs text-white/45">بيوضح الناس بتخرج من أنهي خطوة.</p></div></div>
              <div className="grid gap-4 md:grid-cols-4">
                {funnel.map((item, index) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-2"><span className="text-xs text-white/45">0{index + 1}</span><strong className="text-2xl text-[#ead19a]">{item.value}</strong></div>
                    <div className="mt-3 font-semibold">{item.label}</div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-[#d7b66f]" style={{ width: `${Math.min(100, item.rate)}%` }} /></div>
                    <div className="mt-2 text-xs text-white/40">{item.rate}% من اللي بدأوا</div>
                  </div>
                ))}
              </div>
              {stats.failed > 0 && <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">محاولات تسجيل فشلت: <b>{stats.failed}</b></div>}
            </section>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <ReportCard title="تفاعل الرئيسية" rows={[
                ['ضغط تسجيل', stats.homepageClicks],
                ['فتح متجر تجريبي', stats.demoClicks],
                ['ضغط واتساب', stats.whatsappClicks],
                ['بدأ من نوع نشاط', stats.businessTypeClicks],
              ]} />
              <ReportCard title="مصادر أزرار التسجيل" rows={stats.sources.length ? stats.sources : [['لسه مفيش بيانات', 0]]} />
              <ReportCard title="أنواع النشاط الأكثر ضغطًا" rows={stats.businessTypes.length ? stats.businessTypes : [['لسه مفيش بيانات', 0]]} />
            </div>

            <section className="mt-6 rounded-[28px] border border-black/5 bg-white p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold">آخر البيانات المسجلة</h2>
              <div className="mt-4 grid gap-2">
                {records.length === 0 ? <p className="text-sm text-stone">مفيش أحداث مسجلة لسه.</p> : records.slice(-20).reverse().map((item) => (
                  <div key={item.id} className="flex flex-col gap-1 rounded-xl bg-[#f7f3ec] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-semibold">{EVENT_LABELS[item.event] || item.event}</span>
                    <span className="text-xs text-stone">{item.path || '—'}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function Metric({ icon: Icon, label, value, highlight = false }: { icon: typeof Store; label: string; value: string | number; highlight?: boolean }) {
  return <div className={`rounded-2xl border p-5 ${highlight ? 'border-[#d7b66f]/35 bg-[#fff8e9]' : 'border-black/5 bg-white'}`}><Icon size={20} className="mb-3 text-[#7b765e]" /><div className="font-display text-3xl font-black">{value}</div><div className="mt-1 text-sm text-stone">{label}</div></div>
}

function ReportCard({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  const max = Math.max(1, ...rows.map(([, value]) => value))
  return <section className="rounded-[26px] border border-black/5 bg-white p-5"><h3 className="font-display font-bold">{title}</h3><div className="mt-4 space-y-3">{rows.map(([label, value]) => <div key={label}><div className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-stone">{label}</span><b>{value}</b></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#eee8df]"><div className="h-full rounded-full bg-[#85724d]" style={{ width: `${Math.round((value / max) * 100)}%` }} /></div></div>)}</div></section>
}
