import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function QRFlowController() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const match = location.pathname.match(/^\/m\/([^/]+)$/)
    if (!match) return

    const params = new URLSearchParams(location.search)
    if (params.get('src') !== 'qr') return
    if (params.get('qrBrowse') === '1') return

    navigate(`/qr/${match[1]}?src=qr`, { replace: true })
  }, [location.pathname, location.search, navigate])

  useEffect(() => {
    const match = location.pathname.match(/^\/m\/([^/]+)$/)
    if (!match) return

    const params = new URLSearchParams(location.search)
    if (params.get('qrBrowse') !== '1') return
    const categoryName = params.get('categoryName')
    if (!categoryName) return

    let clicked = false

    function selectCategory() {
      if (clicked) return
      const buttons = Array.from(document.querySelectorAll('button'))
      const target = buttons.find((button) => button.textContent?.trim() === categoryName)
      if (!target) return
      clicked = true
      target.click()
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }

    selectCategory()
    const observer = new MutationObserver(selectCategory)
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = window.setTimeout(() => observer.disconnect(), 5000)

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [location.pathname, location.search])

  return null
}
