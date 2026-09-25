import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { logSiteAnalytics } from '@/services/siteAnalytics'

function oncePerSession(key: string, run: () => void) {
  if (typeof sessionStorage === 'undefined') return
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  run()
}

export default function GlobalSiteAnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname

    if (path === '/register') {
      oncePerSession('egy-menu:analytics:register-started', () => {
        logSiteAnalytics('register_started')
      })
    }

    if (path === '/welcome') {
      oncePerSession('egy-menu:analytics:register-completed', () => {
        logSiteAnalytics('register_completed', {
          restaurantId: new URLSearchParams(location.search).get('restaurant'),
        })
      })
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    if (location.pathname !== '/register') return

    function inspectStep() {
      const text = document.body.textContent || ''
      if (text.includes('الخطوة 2 من 3')) {
        oncePerSession('egy-menu:analytics:register-step-2', () => {
          logSiteAnalytics('register_step_2')
        })
      }
      if (text.includes('الخطوة 3 من 3')) {
        oncePerSession('egy-menu:analytics:register-step-3', () => {
          logSiteAnalytics('register_step_3')
        })
      }
    }

    inspectStep()
    const observer = new MutationObserver(inspectStep)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [location.pathname])

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.getAttribute('href') || ''
      const label = (anchor.textContent || '').trim()

      if (location.pathname === '/') {
        if (href.includes('wa.me')) {
          logSiteAnalytics('homepage_whatsapp_click', { label })
          return
        }

        if (href.includes('/register')) {
          const params = new URL(anchor.href, window.location.origin).searchParams
          if (params.get('src') === 'business-type') {
            logSiteAnalytics('business_type_cta_click', {
              label,
              businessType: params.get('type'),
            })
          } else {
            logSiteAnalytics('homepage_cta_click', {
              label,
              source: params.get('src') || 'homepage',
            })
          }
          return
        }

        if (href.includes('/m/') || label.includes('جرّب متجر') || label.includes('شوف النتيجة')) {
          logSiteAnalytics('homepage_demo_click', { label })
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [location.pathname])

  return null
}
