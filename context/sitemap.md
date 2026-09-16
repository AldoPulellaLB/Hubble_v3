# Hubble Energy — Site Map & Route Plan

Source: `Docs/Hubble Energy Site Map.pdf`.
Note: the supplied PDF is labelled "Page 2 of 2" — **page 1 was not included** in the file.

---

## Navigation as supplied

```
HOME
SOLUTIONS
  ├ Residential
  ├ Commercial & Industrial
  ├ Industries
  ├ Energy Storage Systems
  ├ Energy Arbitrage
  ├ Wheeling
  ├ PPA / ShareSolar
  └ SLA & Support
PRODUCTS
  ├ Residential
  ├ Commercial
  └ Cloudlink
PROJECTS / CASE STUDIES        (filtered by Product, Residential, Commercial/Industry)
PARTNERS
  ├ Become A Partner
  ├ Find A Reseller
  └ Marketing Material
LEARN
  ├ FAQs
  ├ Warranties
  ├ Training Events
  └ Inverter Guides
ABOUT
  ├ Why Hubble
  ├ Our Story
  └ Africa Presence
      ├ South Africa
      ├ Nigeria
      └ Zambia
CONTACT
NEWS AND INSIGHTS
CALCULATE YOUR SAVINGS         (lead-gen ROI calculator)
```

---

## Proposed route + template map

| Route | Template | Notes |
|---|---|---|
| `/` | `home` | Scroll-scrubbed sequence hero, solutions, CloudLink app feature, products preview, proof, ROI CTA |
| `/solutions` | `solutions-index` | The five offers as the commercial spine |
| `/solutions/residential` | `solution-detail` | "Power keeps life in motion" |
| `/solutions/commercial-industrial` | `solution-detail` | "Power drives performance" |
| `/solutions/industries` | `industries-index` | Manufacturing, agriculture, telecom, healthcare, retail… |
| `/solutions/industries/[slug]` | `industry-detail` | |
| `/solutions/energy-storage-systems` | `solution-detail` | |
| `/solutions/energy-arbitrage` | `solution-detail` | Offer 02 |
| `/solutions/wheeling` | `solution-detail` | Offer 03 |
| `/solutions/ppa-sharesolar` | `solution-detail` | Offer 04 |
| `/solutions/sla-support` | `solution-detail` | Offer 05 |
| `/products` | `products-index` | Three categories, **not** a shop |
| `/products/residential` | `product-category` | 3D interactive viewer section |
| `/products/residential/[slug]` | `product-detail` | 3D viewer + specs |
| `/products/commercial` | `product-category` | 3D interactive viewer section |
| `/products/commercial/[slug]` | `product-detail` | |
| `/products/cloudlink` | `product-cloudlink` | Software/app — different template; store badges |
| `/projects` | `case-index` | Faceted filter: product / residential / commercial / industry |
| `/projects/[slug]` | `case-detail` | |
| `/partners` | `partners-index` | |
| `/partners/become-a-partner` | `form-page` | |
| `/partners/find-a-reseller` | `locator` | Map / list by region |
| `/partners/marketing-material` | `resource-index` | Gated downloads |
| `/learn` | `learn-index` | |
| `/learn/faqs` | `faq` | |
| `/learn/warranties` | `content` | |
| `/learn/training-events` | `events` | |
| `/learn/inverter-guides` | `resource-index` | |
| `/about/why-hubble` | `content` | The four proof pillars |
| `/about/our-story` | `content` | |
| `/about/africa-presence` | `presence` | SA / Nigeria / Zambia |
| `/about/africa-presence/[country]` | `country` | |
| `/news` | `news-index` | |
| `/news/[slug]` | `article` | |
| `/contact` | `contact` | |
| `/calculate-your-savings` | `roi-calculator` | Lead-gen; strategically important per brand strategy |
| `/admin` | CMS | Login-gated copy + image + product editor |

---

## Nav grouping decision

The supplied nav has 9 top-level items — too many for the on.energy segmented bar, which works best
at 5–6 segments. Proposed consolidation for the primary bar, with the rest in the footer/utility:

**Primary bar:** Solutions · Products · Projects · Partners · About
**Utility (right):** Calculate your savings *(accent CTA)* · Contact
**Absorbed:** Learn → under About or its own footer column; News & Insights → footer + About segment

*This is a proposal — flagged as an open question.*
