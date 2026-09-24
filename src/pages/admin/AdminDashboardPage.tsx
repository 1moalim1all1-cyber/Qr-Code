import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Ban, CalendarClock, CheckCircle2, Clock, ExternalLink, Gift, LogOut, MapPin,
  MessageCircle, Pencil, Plus, QrCode, Search, Store, UtensilsCrossed, Wallet,
  XCircle, ClipboardList,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/auth'
import { listBusinessTypes, type BusinessTypeRecord } from '@/services/businessTypes'
import {
  approveClient, createMissingRestaurantForClient, deleteClientCompletely, getPlatformStats,
  getSubscriptionDaysLeft, listAdminClients, rejectClient, renewClient, restoreClient,
  suspendClient, updateAdminClient, type AdminClientRecord,
} from '@/services/admin'
import type { AccountStatus } from '@/types/database'

const STATUS_LABEL: Record<AccountStatus, string> = {
  active: 'مفعّل', pending: 'قيد المراجعة', rejected: 'مرفوض', suspended: 'موقوف',
}

type SubscriptionFilter = 'all' | 'trial' | 'active' | 'expiring' | 'expired' | 'no_date'
const SUBSCRIPTION_LABEL: Record<SubscriptionFilter, string> = {
  all: 'كل الاشتراكات', trial: 'تجربة مجانية', active: 'ساري', expiring: 'ينتهي خلال 7 أيام', expired: 'منتهي', no_date: 'بدون تاريخ',
}

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('20')) return digits
  if (digits.startsWith('0')) return `20${digits.slice(1)}`
  return digits
}

function renewalMessage(client: AdminClientRecord) {
  const business = client.user.requested_business_name || client.restaurant?.name || 'النشاط'
  const end = client.user.subscription_end || client.restaurant?.subscription_end
  const endLabel = end ? new Date(end).toLocaleString('ar-EG') : ''
  return encodeURIComponent(`أهلاً ${client.user.full_name}، بنفكرك إن اشتراك ${business}${endLabel ? ` هينتهي ${endLabel}` : ' محتاج تجديد'}. تواصل معانا لتجديد الخدمة واستمرار الكتالوج بدون توقف.`)
}

export default function AdminDashboardPage() {
  const { profile } = useAuth()
  const [clients, setClients] = useState<AdminClientRecord[]>([])
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeRecord[]>([])
  const [stats, setStats] = useState({ totalClients: 0, totalRestaurants: 0, active: 0, pending: 0, rejected: 0, suspended: 0, totalRevenue: 0, expiringSoon: 0, expired: 0, totalVisitsSample: 0 })
  const [filter, setFilter] = useState<'all' | AccountStatus>('all')
  const [businessType, setBusinessType] = useState('all')
  const [city, setCity] = useState('all')
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminClientRecord | null>(null)
  const [renewing, setRenewing] = useState<AdminClientRecord | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [list, s, types] = await Promise.all([listAdminClients(), getPlatformStats(), listBusinessTypes().catch(() => [])])
      setClients(list); setStats(s); setBusinessTypes(types)
    } catch (err) { setError(err instanceof Error ? err.message : 'تعذّر تحميل بيانات الإدارة') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const cities = useMemo(() => Array.from(new Set(
    clients.map((client) => client.restaurant?.city?.trim()).filter((value): value is string => Boolean(value)),
  )).sort((a, b) => a.localeCompare(b, 'ar')), [clients])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((c) => {
      const status = c.user.account_status || 'pending'
      if (filter !== 'all' && status !== filter) return false
      const clientBusinessType = c.restaurant?.business_type || ''
      if (businessType !== 'all' && clientBusinessType !== businessType) return false
      const clientCity = c.restaurant?.city?.trim() || ''
      if (city !== 'all' && clientCity !== city) return false
      const subscriptionEnd = c.user.subscription_end || c.restaurant?.subscription_end || null
      const daysLeft = getSubscriptionDaysLeft(subscriptionEnd)
      const isTrial = Number(c.user.trial_days || c.restaurant?.trial_days || 0) > 0 && !c.user.last_renewed_at && !c.restaurant?.last_renewed_at
      if (subscriptionFilter === 'trial' && !isTrial) return false
      if (subscriptionFilter === 'active' && (daysLeft === null || daysLeft <= 7)) return false
      if (subscriptionFilter === 'expiring' && (daysLeft === null || daysLeft < 0 || daysLeft > 7)) return false
      if (subscriptionFilter === 'expired' && (daysLeft === null || daysLeft >= 0)) return false
      if (subscriptionFilter === 'no_date' && daysLeft !== null) return false
      if (!q) return true
      const typeName = c.restaurant?.business_type_name || businessTypes.find((item) => item.code === clientBusinessType)?.name || ''
      return [c.user.full_name, c.user.phone, c.user.requested_business_name, c.restaurant?.name, c.restaurant?.client_contact, c.restaurant?.city, c.restaurant?.address, typeName]
        .some((v) => String(v || '').toLowerCase().includes(q))
    })
  }, [clients, filter, businessType, city, subscriptionFilter, search, businessTypes])

  const filtersActive = filter !== 'all' || businessType !== 'all' || city !== 'all' || subscriptionFilter !== 'all' || Boolean(search.trim())
  function clearFilters() { setFilter('all'); setBusinessType('all'); setCity('all'); setSubscriptionFilter('all'); setSearch('') }

  async function action(fn: () => Promise<void>) {
    setError(null)
    try { await fn(); await load() }
    catch (err) { setError(err instanceof Error ? err.message : 'حصل خطأ أثناء تنفيذ العملية') }
  }

  return (
    <div className="min-h-screen bg-paper-dim" dir="rtl">
      <header className="bg-ink text-paper"><div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4"><div><p className="text-sm text-stone-light">إدارة العملاء والمتاجر</p><h1 className="font-display text-xl font-semibold">أهلاً، {profile?.full_name ?? 'الإدارة'}</h1></div><button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-stone-light hover:text-paper"><LogOut size={16} /> تسجيل الخروج</button></div></header>
      <main className="max-w-7xl mx-auto px-5 py-7">
        <div className="grid sm:grid-cols-2 xl:grid-cols-8 gap-3 mb-6">
          <Stat icon={Store} label="إجمالي العملاء" value={stats.totalClients} /><Stat icon={Clock} label="منتظرين" value={stats.pending} /><Stat icon={CheckCircle2} label="مفعّلين" value={stats.active} /><Stat icon={XCircle} label="مرفوضين" value={stats.rejected} /><Stat icon={Ban} label="موقوفين" value={stats.suspended} /><Stat icon={CalendarClock} label="يجددوا خلال 7 أيام" value={stats.expiringSoon} /><Stat icon={CalendarClock} label="اشتراكات منتهية" value={stats.expired} /><Stat icon={Wallet} label="إجمالي المحصل" value={`${stats.totalRevenue} ج.م`} />
        </div>

        <section className="rounded-3xl bg-paper border border-stone-light/30 p-4 sm:p-5 mb-5 shadow-sm">
          <div className="grid lg:grid-cols-[1fr_auto] gap-3"><div className="relative"><Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالعميل، المتجر، الهاتف، المدينة أو نوع النشاط" className="w-full rounded-2xl border border-stone-light/30 bg-paper-dim py-3 pr-10 pl-4 outline-none focus:border-saffron" /></div><Link to="/admin/clients/new" className="rounded-2xl bg-saffron text-ink font-semibold px-5 py-3 flex items-center justify-center gap-2"><Plus size={18} /> إضافة متجر يدويًا</Link></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            <label className="text-xs text-stone">نوع النشاط<select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-light/30 bg-paper-dim px-3 py-2.5 text-sm text-ink outline-none focus:border-saffron"><option value="all">كل الأنشطة</option>{businessTypes.map((item) => <option key={item.id} value={item.code}>{item.icon || '🏪'} {item.name}</option>)}</select></label>
            <label className="text-xs text-stone">المدينة<select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-light/30 bg-paper-dim px-3 py-2.5 text-sm text-ink outline-none focus:border-saffron"><option value="all">كل المدن</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="text-xs text-stone">حالة الاشتراك<select value={subscriptionFilter} onChange={(e) => setSubscriptionFilter(e.target.value as SubscriptionFilter)} className="mt-1 w-full rounded-xl border border-stone-light/30 bg-paper-dim px-3 py-2.5 text-sm text-ink outline-none focus:border-saffron">{Object.entries(SUBSCRIPTION_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2 flex-wrap">{(['all', 'pending', 'active', 'rejected', 'suspended'] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm ${filter === f ? 'bg-ink text-paper' : 'bg-paper-dim border border-stone-light/30'}`}>{f === 'all' ? 'كل الحالات' : STATUS_LABEL[f]}</button>)}</div><div className="flex items-center gap-3 text-xs text-stone"><span>{visible.length} نتيجة من {clients.length}</span>{filtersActive && <button onClick={clearFilters} className="font-semibold text-saffron-dim">مسح الفلاتر</button>}</div></div>
        </section>

        {error && <div className="mb-5 rounded-2xl border border-sumac/30 bg-sumac/10 text-sumac p-4"><p className="font-semibold">في مشكلة في لوحة الإدارة</p><p className="text-sm mt-1">{error}</p><button onClick={load} className="mt-3 text-sm underline">إعادة المحاولة</button></div>}
        {loading ? <div className="text-center py-12 text-stone">جارِ تحميل كل الحسابات...</div> : visible.length === 0 ? <div className="text-center py-12 text-stone rounded-2xl bg-paper border border-stone-light/30">مفيش نتائج مطابقة للفلاتر الحالية.</div> : <div className="space-y-4">{visible.map((c) => {
          const status = c.user.account_status || 'pending'
          const name = c.user.requested_business_name || c.restaurant?.name || 'نشاط لم يُنشأ بعد'
          const phone = c.user.phone || c.restaurant?.client_contact || ''
          const paid = c.user.payment_status === 'paid' || c.restaurant?.payment_status === 'paid'
          const amount = Number(c.user.amount_paid || c.restaurant?.amount_paid || 0)
          const wa = phone ? whatsappNumber(phone) : ''
          const subscriptionEnd = c.user.subscription_end || c.restaurant?.subscription_end || null
          const daysLeft = getSubscriptionDaysLeft(subscriptionEnd)
          const expiryLabel = daysLeft === null ? 'ميعاد التجديد غير محدد' : daysLeft < 0 ? `منتهي من ${Math.abs(daysLeft)} يوم` : daysLeft === 0 ? 'ينتهي اليوم' : `متبقي ${daysLeft} يوم`
          const expiryClass = daysLeft === null ? 'bg-paper-dim text-stone' : daysLeft < 0 ? 'bg-sumac/15 text-sumac' : daysLeft <= 7 ? 'bg-saffron/15 text-saffron-dim' : 'bg-zaytoon/15 text-zaytoon'
          const isTrial = Number(c.user.trial_days || c.restaurant?.trial_days || 0) > 0 && !c.user.last_renewed_at && !c.restaurant?.last_renewed_at
          const typeName = c.restaurant?.business_type_name || businessTypes.find((item) => item.code === c.restaurant?.business_type)?.name || 'نوع النشاط غير محدد'
          return <section key={c.user.id} className="rounded-3xl bg-paper border border-stone-light/30 p-5 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><h2 className="font-display text-xl font-semibold">{name}</h2><span className="text-xs rounded-full bg-paper-dim border border-stone-light/30 px-3 py-1">{STATUS_LABEL[status]}</span>{c.restaurant && <span className="text-xs rounded-full bg-[#eee8dc] text-stone px-3 py-1">{typeName}</span>}{isTrial && <span className="text-xs rounded-full bg-saffron/15 text-saffron-dim px-3 py-1">تجربة مجانية 10 أيام</span>}<span className={`text-xs rounded-full px-3 py-1 ${paid ? 'bg-zaytoon/15 text-zaytoon' : 'bg-sumac/15 text-sumac'}`}>{paid ? `مدفوع${amount ? ` ${amount} ج.م` : ''}` : 'غير مدفوع'}</span><span className={`text-xs rounded-full px-3 py-1 ${expiryClass}`}>{expiryLabel}</span></div><p className="mt-2 text-sm text-stone">{c.user.full_name} {phone ? `• ${phone}` : ''}</p>{c.restaurant?.city && <p className="mt-1 text-xs text-stone flex items-center gap-1"><MapPin size={12} /> {c.restaurant.city}{c.restaurant.address ? ` · ${c.restaurant.address}` : ''}</p>}{subscriptionEnd && <p className="mt-1 text-xs text-stone">ينتهي: {new Date(subscriptionEnd).toLocaleString('ar-EG')}</p>}{!c.restaurant && <p className="mt-2 text-sm text-sumac">الحساب مسجل لكن النشاط لم يُنشأ في Firestore بعد.</p>}{c.user.rejection_reason && <p className="mt-2 text-sm text-sumac">سبب الرفض: {c.user.rejection_reason}</p>}</div>
            <div className="flex gap-2 flex-wrap"><button onClick={() => setEditing(c)} className="flex items-center gap-1 rounded-full bg-paper-dim px-3 py-2 text-xs hover:bg-stone-light/30"><Pencil size={14} /> تعديل</button><button onClick={() => setRenewing(c)} className="flex items-center gap-1 rounded-full bg-saffron/15 text-saffron-dim px-3 py-2 text-xs"><CalendarClock size={14} /> تجديد بالأيام</button>{wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-paper-dim px-3 py-2 text-xs"><MessageCircle size={14} /> واتساب</a>}{wa && daysLeft !== null && daysLeft <= 7 && <a href={`https://wa.me/${wa}?text=${renewalMessage(c)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-zaytoon text-paper px-3 py-2 text-xs"><MessageCircle size={14} /> رسالة تجديد جاهزة</a>}{c.restaurant && <a href={`${import.meta.env.BASE_URL}m/${c.restaurant.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-paper-dim px-3 py-2 text-xs"><ExternalLink size={14} /> عرض الكتالوج</a>}</div></div>
            <div className="mt-4 flex gap-2 flex-wrap">{!c.restaurant && !c.standalone && <button onClick={() => action(() => createMissingRestaurantForClient(c).then(() => undefined))} className="rounded-full bg-saffron text-ink px-4 py-2 text-sm font-semibold">إنشاء النشاط المفقود</button>}{status !== 'active' && status !== 'rejected' && <button onClick={() => action(() => approveClient(c.user.id, c.restaurant?.id))} className="rounded-full bg-zaytoon text-paper px-4 py-2 text-sm font-semibold">قبول + اعتماد الدفع + تفعيل</button>}{status !== 'rejected' && <button onClick={() => { const reason = window.prompt('اكتب سبب الرفض للعميل:'); if (reason !== null) action(() => rejectClient(c.user.id, c.restaurant?.id, reason.trim() || 'تم رفض الطلب بواسطة الإدارة')) }} className="rounded-full bg-sumac/15 text-sumac px-4 py-2 text-sm font-semibold">رفض</button>}{status === 'active' && <button onClick={() => action(() => suspendClient(c.user.id, c.restaurant?.id))} className="rounded-full bg-sumac/15 text-sumac px-4 py-2 text-sm font-semibold">إيقاف الحساب</button>}{(status === 'suspended' || status === 'rejected') && <button onClick={() => action(() => restoreClient(c.user.id, c.restaurant?.id))} className="rounded-full bg-zaytoon/15 text-zaytoon px-4 py-2 text-sm font-semibold">إعادة التفعيل</button>}<button onClick={() => { const first = window.confirm(`تحذير: هيتحذف ${name} نهائيًا من المنصة، بما في ذلك النشاط والبيانات وحساب تسجيل الدخول. هل أنت متأكد؟`); if (!first) return; const second = window.confirm('تأكيد أخير: العملية دي لا يمكن التراجع عنها. تنفيذ الحذف النهائي؟'); if (second) action(() => deleteClientCompletely(c)) }} className="rounded-full bg-sumac text-paper px-4 py-2 text-sm font-semibold">حذف الحساب نهائيًا</button></div>
            {c.restaurant && <div className="mt-4 pt-4 border-t border-stone-light/20 flex gap-2 flex-wrap"><Link to={`/admin/clients/${c.restaurant.id}/menu`} className="flex items-center gap-1 rounded-full bg-paper-dim px-3 py-2 text-xs"><UtensilsCrossed size={14} /> الأقسام والمنتجات</Link><Link to={`/admin/clients/${c.restaurant.id}/qr`} className="flex items-center gap-1 rounded-full bg-paper-dim px-3 py-2 text-xs"><QrCode size={14} /> QR</Link><Link to={`/admin/clients/${c.restaurant.id}/orders`} className="flex items-center gap-1 rounded-full bg-paper-dim px-3 py-2 text-xs"><ClipboardList size={14} /> الطلبات</Link><Link to={`/admin/clients/${c.restaurant.id}/offers`} className="flex items-center gap-1 rounded-full bg-paper-dim px-3 py-2 text-xs"><Gift size={14} /> العروض</Link></div>}
          </section>
        })}</div>}
      </main>
      {editing && <EditClientModal client={editing} businessTypes={businessTypes} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
      {renewing && <RenewClientModal client={renewing} onClose={() => setRenewing(null)} onSaved={() => { setRenewing(null); load() }} />}
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Store; label: string; value: string | number }) {
  return <div className="rounded-2xl bg-paper border border-stone-light/30 p-4"><Icon size={20} className="text-saffron-dim mb-2" /><p className="text-2xl font-display font-semibold">{value}</p><p className="text-xs text-stone mt-1">{label}</p></div>
}

function RenewClientModal({ client, onClose, onSaved }: { client: AdminClientRecord; onClose: () => void; onSaved: () => void }) {
  const [days, setDays] = useState('30'); const [amount, setAmount] = useState(String(client.user.amount_paid || 0)); const [note, setNote] = useState(client.user.payment_note || ''); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null)
  async function save() { const duration = Math.floor(Number(days)); if (!Number.isFinite(duration) || duration < 1) { setError('اكتب عدد أيام صحيح أكبر من صفر'); return } setSaving(true); setError(null); try { await renewClient({ userId: client.user.id, restaurantId: client.restaurant?.id, days: duration, amountPaid: Number(amount || 0), paymentNote: note.trim() }); onSaved() } catch (err) { setError(err instanceof Error ? err.message : 'تعذر تسجيل التجديد') } finally { setSaving(false) } }
  return <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" dir="rtl"><div className="w-full max-w-md rounded-3xl bg-paper p-6"><div className="flex justify-between items-center mb-5"><h3 className="font-display text-xl font-semibold">تجديد اشتراك العميل بالأيام</h3><button onClick={onClose}><XCircle size={22} /></button></div><div className="space-y-4"><Field label="عدد أيام التجديد" value={days} onChange={setDays} type="number" /><div className="flex gap-2 flex-wrap">{[10,30,60,90,180,365].map((d) => <button key={d} onClick={() => setDays(String(d))} className={`rounded-full px-3 py-1.5 text-xs border ${days === String(d) ? 'bg-ink text-paper border-ink' : 'border-stone-light/40'}`}>{d} يوم</button>)}</div><Field label="المبلغ المحصل" value={amount} onChange={setAmount} type="number" /><div><label className="text-sm font-medium">ملاحظات / طريقة الدفع</label><textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full min-h-20 rounded-xl border border-stone-light/30 bg-paper p-3" /></div><p className="text-xs text-stone">لو الاشتراك لسه ساري، الأيام الجديدة بتتضاف على تاريخ الانتهاء الحالي. لو منتهي، بتبدأ من لحظة التجديد.</p>{error && <p className="text-sm text-sumac">{error}</p>}<button disabled={saving} onClick={save} className="w-full rounded-2xl bg-zaytoon text-paper py-3 font-semibold disabled:opacity-50">{saving ? 'جارِ تسجيل التجديد...' : 'تأكيد التجديد'}</button></div></div></div>
}

function EditClientModal({ client, businessTypes, onClose, onSaved }: { client: AdminClientRecord; businessTypes: BusinessTypeRecord[]; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(client.user.full_name || '')
  const [phone, setPhone] = useState(client.user.phone || client.restaurant?.client_contact || '')
  const [businessName, setBusinessName] = useState(client.user.requested_business_name || client.restaurant?.name || '')
  const [businessType, setBusinessType] = useState(client.restaurant?.business_type || 'restaurant')
  const [city, setCity] = useState(client.restaurant?.city || '')
  const [address, setAddress] = useState(client.restaurant?.address || '')
  const [whatsapp, setWhatsapp] = useState(client.restaurant?.whatsapp || client.restaurant?.phone || phone)
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>(client.user.payment_status || client.restaurant?.payment_status || 'unpaid')
  const [amountPaid, setAmountPaid] = useState(String(client.user.amount_paid || client.restaurant?.amount_paid || 0))
  const [paymentNote, setPaymentNote] = useState(client.user.payment_note || client.restaurant?.payment_note || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedType = businessTypes.find((item) => item.code === businessType)

  async function save() {
    if (!fullName.trim() || !businessName.trim()) { setError('اسم العميل واسم النشاط مطلوبين'); return }
    setSaving(true); setError(null)
    try {
      await updateAdminClient({ userId: client.user.id, restaurantId: client.restaurant?.id, fullName: fullName.trim(), phone: phone.trim(), businessName: businessName.trim(), businessType, businessTypeName: selectedType?.name || client.restaurant?.business_type_name || null, city: city.trim(), address: address.trim(), whatsapp: whatsapp.trim(), paymentStatus, amountPaid: Number(amountPaid || 0), paymentNote: paymentNote.trim() })
      onSaved()
    } catch (err) { setError(err instanceof Error ? err.message : 'تعذّر حفظ البيانات') } finally { setSaving(false) }
  }

  return <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4" dir="rtl"><div className="w-full max-w-2xl rounded-3xl bg-paper p-6 max-h-[92vh] overflow-auto"><div className="flex items-center justify-between mb-5"><div><h3 className="font-display text-xl font-semibold">تعديل العميل والمتجر</h3><p className="text-xs text-stone mt-1">عدّل بيانات العميل وبيانات واجهة المتجر من نفس المكان.</p></div><button onClick={onClose}><XCircle size={22} /></button></div><div className="grid sm:grid-cols-2 gap-4"><Field label="اسم العميل" value={fullName} onChange={setFullName} /><Field label="رقم الهاتف" value={phone} onChange={setPhone} /><Field label="اسم النشاط" value={businessName} onChange={setBusinessName} /><label className="text-sm font-medium">نوع النشاط<select value={businessType} onChange={(e) => setBusinessType(e.target.value)} disabled={!client.restaurant} className="mt-1 w-full rounded-xl border border-stone-light/30 bg-paper p-3 disabled:opacity-50">{businessTypes.map((item) => <option key={item.id} value={item.code}>{item.icon || '🏪'} {item.name}</option>)}</select></label><Field label="المدينة" value={city} onChange={setCity} /><Field label="واتساب" value={whatsapp} onChange={setWhatsapp} /><div className="sm:col-span-2"><Field label="العنوان بالتفصيل" value={address} onChange={setAddress} /></div><label className="text-sm font-medium">حالة الدفع<select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'unpaid')} className="mt-1 w-full rounded-xl border border-stone-light/30 bg-paper p-3"><option value="unpaid">غير مدفوع</option><option value="paid">مدفوع</option></select></label><Field label="المبلغ المدفوع" value={amountPaid} onChange={setAmountPaid} type="number" /><div className="sm:col-span-2"><label className="text-sm font-medium">ملاحظات الدفع</label><textarea value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="mt-1 w-full min-h-24 rounded-xl border border-stone-light/30 bg-paper p-3" /></div></div>{!client.restaurant && <p className="mt-4 rounded-xl bg-saffron/10 text-saffron-dim px-3 py-2 text-xs">الحساب ده لسه ملوش متجر. أنشئ النشاط المفقود الأول علشان تقدر تضبط النوع والمدينة والعنوان والواتساب.</p>}{error && <p className="mt-4 text-sm text-sumac">{error}</p>}<button disabled={saving} onClick={save} className="mt-5 w-full rounded-2xl bg-ink text-paper py-3 font-semibold disabled:opacity-50">{saving ? 'جارِ الحفظ...' : 'حفظ بيانات العميل والمتجر'}</button></div></div>
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <div><label className="text-sm font-medium">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-light/30 bg-paper p-3" /></div>
}
