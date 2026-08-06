import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { jsPDF } from 'jspdf'
import { ArrowRight, Download, Copy, Check, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
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

  useEffect(() => {
    const fetcher = adminRestaurantId ? getRestaurantById(adminRestaurantId) : user ? getRestaurantByOwner(user.uid) : null
    if (!fetcher) return
    fetcher
      .then(async (r) => {
        setRestaurant(r)
        if (r) {
          const qrRow = await getOrCreateMainQRCode(r.id, r.owner_id)
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

  function downloadPDF() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas || !restaurant) return
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ unit: 'mm', format: 'a6' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const qrSize = 70
    const x = (pageWidth - qrSize) / 2

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(16)
    pdf.text(restaurant.name, pageWidth / 2, 20, { align: 'center' })
    pdf.addImage(imgData, 'PNG', x, 28, qrSize, qrSize)
    pdf.setFontSize(11)
    pdf.text('امسح الكود لعرض المنيو', pageWidth / 2, 106, { align: 'center' })
    pdf.save(`${restaurant.slug}-qr.pdf`)
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to={backTo} className="text-stone hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="font-display text-lg font-semibold">
            كود QR الخاص بالمنيو {restaurant && adminRestaurantId ? `— ${restaurant.name}` : ''}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 grid md:grid-cols-[1fr_260px] gap-8">
        {/* Preview */}
        <div className="rounded-2xl bg-paper border border-stone-light/30 p-8 flex flex-col items-center">
          <div ref={canvasRef} className="p-4 bg-white rounded-2xl">
            <QRCodeCanvas
              value={menuUrl}
              size={220}
              fgColor={color}
              level="H"
              style={{ display: 'none' }}
            />
            <QRCodeSVG
              value={menuUrl}
              size={220}
              fgColor={color}
              level="H"
              imageSettings={
                restaurant.logo_url
                  ? { src: restaurant.logo_url, height: 40, width: 40, excavate: true }
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

          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            <button onClick={downloadPNG} className="flex items-center gap-1.5 rounded-full bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink-soft transition-colors">
              <Download size={14} /> PNG
            </button>
            <button onClick={downloadSVG} className="flex items-center gap-1.5 rounded-full bg-paper-dim px-4 py-2 text-sm font-medium hover:bg-stone-light/30 transition-colors">
              <Download size={14} /> SVG
            </button>
            <button onClick={downloadPDF} className="flex items-center gap-1.5 rounded-full bg-paper-dim px-4 py-2 text-sm font-medium hover:bg-stone-light/30 transition-colors">
              <Download size={14} /> PDF للطباعة
            </button>
          </div>
        </div>

        {/* Customization */}
        <div className="rounded-2xl bg-paper border border-stone-light/30 p-5 h-fit">
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
    </div>
  )
}
