import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, QrCode } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { phoneLoginSchema, type PhoneLoginForm } from '@/lib/validation'
import { signInWithPhone } from '@/services/auth'

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
    <div className="min-h-[100dvh] bg-[#f2ede5] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-10" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-lg items-center justify-center sm:min-h-[calc(100dvh-3rem)] lg:min-h-[calc(100dvh-5rem)]">
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171714] text-[#d7b66f] shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                <QrCode size={20} />
              </div>
              <div>
                <div className="font-display text-base font-black sm:text-lg">Egy Menu</div>
                <div className="text-[9px] text-stone sm:text-[10px]">إدارة متجرك بسهولة</div>
              </div>
            </Link>

            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-stone shadow-sm sm:h-10 sm:w-10"
              aria-label="العودة للرئيسية"
            >
              <ArrowLeft size={16} />
            </Link>
          </div>

          <section className="rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_14px_45px_rgba(0,0,0,.08)] sm:rounded-[30px] sm:p-7 lg:p-8">
            <div className="mb-5 sm:mb-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f3ec] px-3 py-1.5 text-[11px] font-bold text-[#8d7444] sm:text-xs">
                <CheckCircle2 size={13} /> لوحة تحكم واحدة لكل أجهزتك
              </span>
              <h1 className="mt-3 font-display text-2xl font-black text-[#171714] sm:text-4xl">تسجيل الدخول</h1>
              <p className="mt-2 text-xs leading-5 text-stone sm:text-sm sm:leading-6">ادخل رقم الهاتف وكلمة المرور علشان تفتح لوحة التحكم وتدير منتجاتك وأقسامك.</p>
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
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm sm:leading-6">
                  {serverError}
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="mt-1 min-h-12 w-full text-base">
                دخول
              </Button>
            </form>

            <div className="mt-4 rounded-xl bg-[#f7f3ec] px-3 py-3 text-center text-xs leading-5 text-stone sm:mt-6 sm:rounded-2xl sm:p-4 sm:text-sm">
              لسه معملتش حساب؟{' '}
              <Link to="/register" className="font-bold text-[#8d7444] hover:underline">أنشئ متجرك وجرب 72 ساعة مجانًا</Link>
            </div>
          </section>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-stone/80 sm:text-xs">
            <span>📱 موبايل</span>
            <span>💻 كمبيوتر</span>
            <span>📲 تابلت</span>
          </div>
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
