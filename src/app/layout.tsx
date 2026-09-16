import type { Metadata, Viewport } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SmoothScroll from '@/components/SmoothScroll'
import ScrollSnap from '@/components/ScrollSnap'
import SavingsStage from '@/components/SavingsStage'
import Preloader from '@/components/Preloader'
import { load } from '@/lib/content'
import type { NavItem, LinkRef } from '@/lib/types'
import './globals.css'

type Site = {
  brand: { name: string; narrative: string }
  nav: NavItem[]
  footer: {
    title: string
    connect: string
    /* Optional, and it matters: the key was removed from `site.json`. Declared
       as required, the type said it was there while the JSON said otherwise —
       which `load<Site>` cannot check, so it shipped as an empty paragraph. */
    sub?: string
    primary: LinkRef[]
    columns: { title: string; links: LinkRef[] }[]
    presence: { title: string; lines: string[] }
    socials: { label: string; href: string; icon: 'instagram' | 'youtube' | 'whatsapp' | 'linkedin' }[]
    legal: LinkRef[]
    copyright: string
  }
}

export const metadata: Metadata = {
  metadataBase: new URL('https://hubbleenergy.co.za'),
  title: {
    default: 'Hubble Energy — Power keeps life in motion',
    template: '%s — Hubble Energy',
  },
  description:
    'Hubble is an integrated energy company. Generation, storage, hardware, software and service, brought together as one responsive system.',
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = load<Site>('site')

  return (
    <html lang="en-ZA">
      <body>
        {/* First in the body and on its own layer: it must be in the server
            markup, or the site paints before it and the panel drops on top. */}
        <Preloader />
        <SmoothScroll />
        {/* Soft snapping for any `[data-full-vh]` section. Mounted after
            SmoothScroll so Lenis exists by the time its effect runs. */}
        <ScrollSnap />
        <a href="#main" className="skip">Skip to content</a>
        {/* The whole site sits on a stage: any route to the calculator clips it
            into a card and slides it off to reveal the surface underneath. */}
        <SavingsStage nav={<Nav items={site.nav} />}>
          <main id="main">{children}</main>
          <Footer {...site.footer} />
        </SavingsStage>
      </body>
    </html>
  )
}
