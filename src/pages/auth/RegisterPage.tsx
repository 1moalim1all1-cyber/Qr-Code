import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { QrCode } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { phoneRegisterSchema, type PhoneRegisterForm } from '@/lib/validation'
import { signUpWithPhone } from '@/services/auth'
import { createRestaurant } from '@/services/restaurants'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PhoneRegisterForm>({ resolver: zodResolver(phoneRegisterSchema), defaultValues: { businessType: 'restaurant' } })

  const selectedBusinessType = watch('businessType')

  useEffect(() => {
    listBusinessTypes()
      .then((items) => {
        setBusinessTypes(items)
        if (items.length > 0 && !items.some((item) => item.code === selectedBusinessType)) {
          setValue('businessType', items[0].code)
        }
      })
      .catch(() => setServerError('تعذّر تحميل أنواع الأنشطة'))
  }, [])

  async function onSubmit(values: PhoneRegisterForm) {
    setServerError(null)
    try {
      const selectedType = businessTypes.find((item) => item.code === values.businessType)
      const user = await signUpWithPhone(values.phone, values.password, values.fullName, values.restaurantName, values.businessType)
      try {
        await createRestaurant(user.uid, values.restaurantName, {
          clientName: values.fullName,
          clientContact: values.phone,
          businessType: values.businessType,
          businessTypeName: selectedType?.name,
        })
      } catch (restaurantError) {
        console.error('[RegisterPage] restaurant creation failed:', restaurantError)
      }
      navigate('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? translateAuthError(err.message) : 'حصل خطأ، حاول تاني')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center mb-3"><QrCode className="text-saffron" size={22} /></div>
          <h1 className="font-display text-2xl font-semibold">أنشئ حساب نشاطك</h1>
          <p className="text-stone text-sm mt-1 text-center">أي نشاط تجاري يقدر يعمل كتالوج رقمي وQR — 10 أيام تجربة مجانية</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="اسمك بالكامل" error={errors.fullName?.message} {...register('fullName')} />
          <div>
            <label className="block text-sm font-medium mb-1.5">نوع النشاط</label>
            <select {...register('businessType')} className="w-full rounded-xl border border-stone-light/50 bg-paper px-3 py-3 outline-none focus:border-saffron">
              {businessTypes.map((item) => <option key={item.id} value={item.code}>{item.icon || '🏪'} {item.name}</option>)}
            </select>
            {errors.businessType?.message && <p className="text-xs text-sumac mt-1">{errors.businessType.message}</p>}
          </div>
          <Input label="اسم النشاط" error={errors.restaurantName?.message} {...register('restaurantName')} />
          <Input label="رقم الهاتف" type="tel" dir="ltr" placeholder="01xxxxxxxxx" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
          <Input label="كلمة المرور" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
          <Input label="تأكيد كلمة المرور" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          {serverError && <p className="text-sm text-sumac">{serverError}</p>}
          <Button type="submit" loading={isSubmitting} className="w-full mt-2">ابدأ التجربة المجانية 10 أيام</Button>
        </form>

        <p className="text-center text-sm text-stone mt-6">عندك حساب بالفعل؟ <Link to="/login" className="text-saffron-dim font-medium hover:underline">سجّل دخولك</Link></p>
      </div>
    </div>
  )
}

function translateAuthError(message: string) {
  if (message.includes('auth/email-already-in-use')) return 'رقم الهاتف ده مسجّل بحساب بالفعل'
  if (message.includes('auth/weak-password')) return 'كلمة المرور ضعيفة، جرّب كلمة أقوى'
  return message
}
