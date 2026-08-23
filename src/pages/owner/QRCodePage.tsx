import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { ArrowRight, Download, Copy, Check, ExternalLink, Smartphone, ScanLine, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'
import { getRestaurantByOwner, getRestaurantById } from '@/services/restaurants'
import { getOrCreateMainQRCode, updateQRStyle } from '@/services/qrcodes'
import type { Restaurant, QRCode } from '@/types/database'

const SHAPES: { value: QRCode['style']['shape']; label: string }[] = [
  { value: 'square', label: 'مربّع' },
  { value: 'rounded', label: 'حواف دائرية' },
  { value: 'dots', label: 'نقاط' },
]

const COLOR_PRESETS = ['#14110F', '#4B5D3A', '#B23A48', '#C4842A', '#1F2937']

// Two entry points share this UI:
//  - /dashboard/qr             (owner managing their own restaurant)
//  - /admin/clients/:id/qr     (admin generating a QR for a client)
interface QRCodePageProps {
  restaurantIdOverride?: string
  backTo?: string
}

export default function QRCodePage({ restaurantIdOverride, backTo = '/dashboard' }: QRCodePageProps) {
  const { user } = useAuth()
  const params = useParams<{ id?: string }>()
  const adminRestaurantId = restaurantIdOverride ?? params.id
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [qr, setQr] = useState<QRCode | null>(null)
  const [color, setColor] = useState('#14110F')
  const [shape, setShape] = useState<QRCode['style']['shape']>('square')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const flyerRef = useRef<HTMLDivElement>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    const fetcher = adminRestaurantId ? getRestaurantById(adminRestaurantId) : user ? getRestaurantByOwner(user.uid) : null
    if (!fetcher) return
    fetcher
      .then(async (r) => {
        setRestaurant(r)
        if (r) {
          const qrRow = await getOrCreateMainQRCode(r.id, auth.currentUser?.uid ?? r.owner_id)
          setQr(qrRow)
          setColor(qrRow.style?.color ?? '#14110F')
          setShape(qrRow.style?.shape ?? 'square')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني'))
  }, [user, adminRestaurantId])

  const menuUrl = restaurant
    ? `${window.location.origin}${import.meta.env.BASE_URL}m/${restaurant.slug}`
    : ''

  async function persistStyle(next: Partial<QRCode['style']>) {
    if (!qr || !restaurant) return
    const merged = { ...qr.style, ...next }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateQRStyle(restaurant.id, merged)
      setQr(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    } finally {
      setSaving(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function downloadPNG() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${restaurant?.slug ?? 'qr-menu'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function downloadSVG() {
    const svg = canvasRef.current?.querySelector('svg')
    if (!svg) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.download = `${restaurant?.slug ?? 'qr-menu'}.svg`
    link.href = URL.createObjectURL(blob)
    link.click()
  }

  async function downloadPDF() {
    if (!flyerRef.current || !restaurant) return
    setGeneratingPdf(true)
    try {
      // Both libraries are loaded on demand (only when the person actually
      // clicks this button) instead of bundled into the page's main script —
      // they're fairly large and most visitors never touch PDF export.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      // Rasterize the hidden Arabic flyer as an image first — jsPDF's built-in
      // fonts have no Arabic glyphs, so text drawn directly would come out
      // as boxes. html2canvas renders it exactly as the browser does, RTL
      // shaping and all, then we just place that image on the PDF page.
      const canvas = await html2canvas(flyerRef.current, { scale: 3, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ unit: 'mm', format: 'a5' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgRatio = canvas.height / canvas.width
      const drawWidth = pageWidth
      const drawHeight = pageWidth * imgRatio
      const y = Math.max(0, (pageHeight - drawHeight) / 2)
      pdf.addImage(imgData, 'PNG', 0, y, drawWidth, Math.min(drawHeight, pageHeight))
      pdf.save(`${restaurant.slug}-qr-flyer.pdf`)
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center px-6 gap-3">
        {error ? (
          <>
            <p className="text-sumac font-medium max-w-sm">{error}</p>
            <p className="text-stone text-sm">لو الرسالة فيها "Missing or insufficient permissions"، ابعتها لينا زي ما هي.</p>
          </>
        ) : (
          <p className="text-stone">جارِ التحميل...</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="bg-paper border-b border-stone-light/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
          <Link to={backTo} className="text-stone hover:text-ink transition-colors shrink-0">
            <ArrowRight size={20} />
          </Link>
          <h1 className="font-display text-base sm:text-lg font-semibold truncate">
            كود QR الخاص بالمنيو {restaurant && adminRestaurantId ? `— ${restaurant.name}` : ''}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid md:grid-cols-[1fr_260px] gap-6 sm:gap-8">
        {/* Preview */}
        <div className="rounded-2xl bg-paper border border-stone-light/30 p-4 sm:p-8 flex flex-col items-center">
          <div ref={canvasRef} className="p-3 sm:p-4 bg-white rounded-2xl">
            <QRCodeCanvas
              value={menuUrl}
              size={220}
              fgColor={color}
              level="H"
              style={{ display: 'none' }}
            />
            <QRCodeSVG
              value={menuUrl}
              size={180}
              fgColor={color}
              level="H"
              imageSettings={
                restaurant.logo_url
                  ? { src: restaurant.logo_url, height: 34, width: 34, excavate: true }
                  : undefined
              }
            />
          </div>

          <div className="flex items-center gap-2 mt-5 w-full max-w-sm">
            <div className="flex-1 truncate text-sm text-stone bg-paper-dim rounded-lg px-3 py-2">{menuUrl}</div>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg bg-paper-dim p-2 hover:bg-stone-light/30 transition-colors"
              aria-label="نسخ الرابط"
            >
              {copied ? <Check size={16} className="text-zaytoon" /> : <Copy size={16} />}
            </button>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-paper-dim p-2 hover:bg-stone-light/30 transition-colors"
              aria-label="فتح المنيو"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 mt-6 w-full sm:w-auto sm:justify-center">
            <button onClick={downloadPNG} className="flex items-center justify-center gap-1.5 rounded-full bg-ink text-paper px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-ink-soft transition-colors">
              <Download size={14} /> PNG
            </button>
            <button onClick={downloadSVG} className="flex items-center justify-center gap-1.5 rounded-full bg-paper-dim px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-stone-light/30 transition-colors">
              <Download size={14} /> SVG
            </button>
            <button
              onClick={downloadPDF}
              disabled={generatingPdf}
              className="flex items-center justify-center gap-1.5 rounded-full bg-paper-dim px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-stone-light/30 transition-colors disabled:opacity-60"
            >
              <Download size={14} /> {generatingPdf ? '...جارِ' : 'PDF'}
            </button>
          </div>
        </div>

        {/* Customization */}
        <div className="rounded-2xl bg-paper border border-stone-light/30 p-4 sm:p-5 h-fit">
          <p className="text-sm font-semibold mb-3">اللون</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c)
                  persistStyle({ color: c })
                }}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-saffron' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value)
                persistStyle({ color: e.target.value })
              }}
              className="w-8 h-8 rounded-full overflow-hidden border border-stone-light/50"
            />
          </div>

          <p className="text-sm font-semibold mb-3 mt-5">الشكل</p>
          <div className="flex flex-col gap-2">
            {SHAPES.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setShape(s.value)
                  persistStyle({ shape: s.value })
                }}
                className={`text-right rounded-lg px-3 py-2 text-sm transition-colors ${
                  shape === s.value ? 'bg-saffron/15 text-saffron-dim font-medium' : 'hover:bg-paper-dim'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {restaurant.logo_url && (
            <p className="text-xs text-stone mt-4">اللوجو بتاع مطعمك بيتحط في نص الكود تلقائيًا.</p>
          )}
          {saving && <p className="text-xs text-stone-light mt-3">جارِ الحفظ...</p>}
          {error && <p className="text-xs text-sumac mt-3">{error}</p>}
        </div>
      </main>

      {/* Hidden print flyer — rendered off-screen, captured via html2canvas
          for the PDF so Arabic text renders correctly (see downloadPDF). */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <div
          ref={flyerRef}
          className="w-[400px] bg-white p-8 flex flex-col items-center text-center"
          style={{ fontFamily: 'Tajawal, sans-serif' }}
        >
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="" className="w-16 h-16 rounded-2xl object-cover mb-3" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-ink text-saffron flex items-center justify-center text-2xl font-bold mb-3">
              {restaurant.name.charAt(0)}
            </div>
          )}
          <h1 style={{ fontFamily: 'El Messiri, sans-serif' }} className="text-2xl font-bold text-ink mb-1">
            {restaurant.name}
          </h1>
          <p className="text-sm text-stone mb-6">امسح الكود وشوف المنيو دلوقتي</p>

          <div className="p-4 bg-white border-2 rounded-2xl mb-6" style={{ borderColor: color }}>
            <QRCodeCanvas value={menuUrl} size={200} fgColor={color} level="H" />
          </div>

          <div className="w-full flex flex-col gap-3 text-right">
            {[
              { icon: Smartphone, text: 'افتح كاميرا موبايلك' },
              { icon: ScanLine, text: 'وجّهها للكود وانتظر ثانية' },
              { icon: UtensilsCrossed, text: 'تصفح المنيو واطلب من مكانك' },
            ].map((step, i) => (
              <div key={step.text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-saffron/20 text-saffron-dim flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <step.icon size={16} className="text-zaytoon shrink-0" />
                <span className="text-sm text-ink">{step.text}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-stone-light mt-8">Egy Menu</p>
        </div>
      </div>
    </div>
  )
}
