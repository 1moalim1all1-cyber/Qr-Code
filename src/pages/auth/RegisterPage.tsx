import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, QrCode, ShieldCheck, Sparkles, Store, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { phoneRegisterSchema, type PhoneRegisterForm } from '@/lib/validation'
import { signUpWithPhone } from '@/services/auth'
import { createRestaurant } from '@/services/restaurants'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'

const SUPPORT_WHATSAPP = '201039177959'
const DRAFT_KEY = 'egy-menu-register-draft-v1'

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
  pharmacy: { title: 'Health Store', subtitle: 'صيدلية', chips: ['الاسم', 'السعر', 'التوفر'] },
  furniture: { title: 'Home Store', subtitle: 'أثاث ومفروشات', chips: ['الخامة', 'المقاس', 'اللون'] },
  decor_finishing: { title: 'Finish Store', subtitle: 'تشطيبات وديكور', chips: ['الخامة', 'المقاس', 'السعر'] },
}

export default function RegisterPage() {
  const navigate = useNavigate()
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
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PhoneRegisterForm> & { step?: number }
        reset({
          businessType: parsed.businessType || 'restaurant',
          restaurantName: parsed.restaurantName || '',
          fullName: parsed.fullName || '',
          phone: parsed.phone || '',
          password: '',
          confirmPassword: '',
        })
        if (parsed.step && parsed.step >= 1 && parsed.step <= 3) setStep(parsed.step)
        setDraftRecovered(Boolean(parsed.restaurantName || parsed.fullName || parsed.phone))
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [reset])

  useEffect(() => {
    const subscription = watch((current) => {
      const safeDraft = {
        businessType: current.businessType,
        restaurantName: current.restaurantName,
        fullName: current.fullName,
        phone: current.phone,
        step,
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(safeDraft))
    })
    return () => subscription.unsubscribe()
  }, [watch, step])

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

  useEffect(() => {
    function handleMouseLeave(event: MouseEvent) {
      if (event.clientY <= 0 && step < 3 && !showExitOffer) setShowExitOffer(true)
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [step, showExitOffer])

  async function nextStep() {
    setServerError(null)
    if (step === 1) {
      const valid = await trigger(['businessType', 'restaurantName'])
      if (valid) setStep(2)
      return
    }
    if (step === 2) {
      const valid = await trigger(['fullName', 'phone', 'password', 'confirmPassword'])
      if (valid) setStep(3)
    }
  }

  async function onSubmit(formValues: PhoneRegisterForm) {
    setServerError(null)
    try {
      const type = businessTypes.find((item) => item.code === formValues.businessType)
      const user = await signUpWithPhone(formValues.phone, formValues.password, formValues.fullName, formValues.restaurantName, formValues.businessType)
      try {
        await createRestaurant(user.uid, formValues.restaurantName, {
          clientName: formValues.fullName,
          clientContact: formValues.phone,
          businessType: formValues.businessType,
          businessTypeName: type?.name,
        })
      } catch (restaurantError) {
        console.error('[RegisterPage] restaurant creation failed:', restaurantError)
      }
      localStorage.removeItem(DRAFT_KEY)
      window.alert('تم إنشاء متجرك بنجاح 🎉\nهتدخل دلوقتي لوحة التحكم وتبدأ بإضافة أول منتج.')
      navigate('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? translateAuthError(err.message) : 'حصل خطأ، حاول تاني')
    }
  }

  const whatsappHelp = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('السلام عليكم، عايز أعمل متجر على Egy Menu ومحتاج مساعدة في التسجيل')}`

  return (
    <div className="min-h-screen bg-[#f3eee6] px-4 py-8 sm:px-6 sm:py-12" dir="rtl">
      {showExitOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <button type="button" onClick={() => setShowExitOffer(false)} className="absolute left-4 top-4 rounded-full bg-black/5 p-2"><X size={18} /></button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7b66f]/20 text-[#8d7444]"><Sparkles size={22} /></div>
            <h3 className="mt-4 font-display text-2xl font-bold">قبل ما تمشي… جرّب 10 أيام مجانًا</h3>
            <p className="mt-2 text-sm leading-7 text-stone">مش مطلوب بطاقة بنكية ولا دفع أثناء التسجيل، وبياناتك اللي كتبتها محفوظة عشان تقدر تكمل من نفس المكان.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setShowExitOffer(false)} className="rounded-xl bg-[#171714] px-4 py-3 text-sm font-bold text-white">كمّل التسجيل</button>
              <a href={whatsappHelp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#edf6ed] px-4 py-3 text-sm font-semibold text-[#45634a]"><MessageCircle size={16} /> واتساب</a>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <aside className="rounded-[30px] bg-[#11120f] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,.16)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7b66f]"><QrCode className="text-[#171714]" size={22} /></div>
            <div><p className="font-display text-xl font-bold">Egy Menu</p><p className="text-xs text-white/40">متجرك يبدأ في دقائق</p></div>
          </div>

          <h1 className="mt-8 font-display text-3xl font-bold leading-tight">اعمل متجرك في 3 خطوات وخد الرابط فورًا</h1>
          <p className="mt-3 text-sm leading-7 text-white/55">10 أيام تجربة مجانية. مفيش دفع أثناء التسجيل، ومش محتاج بطاقة بنكية.</p>

          {draftRecovered && <div className="mt-4 rounded-2xl border border-[#8da274]/25 bg-[#8da274]/10 p-3 text-xs text-[#cbd8b7]">رجّعنا البيانات اللي كنت كاتبها قبل كده، تقدر تكمل من مكانك.</div>}

          <div className="mt-7 space-y-3">
            {steps.map((item) => {
              const active = step === item.number
              const done = step > item.number
              return (
                <div key={item.number} className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${active ? 'border-[#d7b66f]/50 bg-[#d7b66f]/10' : done ? 'border-[#758060]/30 bg-[#758060]/10' : 'border-white/8 bg-white/[0.03]'}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${active ? 'bg-[#d7b66f] text-[#171714]' : done ? 'bg-[#758060] text-white' : 'bg-white/8 text-white/45'}`}>{done ? <CheckCircle2 size={17} /> : item.number}</div>
                  <div><p className="text-sm font-semibold">{item.title}</p><p className="mt-0.5 text-xs text-white/40">{item.text}</p></div>
                </div>
              )
            })}
          </div>

          <div className="mt-7 rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-xs leading-6 text-white/55">
            <div className="flex items-center gap-2 font-semibold text-white/80"><ShieldCheck size={16} className="text-[#d7b66f]" /> بداية بدون مخاطرة</div>
            <p className="mt-2">بدون بطاقة بنكية — بدون التزام أثناء التجربة — تقدر تعدّل منتجاتك في أي وقت.</p>
          </div>

          <Link to="/restaurants" className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/75 hover:bg-white/[0.08]"><Store size={16} /> شوف متاجر حقيقية شغالة على المنصة</Link>
        </aside>

        <div className="rounded-[30px] border border-black/5 bg-white p-5 shadow-[0_25px_70px_rgba(0,0,0,.08)] sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#8d7444]">الخطوة {step} من 3</p>
              <h2 className="mt-1 font-display text-2xl font-bold">{steps[step - 1].title}</h2>
              <p className="mt-1 text-sm text-stone">{steps[step - 1].text}</p>
            </div>
            <div className="rounded-full bg-[#f4eee3] px-3 py-1.5 text-xs font-semibold text-[#7b6845]">أقل من دقيقتين</div>
          </div>

          <div className="mb-7 h-2 overflow-hidden rounded-full bg-[#eee8df]"><div className="h-full rounded-full bg-[#d7b66f] transition-all duration-300" style={{ width: `${step * 33.333}%` }} /></div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">نوع النشاط</label>
                  <select {...register('businessType')} className="w-full rounded-xl border border-stone-light/50 bg-paper px-3 py-3 outline-none focus:border-saffron">
                    {businessTypes.map((item) => <option key={item.id} value={item.code}>{item.icon || '🏪'} {item.name}</option>)}
                  </select>
                  {errors.businessType?.message && <p className="mt-1 text-xs text-sumac">{errors.businessType.message}</p>}
                </div>

                {businessTypes.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {businessTypes.slice(0, 8).map((item) => (
                      <button key={item.id} type="button" onClick={() => setValue('businessType', item.code, { shouldValidate: true })} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${selectedBusinessType === item.code ? 'border-[#d7b66f] bg-[#d7b66f]/15 text-[#765b29]' : 'border-black/8 bg-[#faf8f4] text-stone'}`}>{item.icon || '🏪'} {item.name}</button>
                    ))}
                  </div>
                )}

                <Input label="اسم النشاط أو المتجر" placeholder="مثال: Smart Mobile" error={errors.restaurantName?.message} {...register('restaurantName')} />

                <div className="overflow-hidden rounded-[24px] border border-black/5 bg-[#11120f] text-white">
                  <div className="bg-gradient-to-l from-[#6f775b] to-[#b28f50] p-4">
                    <div className="text-[11px] text-white/65">معاينة سريعة لشكل نشاطك</div>
                    <div className="mt-1 font-display text-xl font-bold">{values.restaurantName || preview.title}</div>
                    <div className="mt-1 text-xs text-white/65">{selectedType?.name || preview.subtitle}</div>
                  </div>
                  <div className="p-4">
                    <div className="rounded-2xl bg-white/8 p-3">
                      <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">منتج تجريبي</p><p className="mt-1 text-xs text-white/40">صورة + سعر + تفاصيل</p></div><span className="rounded-xl bg-[#d7b66f] px-3 py-2 text-xs font-bold text-[#171714]">999 ج</span></div>
                      <div className="mt-3 flex flex-wrap gap-2">{preview.chips.map((chip) => <span key={chip} className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] text-white/65">{chip}</span>)}</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Input label="اسمك بالكامل" error={errors.fullName?.message} {...register('fullName')} />
                <Input label="رقم الهاتف" type="tel" dir="ltr" placeholder="01xxxxxxxxx" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
                <Input label="كلمة المرور" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
                <Input label="تأكيد كلمة المرور" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                <p className="text-xs leading-5 text-stone">رقم الهاتف هو اللي هتستخدمه بعد كده لتسجيل الدخول وإدارة متجرك.</p>
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-[24px] border border-[#d7b66f]/25 bg-[#fbf7ef] p-5">
                  <div className="flex items-center gap-2 text-[#8d7444]"><CheckCircle2 size={18} /><span className="font-bold">متجرك جاهز للإنشاء</span></div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <ReviewItem label="اسم المتجر" value={values.restaurantName || '—'} />
                    <ReviewItem label="نوع النشاط" value={`${selectedType?.icon || '🏪'} ${selectedType?.name || values.businessType || '—'}`} />
                    <ReviewItem label="صاحب النشاط" value={values.fullName || '—'} />
                    <ReviewItem label="رقم الدخول" value={values.phone || '—'} />
                  </div>
                </div>
                <div className="rounded-2xl bg-[#eef2e8] p-4 text-sm leading-6 text-[#59624a]">بعد التسجيل هتدخل مباشرة لوحة التحكم، وتلاقي خطوات واضحة لإضافة اللوجو وأول قسم وأول منتج ومشاركة الرابط.</div>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  {['بدون دفع الآن', '10 أيام تجربة', 'تعديل في أي وقت'].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl bg-[#f7f3ec] p-3"><CheckCircle2 size={15} className="text-[#758060]" />{item}</div>)}
                </div>
              </div>
            )}

            {serverError && <p className="rounded-xl bg-sumac/8 px-3 py-2 text-sm text-sumac">{serverError}</p>}

            <div className="mt-2 flex items-center gap-2">
              {step > 1 && <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} className="flex items-center gap-1 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold"><ArrowRight size={16} /> رجوع</button>}
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#171714] px-4 py-3 text-sm font-bold text-white">التالي <ArrowLeft size={16} /></button>
              ) : (
                <Button type="submit" loading={isSubmitting} className="w-full flex-1">ابدأ التجربة المجانية 10 أيام</Button>
              )}
            </div>
          </form>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Link to="/login" className="rounded-xl border border-black/8 px-4 py-3 text-center text-sm text-stone hover:bg-[#faf7f2]">عندك حساب؟ سجّل دخولك</Link>
            <a href={whatsappHelp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#edf6ed] px-4 py-3 text-sm font-semibold text-[#45634a]"><MessageCircle size={16} /> خلّينا نعملهولك على واتساب</a>
          </div>

          <div className="mt-5 rounded-2xl border border-black/5 bg-[#faf8f4] p-4">
            <p className="text-sm font-bold">أسئلة قبل التسجيل</p>
            <div className="mt-3 grid gap-3 text-xs leading-5 text-stone sm:grid-cols-3">
              <div><b className="text-[#171714]">هل لازم أدفع دلوقتي؟</b><br />لا، تبدأ 10 أيام تجربة مجانية.</div>
              <div><b className="text-[#171714]">هل أقدر أعدل بعدين؟</b><br />أيوه، المنتجات والأسعار قابلة للتعديل.</div>
              <div><b className="text-[#171714]">العميل يحتاج تطبيق؟</b><br />لا، بيفتح المتجر من الرابط أو QR.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white p-3"><div className="text-[11px] text-stone">{label}</div><div className="mt-1 font-semibold">{value}</div></div>
}

function translateAuthError(message: string) {
  if (message.includes('auth/email-already-in-use')) return 'رقم الهاتف ده مسجّل بحساب بالفعل'
  if (message.includes('auth/weak-password')) return 'كلمة المرور ضعيفة، جرّب كلمة أقوى'
  return message
}
