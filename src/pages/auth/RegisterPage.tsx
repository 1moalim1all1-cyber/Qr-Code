import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { QrCode } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { phoneRegisterSchema, type PhoneRegisterForm } from '@/lib/validation'
import { signUpWithPhone } from '@/services/auth'
import { createRestaurant } from '@/services/restaurants'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PhoneRegisterForm>({ resolver: zodResolver(phoneRegisterSchema) })

  async function onSubmit(values: PhoneRegisterForm) {
    setServerError(null)
    try {
      const user = await signUpWithPhone(values.phone, values.password, values.fullName)
      await createRestaurant(user.uid, values.restaurantName)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? translateAuthError(err.message) : 'حصل خطأ، حاول تاني')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center mb-3">
            <QrCode className="text-saffron" size={22} />
          </div>
          <h1 className="font-display text-2xl font-semibold">أنشئ حساب مطعمك</h1>
          <p className="text-stone text-sm mt-1">دقيقتين وتبدأ تبني منيوك</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="اسمك بالكامل" error={errors.fullName?.message} {...register('fullName')} />
          <Input
            label="اسم المطعم أو الكافيه"
            error={errors.restaurantName?.message}
            {...register('restaurantName')}
          />
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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="تأكيد كلمة المرور"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          {serverError && <p className="text-sm text-sumac">{serverError}</p>}
          <Button type="submit" loading={isSubmitting} className="w-full mt-2">
            إنشاء الحساب
          </Button>
        </form>

        <p className="text-center text-sm text-stone mt-6">
          عندك حساب بالفعل؟{' '}
          <Link to="/login" className="text-saffron-dim font-medium hover:underline">
            سجّل دخولك
          </Link>
        </p>
      </div>
    </div>
  )
}

function translateAuthError(message: string) {
  if (message.includes('auth/email-already-in-use')) return 'رقم الهاتف ده مسجّل بحساب بالفعل'
  if (message.includes('auth/weak-password')) return 'كلمة المرور ضعيفة، جرّب كلمة أقوى'
  return message
}
