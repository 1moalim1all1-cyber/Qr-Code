import { useEffect } from 'react'
import { Grid2X2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function QRFlowController() {
  const location = useLocation()
  const navigate = useNavigate()
  const menuMatch = location.pathname.match(/^\/m\/([^/]+)$/)
  const params = new URLSearchParams(location.search)
  const isQrProductView = Boolean(menuMatch && params.get('qrBrowse') === '1' && params.get('categoryName'))

  useEffect(() => {
    const match = location.pathname.match(/^\/m\/([^/]+)$/)
    if (!match) return

    const nextParams = new URLSearchParams(location.search)
    if (nextParams.get('src') !== 'qr') return
    if (nextParams.get('qrBrowse') === '1') return

    navigate(`/qr/${match[1]}?src=qr`, { replace: true })
  }, [location.pathname, location.search, navigate])

  useEffect(() => {
    const match = location.pathname.match(/^\/m\/([^/]+)$/)
    if (!match) return

    const nextParams = new URLSearchParams(location.search)
    if (nextParams.get('qrBrowse') !== '1') return
    const categoryName = nextParams.get('categoryName')
    if (!categoryName) return

    document.body.classList.add('qr-category-products')
    let clicked = false

    function selectCategory() {
      if (clicked) return
      const buttons = Array.from(document.querySelectorAll('button'))
      const target = buttons.find((button) => button.textContent?.trim() === categoryName)
      if (!target) return
      clicked = true
      target.click()
      window.setTimeout(() => {
        const productHeading = Array.from(document.querySelectorAll('h2')).find((heading) => heading.textContent?.trim() === categoryName)
        productHeading?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    }

    selectCategory()
    const observer = new MutationObserver(selectCategory)
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = window.setTimeout(() => observer.disconnect(), 5000)

    return () => {
      document.body.classList.remove('qr-category-products')
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [location.pathname, location.search])

  if (!isQrProductView || !menuMatch) return null

  return (
    <>
      <style>{`
        body.qr-category-products .sticky > .flex.gap-2.overflow-x-auto.mt-3.scrollbar-none {
          display: none !important;
        }
      `}</style>
      <button
        type="button"
        onClick={() => navigate(`/qr/${menuMatch[1]}?src=qr`)}
        className="fixed bottom-24 right-4 z-[75] flex items-center gap-2 rounded-full border border-white/10 bg-[#d7b66f] px-4 py-3 text-sm font-black text-[#171714] shadow-[0_16px_40px_rgba(0,0,0,.28)] sm:bottom-6 sm:right-6"
      >
        <Grid2X2 size={17} />
        كل الأصناف
      </button>
    </>
  )
}
