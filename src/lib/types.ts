export type MegaItem = {
  title: string
  copy: string
  href: string
  /** The comp hangs a named project off two of the Product Types rows. Its own
   *  link, not the row's — so it is a sibling target rather than nested, which
   *  an anchor inside an anchor would be. */
  chip?: { label: string; href: string }
}

export type MegaColumn = {
  label: string
  note: string
  items: MegaItem[]
  footnote?: string
}

export type Mega = {
  title: string
  columns: MegaColumn[]
  promo: {
    title: string
    copy: string
    image: { src: string; alt: string }
    cta: { label: string; href: string }
  }
}

export type NavItem = {
  label: string
  href: string
  children?: { label: string; href: string }[]
  /** The wide panel, when a top-level item has one. `children` stays alongside
   *  it: the mobile sheet renders that list, and it is the fallback here. */
  mega?: Mega
  /** Keeps an entry in the content file but out of the bar and the sheet, for
   *  a section that is written but not ready to link to. `Nav` filters on it, so
   *  the item and its whole dropdown go together. */
  hidden?: boolean
}

export type LinkRef = { label: string; href: string }

export type Service = {
  num: string
  title: string
  promise: string
  body: string
  href: string
}

export type Stat = {
  value: string
  label: string
  icon: 'wrench' | 'bars' | 'bolt' | 'africa'
  href: string
}

export type Project = {
  name: string
  sector: string
  figure: string
  /** Front face — the site's location, screened over brand blue. */
  map: string
  /** Back face — the place itself, revealed by the flip. */
  photo: string
  href: string
}
