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
      <div className="mx-auto min-h-[100dvh] w-full lg:flex lg:max-w-7xl lg:items-center lg:p-5">
        <div className="min-h-[100dvh] w-full bg-white lg:grid lg:min-h-0 lg:grid-cols-[0.95fr_1.05fr] lg:overflow-hidden lg:rounded-[34px] lg:border lg:border-black/5 lg:shadow-[0_28px_90px_rgba(0,0,0,.12)]">
          <aside className="relative hidden overflow-hidden bg-[#11120f] p-8 text-white lg:flex lg:min-h-[680px] lg:flex-col lg:justify-between xl:p-11">
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

          <main className="flex min-h-[100dvh] items-start justify-center bg-[#f7f3ed] px-3 py-4 sm:items-center sm:px-6 sm:py-8 lg:min-h-0 lg:bg-white lg:px-12 xl:px-16">
            <div className="w-full max-w-sm sm:max-w-md">
              <div className="mb-5 flex items-center justify-between lg:hidden">
                <Link to="/" className="inline-flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171714] text-[#d7b66f]"><QrCode size={20} /></div>
                  <div>
                    <div className="font-display text-base font-black">Egy Menu</div>
                    <div className="text-[9px] text-stone">إدارة متجرك بسهولة</div>
                  </div>
                </Link>
                <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-stone" aria-label="العودة للرئيسية"><ArrowLeft size={16} /></Link>
              </div>

              <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_12px_35px_rgba(0,0,0,.06)] sm:p-7 lg:rounded-none lg:border-0 lg:p-0 lg:shadow-none">
                <div className="mb-5 sm:mb-7">
                  <p className="text-[11px] font-bold text-[#8d7444] sm:text-xs">أهلاً بيك تاني</p>
                  <h1 className="mt-1.5 font-display text-2xl font-black text-[#171714] sm:mt-2 sm:text-4xl">تسجيل الدخول</h1>
                  <p className="mt-1.5 text-xs leading-5 text-stone sm:mt-2 sm:text-sm sm:leading-6">ادخل رقم الهاتف وكلمة المرور علشان تفتح لوحة التحكم.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5 sm:gap-4">
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
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm sm:leading-6">{serverError}</div>
                  )}

                  <Button type="submit" loading={isSubmitting} className="mt-1 min-h-12 w-full text-base">
                    دخول
                  </Button>
                </form>

                <div className="mt-4 rounded-xl bg-[#f7f3ec] px-3 py-3 text-center text-xs leading-5 text-stone sm:mt-6 sm:rounded-2xl sm:p-4 sm:text-sm">
                  لسه معملتش حساب؟{' '}
                  <Link to="/register" className="font-bold text-[#8d7444] hover:underline">أنشئ متجرك وجرب 72 ساعة مجانًا</Link>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-stone/80 sm:text-xs lg:hidden">
                <CheckCircle2 size={13} className="text-[#758060]" /> مناسب للموبايل والتابلت والكمبيوتر
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
