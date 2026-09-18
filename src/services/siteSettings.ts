import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface SiteSettings {
  contact_phone: string
  whatsapp_number: string
  contact_email: string
  address: string
  google_maps_url: string
  privacy_policy: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contact_phone: '01039177959',
  whatsapp_number: '201039177959',
  contact_email: '',
  address: 'مصر',
  google_maps_url: '',
  privacy_policy: `بنحترم خصوصيتك وملتزمين بحماية بياناتك. بنجمع فقط البيانات اللازمة لتشغيل الحساب والمنيو والطلبات، زي الاسم ورقم الهاتف وبيانات النشاط والأصناف والأسعار وبيانات الطلب عند استخدام الخدمة.

بنستخدم البيانات لتشغيل الخدمة، إدارة الحسابات، عرض المنيو، تنفيذ الطلبات، تحسين الأداء وتقديم الدعم. مش بنبيع بيانات المستخدمين لأي طرف ثالث.

البيانات العامة الخاصة بالنشاط زي اسم النشاط والمنيو والأسعار والصور قد تكون ظاهرة للزوار. بيانات الحساب والطلبات والإدارة لا تظهر إلا لصاحب الحساب والأشخاص المصرح لهم وفريق إدارة المنصة عند الحاجة.

تقدر تطلب تعديل أو حذف بياناتك من خلال التواصل معانا. بنستخدم خدمات Firebase وGoogle Cloud لتخزين وتشغيل البيانات مع تطبيق قواعد صلاحيات وحماية مناسبة.

قد نقوم بتحديث سياسة الخصوصية من وقت لآخر، وسيتم نشر النسخة الأحدث في هذه الصفحة.`,
}

const settingsRef = doc(db, 'platform_settings', 'site')

export async function getSiteSettings(): Promise<SiteSettings> {
  const snap = await getDoc(settingsRef)
  if (!snap.exists()) return DEFAULT_SITE_SETTINGS
  const data = snap.data() as Partial<SiteSettings>
  return { ...DEFAULT_SITE_SETTINGS, ...data }
}

export async function saveSiteSettings(settings: SiteSettings) {
  await setDoc(settingsRef, { ...settings, updated_at: serverTimestamp() }, { merge: true })
}
