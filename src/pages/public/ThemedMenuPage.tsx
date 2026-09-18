import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MenuPage from './MenuPage'
import { getRestaurantBySlug } from '@/services/restaurants'
import type { MenuTemplate } from '@/types/database'

const BODY_CLASSES = ['menu-theme-three_d', 'menu-theme-classic', 'menu-theme-minimal', 'menu-theme-dark_luxe']

export default function ThemedMenuPage() {
  const { slug } = useParams<{ slug: string }>()

  useEffect(() => {
    if (!slug) return
    getRestaurantBySlug(slug)
      .then((restaurant) => {
        BODY_CLASSES.forEach((c) => document.body.classList.remove(c))
        const template: MenuTemplate = restaurant.menu_template || 'three_d'
        document.body.classList.add(`menu-theme-${template}`)
      })
      .catch(() => undefined)

    return () => BODY_CLASSES.forEach((c) => document.body.classList.remove(c))
  }, [slug])

  return (
    <>
      <style>{`
        body.menu-theme-three_d { background:#11120f; }
        body.menu-theme-three_d .rounded-2xl,
        body.menu-theme-three_d .rounded-xl {
          box-shadow: 0 16px 35px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.07);
          transform: translateZ(0);
        }
        body.menu-theme-three_d button.rounded-xl,
        body.menu-theme-three_d a.rounded-xl,
        body.menu-theme-three_d button.rounded-2xl {
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
        }
        body.menu-theme-three_d button.rounded-xl:hover,
        body.menu-theme-three_d a.rounded-xl:hover,
        body.menu-theme-three_d button.rounded-2xl:hover {
          transform: translateY(-3px) scale(1.015);
          box-shadow: 0 18px 36px rgba(0,0,0,.34);
        }
        body.menu-theme-three_d img { filter: saturate(1.05) contrast(1.02); }
        body.menu-theme-three_d .sticky { box-shadow: 0 10px 25px rgba(0,0,0,.22); }

        body.menu-theme-classic .min-h-screen.bg-ink { background:#f6efe2 !important; color:#251f18 !important; }
        body.menu-theme-classic .text-paper { color:#251f18; }
        body.menu-theme-classic .text-stone-light { color:#756b60; }
        body.menu-theme-classic .bg-white\/5 { background:rgba(70,55,35,.07); }
        body.menu-theme-classic .sticky { background:rgba(246,239,226,.94) !important; }

        body.menu-theme-minimal .min-h-screen.bg-ink { background:#fff !important; color:#161616 !important; }
        body.menu-theme-minimal .text-paper { color:#161616; }
        body.menu-theme-minimal .text-stone-light { color:#777; }
        body.menu-theme-minimal .bg-white\/5 { background:#f5f5f5; }
        body.menu-theme-minimal .rounded-2xl,
        body.menu-theme-minimal .rounded-xl { border-radius:12px !important; box-shadow:none !important; }
        body.menu-theme-minimal .sticky { background:rgba(255,255,255,.96) !important; }

        body.menu-theme-dark_luxe .min-h-screen.bg-ink { background:linear-gradient(180deg,#080808,#14110b) !important; }
        body.menu-theme-dark_luxe .rounded-2xl,
        body.menu-theme-dark_luxe .rounded-xl { border-color:rgba(218,171,77,.22) !important; }
        body.menu-theme-dark_luxe .text-saffron { color:#e3b458 !important; }
        body.menu-theme-dark_luxe .sticky { background:rgba(8,8,8,.94) !important; border-color:rgba(218,171,77,.25) !important; }
      `}</style>
      <MenuPage />
    </>
  )
}
