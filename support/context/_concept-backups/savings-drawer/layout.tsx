import type { Metadata, Viewport } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SmoothScroll from '@/components/SmoothScroll'
import { load } from '@/lib/content'
import type { NavItem, LinkRef } from '@/lib/types'
import './globals.css'

type Site = {
  brand: { name: string; narrative: string }
  nav: NavItem[]
  footer: {
    title: string
    sub: string
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
        <SmoothScroll />
        <a href="#main" className="skip">Skip to content</a>
        <Nav items={site.nav} />
        <main id="main">{children}</main>
        <Footer {...site.footer} />
      </body>
    </html>
  )
}
