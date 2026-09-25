import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, QrCode, Sparkles, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { phoneRegisterSchema, type PhoneRegisterForm } from '@/lib/validation'
import { signUpWithPhone } from '@/services/auth'
import { createRestaurant } from '@/services/restaurants'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'

const SUPPORT_WHATSAPP = '201039177959'
const DRAFT_KEY = 'egy-menu-register-draft-v1'
const SOURCE_KEY = 'egy-menu-register-source-v1'

const steps = [
  { number: 1, title: 'بيانات النشاط', text: 'اختار النشاط واكتب اسم المتجر' },
  { number: 2, title: 'بيانات الدخول', text: 'اسمك ورقمك وكلمة المرور' },
  { number: 3, title: 'ابدأ التجربة', text: 'راجع البيانات وأنشئ متجرك' },
]

const previewByType: Record<string, { title: string; subtitle: string; chips: string[] }> = {
  mobiles: { title: 'Smart Mobile', subtitle: 'موبايلات وإكسسوارات', chips: ['128GB', 'أسود', 'ضمان'] },
  electronics: { title: 'Tech Store', subtitle: 'إلكترونيات وأجهزة', chips: ['ماركة', 'مواصفات', 'خصم'] },
  clothing: { title: 'Style Store', subtitle: 'ملابس', chips: ['S', 'M', 'L'] },
  shoes_bags: { title: 'Fashion Store', subtitle: 'أحذية وشنط', chips: ['مقاس', 'لون', 'متاح'] },
  perfumes: { title: 'Perfume House', subtitle: 'عطور', chips: ['50ml', '100ml', 'عرض'] },
  furniture: { title: 'Home Store', subtitle: 'أثاث ومفروشات', chips: ['الخامة', 'المقاس', 'اللون'] },
  decor_finishing: { title: 'Finish Store', subtitle: 'تشطيبات وديكور', chips: ['الخامة', 'المقاس', 'السعر'] },
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])
  const [step, setStep] = useState(1)
  const [showExitOffer, setShowExitOffer] = useState(false)
  const [draftRecovered, setDraftRecovered] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PhoneRegisterForm>({
    resolver: zodResolver(phoneRegisterSchema),
    defaultValues: { businessType: 'restaurant' },
  })

  const values = watch()
  const selectedBusinessType = watch('businessType')
  const selectedType = businessTypes.find((item) => item.code === selectedBusinessType)
  const preview = previewByType[selectedBusinessType] || {
    title: values.restaurantName || 'متجرك هنا',
    subtitle: selectedType?.name || 'كتالوج منتجات احترافي',
    chips: ['صور', 'سعر', 'مواصفات'],
  }

  useEffect(() => {
    const sourceFromUrl = searchParams.get('src') || searchParams.get('source')
    if (sourceFromUrl) localStorage.setItem(SOURCE_KEY, sourceFromUrl)
  }, [searchParams])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      const typeFromUrl = searchParams.get('type')
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PhoneRegisterForm> & { step?: number }
        reset({
          businessType: typeFromUrl || parsed.businessType || 'restaurant',
          restaurantName: parsed.restaurantName || '',
          fullName: parsed.fullName || '',
          phone: parsed.phone || '',
          password: '',
          confirmPassword: '',
        })
        if (parsed.step && parsed.step >= 1 && parsed.step <= 3) setStep(parsed.step)
        setDraftRecovered(Boolean(parsed.restaurantName || parsed.fullName || parsed.phone))
      } else if (typeFromUrl) {
        setValue('businessType', typeFromUrl)
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [reset, searchParams, setValue])

  useEffect(() => {
    const subscription = watch((current) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        businessType: current.businessType,
        restaurantName: current.restaurantName,
        fullName: current.fullName,
        phone: current.phone,
        step,
      }))
    })
    return () => subscription.unsubscribe()
  }, [watch, step])

  useEffect(() => {
    listBusinessTypes()
      .then((items) => {
        setBusinessTypes(items)
        const typeFromUrl = searchParams.get('type')
        const currentType = typeFromUrl || selectedBusinessType
        if (items.length > 0 && !items.some((item) => item.code === currentType)) {
          setValue('businessType', items[0].code)
        }
      })
      .catch(() => setServerError('تعذّر تحميل أنواع الأنشطة'))
  }, [])

  useEffect(() => {
    function handleMouseLeave(event: MouseEvent) {
      if (window.innerWidth >= 900 && event.clientY <= 0 && step < 3 && !showExitOffer) setShowExitOffer(true)
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [step, showExitOffer])

  async function nextStep() {
    setServerError(null)
    if (step === 1) {
      const valid = await trigger(['businessType', 'restaurantName'])
      if (valid) {
        setStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    if (step === 2) {
      const valid = await trigger(['fullName', 'phone', 'password', 'confirmPassword'])
      if (valid) {
        setStep(3)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  async function onSubmit(formValues: PhoneRegisterForm) {
    setServerError(null)
    try {
      const type = businessTypes.find((item) => item.code === formValues.businessType)
      const source = localStorage.getItem(SOURCE_KEY) || 'self_service'
      const user = await signUpWithPhone(formValues.phone, formValues.password, formValues.fullName, formValues.restaurantName, formValues.businessType)
      let restaurantId = ''
      try {
        const restaurant = await createRestaurant(user.uid, formValues.restaurantName, {
          clientName: formValues.fullName,
          clientContact: formValues.phone,
          businessType: formValues.businessType,
          businessTypeName: type?.name,
          registrationSource: source,
        })
        restaurantId = restaurant.id
      } catch (restaurantError) {
        console.error('[RegisterPage] restaurant creation failed:', restaurantError)
      }
      localStorage.removeItem(DRAFT_KEY)
      localStorage.removeItem(SOURCE_KEY)
      navigate(`/welcome${restaurantId ? `?restaurant=${encodeURIComponent(restaurantId)}` : ''}`)
    } catch (err) {
      setServerError(err instanceof Error ? translateAuthError(err.message) : 'حصل خطأ، حاول تاني')
    }
  }

  const whatsappHelp = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('السلام عليكم، عايز أعمل متجر على Egy Menu ومحتاج مساعدة في التسجيل')}`

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[#f3eee6]" dir="rtl">
      {showExitOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[24px] bg-white p-5 shadow-2xl sm:p-6">
            <button type="button" onClick={() => setShowExitOffer(false)} className="absolute left-4 top-4 rounded-full bg-black/5 p-2"><X size={18} /></button>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d7b66f]/20 text-[#8d7444]"><Sparkles size={20} /></div>
            <h3 className="mt-4 font-display text-xl font-bold sm:text-2xl">قبل ما تمشي… جرّب 72 ساعة مجانًا</h3>
            <p className="mt-2 text-sm leading-6 text-stone">مش مطلوب بطاقة بنكية ولا دفع أثناء التسجيل، وبياناتك محفوظة عشان تقدر تكمل.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setShowExitOffer(false)} className="rounded-xl bg-[#171714] px-3 py-3 text-sm font-bold text-white">كمّل التسجيل</button>
              <a href={whatsappHelp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#edf6ed] px-3 py-3 text-sm font-semibold text-[#45634a]"><MessageCircle size={16} /> واتساب</a>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#11120f] text-white">
        <div className="mx-auto w-full max-w-2xl px-4 pb-5 pt-4 sm:px-6 sm:pb-7 sm:pt-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d7b66f] text-[#171714]"><QrCode size={20} /></div>
              <div className="min-w-0"><p className="truncate font-display text-base font-black sm:text-lg">Egy Menu</p><p className="text-[10px] text-white/45 sm:text-xs">أنشئ متجرك في 3 خطوات</p></div>
            </Link>
            <Link to="/login" className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white/80 sm:text-xs">عندي حساب</Link>
          </div>

          <div className="mt-5 flex items-center gap-2 sm:mt-6">
            {steps.map((item, index) => {
              const active = step === item.number
              const done = step > item.number
              return (
                <div key={item.number} className="flex min-w-0 flex-1 items-center gap-2">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${active ? 'bg-[#d7b66f] text-[#171714]' : done ? 'bg-[#758060] text-white' : 'bg-white/10 text-white/50'}`}>{done ? <CheckCircle2 size={15} /> : item.number}</div>
                  <div className="hidden min-w-0 sm:block"><p className={`truncate text-xs font-bold ${active || done ? 'text-white' : 'text-white/45'}`}>{item.title}</p></div>
                  {index < steps.length - 1 && <div className={`h-px min-w-3 flex-1 ${done ? 'bg-[#758060]' : 'bg-white/10'}`} />}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-6 sm:py-7">
        {draftRecovered && <div className="mb-3 rounded-xl border border-[#8da274]/25 bg-[#eef2e8] px-3 py-2.5 text-xs text-[#59624a]">رجّعنا البيانات اللي كنت كاتبها قبل كده، تقدر تكمل من مكانك.</div>}

        <section className="w-full overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_14px_45px_rgba(0,0,0,.07)] sm:rounded-[28px]">
          <div className="border-b border-black/5 px-4 py-4 sm:px-7 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#8d7444] sm:text-xs">الخطوة {step} من 3</p>
                <h1 className="mt-1 font-display text-xl font-black text-[#171714] sm:text-2xl">{steps[step - 1].title}</h1>
                <p className="mt-1 text-xs leading-5 text-stone sm:text-sm">{steps[step - 1].text}</p>
              </div>
              <div className="shrink-0 rounded-full bg-[#f4eee3] px-2.5 py-1.5 text-[10px] font-semibold text-[#7b6845] sm:px-3 sm:text-xs">72 ساعة مجانًا</div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eee8df]"><div className="h-full rounded-full bg-[#d7b66f] transition-all duration-300" style={{ width: `${step * 33.333}%` }} /></div>
          </div>

          <div className="px-4 py-4 sm:px-7 sm:py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex min-w-0 flex-col gap-4">
              {step === 1 && (
                <>
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-medium">نوع النشاط</label>
                    <select {...register('businessType')} className="block w-full min-w-0 rounded-xl border border-stone-light/50 bg-paper px-3 py-3 text-sm outline-none focus:border-saffron">
                      {businessTypes.map((item) => <option key={item.id} value={item.code}>{item.icon || '🏪'} {item.name}</option>)}
                    </select>
                    {errors.businessType?.message && <p className="mt-1 text-xs text-sumac">{errors.businessType.message}</p>}
                  </div>

                  {businessTypes.length > 0 && (
                    <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
                      {businessTypes.slice(0, 8).map((item) => (
                        <button key={item.id} type="button" onClick={() => setValue('businessType', item.code, { shouldValidate: true })} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${selectedBusinessType === item.code ? 'border-[#d7b66f] bg-[#d7b66f]/15 text-[#765b29]' : 'border-black/8 bg-[#faf8f4] text-stone'}`}>{item.icon || '🏪'} {item.name}</button>
                      ))}
                    </div>
                  )}

                  <Input label="اسم النشاط أو المتجر" placeholder="مثال: Smart Mobile" error={errors.restaurantName?.message} {...register('restaurantName')} />

                  <div className="overflow-hidden rounded-[20px] bg-[#11120f] text-white">
                    <div className="bg-gradient-to-l from-[#6f775b] to-[#b28f50] p-3.5 sm:p-4">
                      <div className="text-[10px] text-white/65 sm:text-[11px]">معاينة سريعة</div>
                      <div className="mt-1 truncate font-display text-lg font-bold sm:text-xl">{values.restaurantName || preview.title}</div>
                      <div className="mt-1 truncate text-xs text-white/65">{selectedType?.name || preview.subtitle}</div>
                    </div>
                    <div className="p-3.5 sm:p-4">
                      <div className="rounded-2xl bg-white/8 p-3">
                        <div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">منتج تجريبي</p><p className="mt-1 text-[11px] text-white/40">صورة + سعر + تفاصيل</p></div><span className="shrink-0 rounded-xl bg-[#d7b66f] px-3 py-2 text-xs font-bold text-[#171714]">999 ج</span></div>
                        <div className="mt-3 flex flex-wrap gap-2">{preview.chips.map((chip) => <span key={chip} className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] text-white/65">{chip}</span>)}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <Input label="اسمك بالكامل" error={errors.fullName?.message} {...register('fullName')} />
                  <Input label="رقم الهاتف" type="tel" inputMode="tel" dir="ltr" placeholder="01xxxxxxxxx" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
                  <Input label="كلمة المرور" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
                  <Input label="تأكيد كلمة المرور" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                  <p className="text-xs leading-5 text-stone">رقم الهاتف هو اللي هتستخدمه بعد كده لتسجيل الدخول وإدارة متجرك.</p>
                </>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="rounded-[20px] border border-[#d7b66f]/25 bg-[#fbf7ef] p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-[#8d7444]"><CheckCircle2 size={18} /><span className="font-bold">متجرك جاهز للإنشاء</span></div>
                    <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 sm:gap-3">
                      <ReviewItem label="اسم المتجر" value={values.restaurantName || '—'} />
                      <ReviewItem label="نوع النشاط" value={`${selectedType?.icon || '🏪'} ${selectedType?.name || values.businessType || '—'}`} />
                      <ReviewItem label="صاحب النشاط" value={values.fullName || '—'} />
                      <ReviewItem label="رقم الدخول" value={values.phone || '—'} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#eef2e8] p-3 text-xs leading-5 text-[#59624a] sm:p-4 sm:text-sm">بعد التسجيل تقدر تضيف أول منتج وتاخد رابط متجرك وQR فورًا.</div>
                </div>
              )}

              {serverError && <p className="rounded-xl bg-sumac/8 px-3 py-2 text-sm text-sumac">{serverError}</p>}

              <div className="mt-1 flex w-full items-center gap-2">
                {step > 1 && <button type="button" onClick={() => { setStep((current) => Math.max(1, current - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="flex shrink-0 items-center gap-1 rounded-xl border border-black/10 px-3 py-3 text-sm font-semibold sm:px-4"><ArrowRight size={16} /> رجوع</button>}
                {step < 3 ? (
                  <button type="button" onClick={nextStep} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#171714] px-4 py-3.5 text-sm font-bold text-white">التالي <ArrowLeft size={16} /></button>
                ) : (
                  <Button type="submit" loading={isSubmitting} className="min-w-0 flex-1">ابدأ التجربة المجانية 72 ساعة</Button>
                )}
              </div>
            </form>
          </div>
        </section>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link to="/login" className="rounded-xl border border-black/8 bg-white px-4 py-3 text-center text-sm text-stone">عندك حساب؟ سجّل دخولك</Link>
          <a href={whatsappHelp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#edf6ed] px-4 py-3 text-sm font-semibold text-[#45634a]"><MessageCircle size={16} /> مساعدة على واتساب</a>
        </div>

        <p className="px-2 pb-5 pt-4 text-center text-[11px] leading-5 text-stone">بدون بطاقة بنكية · بدون دفع أثناء التسجيل · تقدر تعدّل منتجاتك في أي وقت</p>
      </main>
    </div>
  )
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl bg-white p-3"><div className="text-[11px] text-stone">{label}</div><div className="mt-1 break-words font-semibold">{value}</div></div>
}

function translateAuthError(message: string) {
  if (message.includes('auth/email-already-in-use')) return 'رقم الهاتف ده مسجّل بحساب بالفعل'
  if (message.includes('auth/weak-password')) return 'كلمة المرور ضعيفة، جرّب كلمة أقوى'
  return message
}
