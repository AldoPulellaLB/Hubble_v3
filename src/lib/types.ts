export type MegaItem = {
  title: string
  copy: string
  href: string
}

/** A labelled run of rows — a heading, its note, and the rows under them. */
export type MegaGroup = {
  label: string
  note: string
  items: MegaItem[]
}

/** A column is a list of groups, not a single labelled list: `1816:10` stacks
 *  two under one another in the left column ("Buy Hubble Products" over "Build
 *  a Hubble Solution", a rule between them) and gives the right column one. */
export type MegaColumn = {
  groups: MegaGroup[]
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
