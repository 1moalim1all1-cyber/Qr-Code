import { z } from 'zod'

const phoneRegex = /^(\+?20)?0?1[0-25]\d{8}$/

export const phoneLoginSchema = z.object({
  phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
})
export type PhoneLoginForm = z.infer<typeof phoneLoginSchema>

export const phoneRegisterSchema = z
  .object({
    fullName: z.string().min(3, 'الاسم لازم يكون 3 أحرف على الأقل'),
    restaurantName: z.string().min(2, 'اسم المطعم مطلوب'),
    phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح'),
    password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  })
export type PhoneRegisterForm = z.infer<typeof phoneRegisterSchema>

export const categorySchema = z.object({
  nameAr: z.string().min(2, 'اسم القسم بالعربي مطلوب'),
  nameEn: z.string().optional(),
})
export type CategoryForm = z.infer<typeof categorySchema>

export const productSchema = z.object({
  nameAr: z.string().min(2, 'اسم الصنف بالعربي مطلوب'),
  nameEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  categoryId: z.string().min(1, 'اختار القسم'),
  price: z.coerce.number().positive('السعر لازم يكون أكبر من صفر'),
  // Kept as a plain string (not z.coerce.number()) on purpose: an empty
  // discount field used to get coerced to 0 by z.coerce.number(), which
  // then passed .nonnegative() and silently became a real "0 EGP discount"
  // instead of "no discount". The actual number conversion happens in the
  // form's onSubmit handler, where an empty string is explicitly mapped to
  // null (no discount) instead of 0.
  discountPrice: z.string().optional(),
  isBestSeller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
})
export type ProductForm = z.input<typeof productSchema>
