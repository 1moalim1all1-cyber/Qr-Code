import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { QrCode } from 'lucide-react'
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
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center mb-3">
            <QrCode className="text-saffron" size={22} />
          </div>
          <h1 className="font-display text-2xl font-semibold">تسجيل الدخول</h1>
          <p className="text-stone text-sm mt-1">إدارة منيو مطعمك من مكان واحد</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="رقم الهاتف"
            type="tel"
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
          {serverError && <p className="text-sm text-sumac">{serverError}</p>}
          <Button type="submit" loading={isSubmitting} className="w-full mt-2">
            دخول
          </Button>
        </form>

        <p className="text-center text-sm text-stone mt-6">
          لسه معملتش حساب؟{' '}
          <Link to="/register" className="text-saffron-dim font-medium hover:underline">
            أنشئ حساب مطعمك
          </Link>
        </p>
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
