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
    <div className="login-page min-h-[100dvh] bg-[#f2ede5]" dir="rtl">
      <style>{`
        .login-shell { min-height: 100dvh; width: 100%; }
        .login-card { min-height: 100dvh; width: 100%; background: #fff; }
        .login-desktop-panel { display: none !important; }
        .login-mobile-head { display: flex !important; }
        .login-main { min-height: 100dvh; background: #f7f3ed; padding: 16px 12px; display:flex; align-items:flex-start; justify-content:center; }
        .login-form-card { border-radius: 24px; border:1px solid rgba(0,0,0,.05); background:#fff; padding:16px; box-shadow:0 12px 35px rgba(0,0,0,.06); }

        @media (min-width: 900px) and (hover: hover) and (pointer: fine) {
          .login-shell { min-height:100dvh; max-width:1280px; margin:0 auto; padding:20px; display:flex; align-items:center; }
          .login-card { min-height:0; display:grid; grid-template-columns:.95fr 1.05fr; overflow:hidden; border-radius:34px; border:1px solid rgba(0,0,0,.05); box-shadow:0 28px 90px rgba(0,0,0,.12); }
          .login-desktop-panel { display:flex !important; }
          .login-mobile-head { display:none !important; }
          .login-main { min-height:680px; background:#fff; padding:48px; align-items:center; }
          .login-form-card { border:0; border-radius:0; padding:0; box-shadow:none; }
        }
      `}</style>

      <div className="login-shell">
        <div className="login-card">
          <aside className="login-desktop-panel relative min-h-[680px] overflow-hidden bg-[#11120f] p-8 text-white flex-col justify-between xl:p-11">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#788465]/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#d7b66f]/15 blur-3xl" />

            <div className="relative">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7b66f] text-[#171714] shadow-lg"><QrCode size={23} /></div>
                <div><div className="font-display text-xl font-black">Egy Menu</div><div className="mt-0.5 text-[10px] tracking-[0.17em] text-white/40">SMART PRODUCT CATALOG</div></div>
              </Link>

              <div className="mt-14 max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d7b66f]/20 bg-[#d7b66f]/10 px-3 py-1.5 text-xs font-semibold text-[#ead19a]"><ShieldCheck size={14} /> لوحة التحكم الخاصة بنشاطك</span>
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

            <div className="relative mt-8 flex items-center gap-2 text-xs text-white/35"><CheckCircle2 size={14} className="text-[#8da274]" /> مناسب للموبايل والكمبيوتر والتابلت</div>
          </aside>

          <main className="login-main">
            <div className="w-full max-w-md">
              <div className="login-mobile-head mb-5 items-center justify-between">
                <Link to="/" className="inline-flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171714] text-[#d7b66f]"><QrCode size={20} /></div>
                  <div><div className="font-display text-base font-black">Egy Menu</div><div className="text-[9px] text-stone">إدارة متجرك بسهولة</div></div>
                </Link>
                <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-stone" aria-label="العودة للرئيسية"><ArrowLeft size={16} /></Link>
              </div>

              <div className="login-form-card">
                <div className="mb-5 sm:mb-7">
                  <p className="text-[11px] font-bold text-[#8d7444] sm:text-xs">أهلاً بيك تاني</p>
                  <h1 className="mt-1.5 font-display text-2xl font-black text-[#171714] sm:mt-2 sm:text-4xl">تسجيل الدخول</h1>
                  <p className="mt-1.5 text-xs leading-5 text-stone sm:mt-2 sm:text-sm sm:leading-6">ادخل رقم الهاتف وكلمة المرور علشان تفتح لوحة التحكم.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5 sm:gap-4">
                  <Input label="رقم الهاتف" type="tel" inputMode="tel" dir="ltr" placeholder="01xxxxxxxxx" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
                  <Input label="كلمة المرور" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />

                  {serverError && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm sm:leading-6">{serverError}</div>}

                  <Button type="submit" loading={isSubmitting} className="mt-1 min-h-12 w-full text-base">دخول</Button>
                </form>

                <div className="mt-4 rounded-xl bg-[#f7f3ec] px-3 py-3 text-center text-xs leading-5 text-stone sm:mt-6 sm:rounded-2xl sm:p-4 sm:text-sm">
                  لسه معملتش حساب؟{' '}<Link to="/register" className="font-bold text-[#8d7444] hover:underline">أنشئ متجرك وجرب 72 ساعة مجانًا</Link>
                </div>
              </div>

              <div className="login-mobile-head mt-4 items-center justify-center gap-2 text-[10px] text-stone/80 sm:text-xs"><CheckCircle2 size={13} className="text-[#758060]" /> مناسب للموبايل والتابلت والكمبيوتر</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function translateAuthError(message: string) {
  if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) return 'رقم الهاتف أو كلمة المرور غير صحيحة'
  if (message.includes('auth/too-many-requests')) return 'محاولات كتير، حاول تاني بعد شوية'
  return message
}
