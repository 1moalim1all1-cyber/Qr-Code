import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, QrCode, ShieldCheck, Smartphone, Store } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { phoneLoginSchema, type PhoneLoginForm } from '@/lib/validation'
import { signInWithPhone } from '@/services/auth'

const FEATURES = [
  { icon: Store, title: 'إدارة متجرك', text: 'المنتجات والأقسام والأسعار من مكان واحد.' },
  { icon: QrCode, title: 'الرابط و QR', text: 'شارك متجرك مع عملائك في ثواني.' },
  { icon: Smartphone, title: 'يشتغل على أي جهاز', text: 'موبايل، تابلت أو كمبيوتر بدون تطبيق.' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PhoneLoginForm>({ resolver: zodResolver(phoneLoginSchema) })

  async function onSubmit(values: PhoneLoginForm) {
    setServerError(null)
    try {
      await signInWithPhone(values.phone, values.password)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? translateAuthError(err.message) : 'حصل خطأ، حاول تاني')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#f2ede5]" dir="rtl">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-7xl items-stretch lg:p-5">
        <div className="grid w-full overflow-hidden bg-white lg:grid-cols-[0.95fr_1.05fr] lg:rounded-[34px] lg:border lg:border-black/5 lg:shadow-[0_28px_90px_rgba(0,0,0,.12)]">
          <aside className="relative hidden overflow-hidden bg-[#11120f] p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-11">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#788465]/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#d7b66f]/15 blur-3xl" />

            <div className="relative">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7b66f] text-[#171714] shadow-lg">
                  <QrCode size={23} />
                </div>
                <div>
                  <div className="font-display text-xl font-black">Egy Menu</div>
                  <div className="mt-0.5 text-[10px] tracking-[0.17em] text-white/40">SMART PRODUCT CATALOG</div>
                </div>
              </Link>

              <div className="mt-14 max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d7b66f]/20 bg-[#d7b66f]/10 px-3 py-1.5 text-xs font-semibold text-[#ead19a]">
                  <ShieldCheck size={14} /> لوحة التحكم الخاصة بنشاطك
                </span>
                <h1 className="mt-5 font-display text-4xl font-black leading-[1.25] xl:text-5xl">كل شغلك قدامك<br />من مكان واحد</h1>
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/50">ادخل على حسابك وعدّل منتجاتك وأسعارك وأقسامك وشارك الكتالوج مع عملائك.</p>
              </div>

              <div className="mt-10 space-y-3">
                {FEATURES.map((feature) => (
                  <div key={feature.title} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/7 text-[#d7b66f]"><feature.icon size={18} /></div>
                    <div><p className="text-sm font-bold">{feature.title}</p><p className="mt-1 text-xs text-white/40">{feature.text}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-8 flex items-center gap-2 text-xs text-white/35">
              <CheckCircle2 size={14} className="text-[#8da274]" /> مناسب للموبايل والكمبيوتر والتابلت
            </div>
          </aside>

          <main className="flex min-h-[100dvh] items-center justify-center px-4 py-7 sm:px-7 sm:py-10 lg:min-h-0 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              <div className="mb-6 flex items-center justify-between lg:hidden">
                <Link to="/" className="inline-flex items-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#171714] text-[#d7b66f] shadow-md"><QrCode size={21} /></div>
                  <div><div className="font-display text-lg font-black">Egy Menu</div><div className="text-[9px] text-stone">متجرك في رابط واحد</div></div>
                </Link>
                <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-[#faf8f4] text-stone" aria-label="العودة للرئيسية"><ArrowLeft size={17} /></Link>
              </div>

              <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_55px_rgba(0,0,0,.07)] sm:p-7 lg:border-0 lg:p-0 lg:shadow-none">
                <div className="mb-7">
                  <p className="text-xs font-bold text-[#8d7444]">أهلاً بيك تاني</p>
                  <h1 className="mt-2 font-display text-3xl font-black text-[#171714] sm:text-4xl">تسجيل الدخول</h1>
                  <p className="mt-2 text-sm leading-6 text-stone">ادخل رقم الهاتف وكلمة المرور علشان تفتح لوحة التحكم.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <Input
                    label="رقم الهاتف"
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    placeholder="01xxxxxxxxx"
                    autoComplete="tel"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="كلمة المرور"
                    type="password"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  {serverError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{serverError}</div>
                  )}

                  <Button type="submit" loading={isSubmitting} className="mt-1 min-h-12 w-full text-base">
                    دخول
                  </Button>
                </form>

                <div className="mt-6 rounded-2xl bg-[#f7f3ec] p-4 text-center text-sm text-stone">
                  لسه معملتش حساب؟{' '}
                  <Link to="/register" className="font-bold text-[#8d7444] hover:underline">أنشئ متجرك وجرب 72 ساعة مجانًا</Link>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 lg:hidden">
                {[
                  ['📱', 'موبايل'],
                  ['💻', 'كمبيوتر'],
                  ['⚡', 'سريع'],
                ].map(([icon, label]) => (
                  <div key={label} className="rounded-2xl border border-black/5 bg-white/70 px-2 py-3 text-center">
                    <div className="text-lg">{icon}</div>
                    <div className="mt-1 text-[11px] font-semibold text-stone">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function translateAuthError(message: string) {
  if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
    return 'رقم الهاتف أو كلمة المرور غير صحيحة'
  }
  if (message.includes('auth/too-many-requests')) return 'محاولات كتير، حاول تاني بعد شوية'
  return message
}
