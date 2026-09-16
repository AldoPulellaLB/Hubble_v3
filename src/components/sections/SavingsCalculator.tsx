'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import {
  BATTERIES, LOCATIONS, PROFILES, TARIFFS, batterySpec, bessRows, forClass, fmtKwh,
  fmtN, fmtR, headlineRows, isPeakHour, model, periodOf, recQty, savingPctText,
  simCarry, solarRows, summaryCards, tariffMeta, type Inputs, type Model, type Voltage,
} from '@/lib/savings'
import Button from '../Button'
import { PixelArrow } from '../Icons'
import PixelCard from '../PixelCard'
import { DayArea, RateHeatmap, ShareDonut } from './SavingsCharts'
import s from './SavingsCalculator.module.css'

type Props = {
  onClose: () => void
  closeRef?: RefObject<HTMLButtonElement | null>
}

/* `title` is the rail's label and has to stay short enough to read as a menu
   item. `lede` is what the pane asks, in the second person — only step one has
   one, because only step one is an intro screen with nothing above it to give
   the question context. */
const STEPS: { title: string; blurb: string; lede?: string }[] = [
  { title: 'Connection type', lede: 'What is your connection type?',
    blurb: 'Your supply voltage sets the tariffs, load shapes and battery formats we show.' },
  { title: 'Grid tariff', blurb: 'Pick the package you are billed on. Indicative FY2026/27 rates.' },
  { title: 'Load profile', blurb: 'Choose the shape that matches your day, then set your peak demand.' },
  { title: 'Battery storage', blurb: 'Size the bank against the energy you draw during the expensive peak window.' },
  { title: 'Solar PV', blurb: 'Optional. Cover daytime load and charge before the evening peak.' },
  { title: 'Your savings', blurb: 'First-year estimate based on the configuration below.' },
  { title: 'Full simulation', blurb: 'The estimate is a first pass. The simulator resolves your data hour by hour.' },
]

/* `art` carries its own intrinsic size because the two renders are not the same
   shape — 1354x691 against 1354x630 — and each is anchored by its foot, not by
   its box, so both stand on the card's bottom edge. */
const VOLTAGES: {
  id: Voltage; kicker: string; title: string; body: string; tags: string[]
  art: { src: string; w: number; h: number }
}[] = [
  {
    id: 'hv', kicker: 'Medium / high voltage · 11 kV+', title: 'Commercial & Industrial',
    body: 'Metered bulk supply with notified maximum demand, seasonal time-of-use rates and a monthly demand charge.',
    tags: ['Factories', 'Malls', 'Cold chain', 'Mining'],
    art: { src: '/images/render/Commercial.png', w: 1354, h: 691 },
  },
  {
    id: 'lv', kicker: 'Low voltage · ≤ 400 V', title: 'Residential & Small Business',
    body: 'Single or three-phase household or small commercial connection, billed on a flat or simple time-of-use rate.',
    tags: ['Homes', 'Shops', 'Under 100 kVA'],
    art: { src: '/images/render/Residential.png', w: 1354, h: 630 },
  },
]

/* One mark per step, drawn on the same 24-unit grid as the rest of the site's
   icons. These are the prototype's own shapes. */
const ICONS: Record<number, string> = {
  0: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  1: 'M20.6 13.4 12 22l-9-9V4h9l8.6 8.6a2 2 0 0 1 0 2.8Z',
  2: 'M2 12h4l3-8 4 16 3-8h6',
  3: 'M2 7h16v10H2zM21 10.5v3',
  4: 'M12 7.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4ZM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2',
  5: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  6: 'M5 15c-1.5 2-1.5 4.5-1.5 4.5S6 19.5 8 18M9.5 17.5 6 14c.6-4.5 4-8.5 9-9.5 1.5 3.5 1 8.5-4 11.5l-1.5.5Z',
}

/* One definition, read by both `useState` and Reset — two copies of this drift
   the moment a default is tuned. */
const INITIAL: Inputs = {
  voltage: 'hv', tariffId: 'megaflex', profileId: 'factory', peakKw: 150,
  batteryId: 'hv314', qty: 2, solarKwp: 200, locId: 'jhb',
}

const SIM_FEATURES = [
  ['8 760 hourly intervals', 'Every hour dispatched individually, not averaged.'],
  ['Real metering data', 'Runs against your utility interval file.'],
  ['Dispatch optimisation', 'Optimised against the tariff calendar and demand limits.'],
  ['Degradation & warranty', 'Capacity fade and throughput over 15 years.'],
  ['Full financial model', 'NPV, IRR, escalation and financing.'],
]

const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * The estimate as a standalone printable document.
 *
 * Written into a window of its own rather than printed from the page: the
 * calculator lives inside the site card, which is clipped, scaled and
 * translated, and none of that survives a print stylesheet intact. A separate
 * document also means the window's title is the filename the browser offers
 * when the reader picks "Save as PDF", which is the whole point of the button.
 *
 * Self-contained by necessity — one inline stylesheet, no image, no webfont, so
 * `load` fires immediately and `print()` cannot open on a half-built page.
 */
function reportHtml(m: Model, input: Inputs, dated: string) {
  const row = (k: string, v: string) =>
    `<div class="r"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`

  const config = summaryCards(m, input.voltage, input.qty)
    .map(c => `
      <section class="blk">
        <p class="tag">${esc(c.tag)}</p>
        <h3>${esc(c.title)}</h3>
        <dl>${c.rows.map(r => row(r.k, r.v)).join('')}</dl>
      </section>`)
    .join('')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Hubble savings estimate</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; color: #0a1228; background: #fff;
    font: 400 11pt/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  header { border-bottom: 2px solid #1748df; padding-bottom: 10pt; margin-bottom: 18pt; }
  .brand { font-size: 15pt; font-weight: 800; letter-spacing: -.02em; }
  .sub { font-size: 9pt; color: #5b6478; margin-top: 2pt; }
  .hero { border: 1px solid #dfe3ec; border-radius: 6pt; padding: 14pt; margin-bottom: 18pt; }
  .heroLab { font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: #5b6478; }
  .heroNum { font-size: 30pt; font-weight: 800; letter-spacing: -.04em; margin: 4pt 0 2pt; }
  .heroSub { font-size: 10pt; color: #1748df; }
  h2 { font-size: 9pt; letter-spacing: .12em; text-transform: uppercase; color: #5b6478;
       margin: 0 0 8pt; font-weight: 600; }
  .head3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10pt; margin-bottom: 18pt; }
  .head3 .blk { border: 1px solid #dfe3ec; border-radius: 5pt; padding: 9pt 10pt; }
  .head3 dt { font-size: 8pt; color: #5b6478; }
  .head3 dd { font-size: 14pt; font-weight: 700; margin: 2pt 0 0; letter-spacing: -.02em; }
  .head3 p { font-size: 8pt; color: #5b6478; margin: 2pt 0 0; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10pt; }
  .blk { break-inside: avoid; }
  .grid .blk { border: 1px solid #dfe3ec; border-radius: 5pt; padding: 9pt 10pt; }
  .tag { font-size: 7.5pt; letter-spacing: .12em; text-transform: uppercase; color: #1748df; margin: 0; }
  .grid h3 { font-size: 11pt; margin: 3pt 0 6pt; letter-spacing: -.01em; }
  dl { margin: 0; }
  .r { display: flex; justify-content: space-between; gap: 8pt;
       border-top: 1px solid #eef0f5; padding: 3pt 0; font-size: 9.5pt; }
  .r:first-child { border-top: 0; }
  .r dt { color: #5b6478; }
  .r dd { margin: 0; font-weight: 600; }
  footer { margin-top: 18pt; border-top: 1px solid #dfe3ec; padding-top: 8pt;
           font-size: 8pt; line-height: 1.5; color: #5b6478; }
</style></head>
<body>
  <header>
    <p class="brand">Hubble Energy &mdash; Savings estimate</p>
    <p class="sub">${esc(dated)}</p>
  </header>

  <div class="hero">
    <p class="heroLab">Estimated first-year saving</p>
    <p class="heroNum">${esc(fmtR(m.saving))}</p>
    <p class="heroSub">${esc(savingPctText(m))}</p>
  </div>

  <h2>Headline</h2>
  <div class="head3">
    ${headlineRows(m).map(r => `
      <div class="blk"><dl><dt>${esc(r.k)}</dt><dd>${esc(r.v)}</dd></dl><p>${esc(r.sub)}</p></div>`).join('')}
  </div>

  <h2>Configuration</h2>
  <div class="grid">${config}</div>

  <footer>
    Indicative only, on FY2026/27 published rates, and modelled on a single
    representative day scaled to the year. It is a first pass: the full
    simulation resolves 8&thinsp;760 hourly intervals against your own metering
    data, the tariff calendar and demand limits, with degradation, warranty and
    financing carried through. Talk to our team to run it.
  </footer>
</body></html>`
}

/** Counts to a target on the shared easing rather than snapping. Always live:
 *  it drives the running total, which changes on every input, as well as the
 *  figure on the results step. */
function useCountUp(target: number, active: boolean) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    if (!active) return
    const start = from.current
    const t0 = performance.now()
    const dur = 720
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      /* The same curve as --ease-out, so the number lands with the panel. */
      const e = 1 - Math.pow(1 - p, 3)
      const v = start + (target - start) * e
      setShown(v)
      from.current = v
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active])
  return shown
}

/**
 * The savings calculator.
 *
 * A seven-step wizard over the model in `@/lib/savings`. Two rules shape the
 * layout: it never scrolls, and it lives entirely in the strip the site card
 * uncovers — `.panel` is 80vh tall for that reason, which is where the card's
 * top edge lands when open (`translate: 0 75vh` plus the 5% its 0.9 scale gives
 * back). Every step therefore has a fixed budget and sizes itself to it.
 */
export default function SavingsCalculator({ onClose, closeRef }: Props) {
  const [step, setStep] = useState(0)
  const [chosen, setChosen] = useState(false)
  /* Step one is an intro screen: until a connection type has been chosen *and*
     confirmed, there is no rail and no running total, because neither has
     anything to say yet — every downstream step and every rand of the total is
     derived from that one choice. A latch rather than `step > 0`: stepping back
     to review the choice should not tear the navigation back out again. */
  const [revealed, setRevealed] = useState(false)
  const [input, setInput] = useState<Inputs>(INITIAL)
  /* Set only when the browser refuses the report window, which is the one
     failure the reader has to be told about — there is nothing else to see. */
  const [blockedPopup, setBlockedPopup] = useState(false)

  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => setInput(p => ({ ...p, [k]: v }))
  const m = useMemo(() => model(input), [input])

  const tariffs = forClass(TARIFFS, input.voltage)
  const profiles = forClass(PROFILES, input.voltage)
  const batteries = forClass(BATTERIES, input.voltage)

  const last = STEPS.length - 1
  const blocked = step === 0 && !chosen
  const saving = useCountUp(m.saving, true)

  /* Picking a supply class re-seeds every downstream choice to one that exists
     for it — an HV tariff with an LV battery is not a configuration. */
  const pickVoltage = (v: Voltage) => {
    setChosen(true)
    setInput(p => ({
      ...p, voltage: v,
      tariffId: forClass(TARIFFS, v)[0].id,
      profileId: forClass(PROFILES, v)[0].id,
      batteryId: forClass(BATTERIES, v)[0].id,
      peakKw: v === 'hv' ? 150 : 8,
      qty: v === 'hv' ? 2 : 1,
      solarKwp: v === 'hv' ? 200 : 6,
    }))
  }

  /* Back to the intro screen with nothing chosen — the rail and the running
     total close with it, because `revealed` is what holds them open. */
  const reset = () => {
    setStep(0)
    setChosen(false)
    setRevealed(false)
    setInput(INITIAL)
    setBlockedPopup(false)
  }

  const share = () => {
    setBlockedPopup(false)
    const w = window.open('', '_blank', 'width=900,height=1180')
    if (!w) { setBlockedPopup(true); return }

    const dated = new Date().toLocaleDateString('en-ZA', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    w.document.write(reportHtml(m, input, dated))
    w.document.close()

    /* The document is inline and asset-free, so `load` may already have fired
       by the time this runs — checking rather than only listening is what keeps
       the dialog from never opening. */
    const print = () => { w.focus(); w.print() }
    if (w.document.readyState === 'complete') print()
    else w.addEventListener('load', print, { once: true })
  }

  /* Enough bank to carry the peak window, rounded up to whole units. */
  const autoSize = () => set('qty', Math.max(1, Math.ceil(m.peakDayKwh / (m.batt.kwh * m.batt.eff * 0.9))))
  const matchSolar = () => set('solarKwp', Math.max(1, Math.round((m.dayKwh / (m.loc.yield / 365)) * 10) / 10))

  return (
    <section className={s.panel} aria-label="Calculate your savings">
      <header className={s.head}>
        <h2 className={s.title}>Calculate your savings</h2>
        <button
          ref={closeRef}
          type="button"
          className={s.close}
          onClick={onClose}
          aria-label="Close the savings calculator"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </button>
      </header>

      <div className={s.body} data-intro={revealed ? undefined : ''}>
        {/* The rail is the progress indicator and the navigation at once. It is
            in the DOM throughout so it has something to animate from, and
            `aria-hidden` while the column is closed so a screen reader is not
            offered a navigation the page is not showing. */}
        <nav className={s.rail} aria-label="Calculator steps" aria-hidden={!revealed}>
          {STEPS.map((meta, i) => {
            /* Nothing in the rail is reachable before it is shown — including
               step one's own row, which would otherwise be a focus stop
               sitting inside a closed column. */
            const locked = !revealed
            return (
              <button
                key={meta.title}
                type="button"
                className={s.railRow}
                data-on={i === step ? '' : undefined}
                data-done={i < step ? '' : undefined}
                disabled={locked}
                aria-current={i === step ? 'step' : undefined}
                onClick={() => !locked && setStep(i)}
              >
                <span className={s.railChip} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[i]} />
                  </svg>
                </span>
                <span className={s.railName}>{meta.title}</span>
                <PixelArrow className={s.railArw} />
              </button>
            )
          })}
        </nav>

        {/* The running total. Present at every step, so the number the whole
            exercise is for is never more than a glance away — it is the same
            counter the results step reads, so the two can never disagree.

            On the Stats section's pixel card, so the one figure the whole
            exercise is for gets the same treatment as the site's own headline
            numbers. The scatter is hover-driven, as it is there. */}
        <PixelCard variant="hubble" className={s.live} aria-live="polite" aria-hidden={!revealed}>
            <span className={s.liveLab}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
              </svg>
              Running total
            </span>
            <strong className={s.liveNum}>{fmtR(saving)}</strong>
            <span className={s.liveSub}>saved per year</span>
            <span className={s.liveBar}>
              <span style={{ ['--p' as string]: String(Math.min(1, m.baseline > 0 ? m.saving / m.baseline : 0)) }} />
          </span>
        </PixelCard>

        {/* `key` on the pane restarts the entrance on every step change, which
            is what makes the content read as arriving rather than swapping. */}
        <div className={s.pane} key={step}>
          <div className={s.paneHead}>
            <span className={s.stepIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={ICONS[step]} />
              </svg>
            </span>
            <div className={s.paneHeadText}>
              <h3 className={s.stepTitle}>{STEPS[step].lede ?? STEPS[step].title}</h3>
              <p className={s.stepBlurb}>{STEPS[step].blurb}</p>
              {blockedPopup && (
                <p className={s.note} role="status">
                  The report opens in a new window — allow pop-ups for this site and press Share again.
                </p>
              )}
            </div>
            {/* Both are disabled on the untouched intro: there is nothing to
                start again from, and nothing to put in a report. */}
            <div className={s.tools}>
              <button
                type="button" className={s.tool} onClick={reset}
                disabled={!chosen && step === 0}
                title="Start again"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4" />
                </svg>
                <span className={s.toolLab}>Reset</span>
              </button>

              <button
                type="button" className={s.tool} onClick={share}
                disabled={!chosen}
                title="Download a PDF of this estimate"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3v11M8 7l4-4 4 4M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                </svg>
                <span className={s.toolLab}>Share</span>
              </button>

              {/* The ring is the same progress the foot bar shows, in the form
                  the prototype puts beside the heading. */}
              <span
                className={s.ring}
                style={{ ['--deg' as string]: `${((step + 1) / STEPS.length) * 360}deg` }}
                aria-hidden="true"
              >
                <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
              </span>
            </div>
          </div>


          <div className={s.stepBody}>
            {step === 0 && (
              <div className={s.cards}>
                {VOLTAGES.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    className={s.card}
                    data-sel={chosen && input.voltage === v.id ? '' : undefined}
                    style={{ ['--i' as string]: String(i) }}
                    onClick={() => pickVoltage(v.id)}
                  >
                    {/* First child, so the `.edge` outline still paints over
                        it: both are positioned, and with no z-index between
                        them DOM order decides. It bleeds past the card's
                        padding to its own edges, and the tags sit on it. */}
                    <Image
                      className={s.cardArt}
                      src={v.art.src}
                      alt=""
                      width={v.art.w}
                      height={v.art.h}
                      sizes="45vw"
                    />
                    <span className={s.kicker}>{v.kicker}</span>
                    <span className={s.cardTitle}>{v.title}</span>
                    <span className={s.cardBody}>{v.body}</span>
                    <span className={s.tags}>
                      {v.tags.map(t => <span key={t} className={s.tag}>{t}</span>)}
                    </span>
                    {/* The selected edge. An outline drawn with a dash offset
                        rather than a border colour, so choosing a card traces
                        the shape instead of switching it on. `pathLength="1"`
                        normalises the perimeter, so the same dash values work
                        whatever size the card ends up. */}
                    <svg className={s.edge} aria-hidden="true" focusable="false">
                      <rect pathLength="1" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              /* Rows, as on every step with a chooser and a read-out: the four
                 tariffs across the top, the one you picked below them, then
                 what it costs hour by hour. In two columns the list ran out
                 after 40% of its height while the read-out sat cramped in the
                 other half. */
              <div className={s.stack}>
                <ul className={s.optionCards}>
                  {tariffs.map((t, i) => (
                    <li key={t.id} style={{ ['--i' as string]: String(i) }}>
                      <button
                        type="button"
                        className={s.row}
                        data-sel={input.tariffId === t.id ? '' : undefined}
                        onClick={() => set('tariffId', t.id)}
                      >
                        <span className={s.rowMain}>
                          <span className={s.rowName}>{t.name}</span>
                          <span className={s.rowMeta}>{t.dso} · {t.type}</span>
                        </span>
                        {/* Structured the same in both states, so choosing a
                            card recolours it and never reflows it. */}
                        <span className={s.rowNums}>
                          <span className={s.numGroup}>
                            <i className={s.numMark} data-band="peak" aria-hidden="true" />
                            <b>{fmtN(t.w.peak, 2)}</b>
                            <span>Peak</span>
                          </span>
                          <span className={s.numGroup}>
                            <i className={s.numMark} data-band="off" aria-hidden="true" />
                            <b>{fmtN(t.w.off, 2)}</b>
                            <span>Off peak</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Four figures across the width rather than stacked in a
                    column a third of it, which is what leaves the height for
                    the heatmap below. */}
                <div className={s.detail}>
                  <span className={s.badge}>{m.tariff.type === 'TOU' ? 'Time of use' : 'Flat rate'}</span>
                  <p className={s.detailName}>{m.tariff.name}</p>
                  <dl className={s.facts}>
                    {tariffMeta(m).map(r => (
                      <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>
                    ))}
                  </dl>
                </div>

                {/* The six band rates the two tables used to list, drawn
                    against the hours they actually apply to. Same numbers, one
                    plate, and the shape of the day is readable without holding
                    six figures in your head. */}
                <RateHeatmap
                  winter={m.tariff.w}
                  summer={m.tariff.s}
                  periodOf={periodOf}
                  caption="What a unit costs, hour by hour"
                />
              </div>
            )}

            {step === 2 && (
              <div className={s.stack}>
                <ul className={s.optionCards}>
                  {profiles.map((p, i) => (
                    <li key={p.id} style={{ ['--i' as string]: String(i) }}>
                      <button
                        type="button"
                        className={s.row}
                        data-sel={input.profileId === p.id ? '' : undefined}
                        onClick={() => set('profileId', p.id)}
                      >
                        <span className={s.rowMain}>
                          <span className={s.rowName}>{p.name}</span>
                          <span className={s.rowMeta}>{p.desc}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* The dial, and what the day it describes adds up to. */}
                <div className={`${s.duo} ${s.duoWide}`}>
                  <label className={`${s.plate} ${s.field}`}>
                    <span className={s.fieldLab}>Peak demand</span>
                    <span className={s.fieldIn}>
                      <input
                        type="number" min={1} max={2000} value={input.peakKw}
                        onChange={e => set('peakKw', Number(e.target.value))}
                      />
                      <span className={s.unit}>kW</span>
                    </span>
                    <input
                      className={s.range} type="range" min={5} max={2000} step={5}
                      value={input.peakKw} onChange={e => set('peakKw', Number(e.target.value))}
                      aria-label="Peak demand in kilowatts"
                    />
                  </label>

                  <dl className={s.facts}>
                    <div><dt>Daily</dt><dd>{fmtKwh(m.dayKwh)}</dd></div>
                    <div><dt>Annual</dt><dd>{fmtKwh(m.annualKwh)}</dd></div>
                    {/* The figure the next two steps are sized against, and
                        the reason the peak band is on the chart at all. */}
                    <div><dt>In the peak</dt><dd>{fmtKwh(m.peakDayKwh)}</dd></div>
                  </dl>
                </div>

                <DayArea
                  values={m.load}
                  caption="Your day, hour by hour"
                  unit="kW"
                  isPeakHour={isPeakHour}
                  total={`${fmtN(m.peak, 0)} kW peak`}
                />
              </div>
            )}

            {step === 3 && (
              /* The one step laid out in rows rather than two columns. Three
                 formats stacked in a column left two thirds of it empty and
                 squeezed everything derived from them into the other half.
                 Across the top they are three cards, and the width below is
                 then free for the control, what it does, and the day it is
                 being sized against. */
              <div className={s.stack}>
                <ul className={s.optionCards}>
                  {batteries.map((b, i) => (
                    <li key={b.id} style={{ ['--i' as string]: String(i) }}>
                      <button
                        type="button"
                        className={s.row}
                        data-sel={input.batteryId === b.id ? '' : undefined}
                        /* Selecting a format re-sizes the bank to what the peak
                           window needs, as the prototype does — a rack count
                           carried over from another format is meaningless. */
                        onClick={() => setInput(p => ({ ...p, batteryId: b.id, qty: recQty(b, m.peakDayKwh) }))}
                      >
                        <span className={s.rowMain}>
                          <span className={s.kicker}>{b.tag}</span>
                          <span className={s.rowName}>{b.name}</span>
                          <span className={s.rowMeta}>{batterySpec(b)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* The dial, and the one figure it moves, side by side — the
                    coverage was the fourth row of a five-row table. */}
                <div className={s.duo}>
                  <div className={s.plate}>
                    <div className={s.field}>
                      <span className={s.fieldLab}>Units</span>
                      <span className={s.stepper}>
                        <button type="button" onClick={() => set('qty', Math.max(0, input.qty - 1))} aria-label="One fewer unit">−</button>
                        <input
                          type="number" min={0} value={input.qty}
                          onChange={e => set('qty', Number(e.target.value))}
                          aria-label="Number of units"
                        />
                        <button type="button" onClick={() => set('qty', input.qty + 1)} aria-label="One more unit">+</button>
                      </span>
                      <button type="button" className={s.ghost} onClick={autoSize}>Size it for me</button>
                    </div>
                  </div>

                  <div className={s.plate}>
                    <ShareDonut
                      caption="Evening peak window"
                      centre={`${Math.round((m.shifted / (m.peakDayKwh || 1)) * 100)}%`}
                      centreLab="covered"
                      parts={[
                        { k: 'shifted', v: m.shifted, label: 'Carried by the bank' },
                        { k: 'grid', v: Math.max(0, m.peakDayKwh - m.shifted), label: 'Still drawn at peak' },
                      ]}
                    />
                  </div>
                </div>

                {/* The window the bank is being sized against, so the
                    percentage above has something to be a percentage of. Full
                    width here, where in half a column it was a 112px sliver. */}
                <DayArea
                  values={m.load}
                  caption="The window you are sizing for"
                  unit="kW"
                  isPeakHour={isPeakHour}
                  total={`${fmtKwh(m.peakDayKwh)} in the peak`}
                />

                {/* Coverage drops out of the row: the donut states it, and the
                    same figure twice on one screen reads as two figures. */}
                <dl className={s.facts}>
                  {bessRows(m)
                    .filter(r => r.k !== 'Evening peak covered')
                    .map(r => <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}
                </dl>
              </div>
            )}

            {step === 4 && (
              <div className={s.stack}>
                {/* The only chooser that needs a label of its own — five place
                    names are not self-describing the way "Cold storage" is. */}
                <div className={s.chooser}>
                  <span className={s.fieldLab}>Site</span>
                  <ul className={s.optionCards}>
                    {LOCATIONS.map((l, i) => (
                      <li key={l.id} style={{ ['--i' as string]: String(i) }}>
                        <button
                          type="button"
                          className={s.chip}
                          data-sel={input.locId === l.id ? '' : undefined}
                          onClick={() => set('locId', l.id)}
                        >
                          {l.name}
                          <b>{fmtN(l.yield)} kWh/kWp</b>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* The dial, and the split that decides whether the next
                    step's number moves: what the array serves on site against
                    what it spills to the grid. */}
                <div className={`${s.duo} ${s.duoWide}`}>
                  <label className={`${s.plate} ${s.field}`}>
                    <span className={s.fieldLab}>Array size</span>
                    <span className={s.fieldIn}>
                      <input
                        type="number" min={0} max={3000} value={input.solarKwp}
                        onChange={e => set('solarKwp', Number(e.target.value))}
                      />
                      <span className={s.unit}>kWp</span>
                    </span>
                    <input
                      className={s.range} type="range" min={0} max={3000} step={5}
                      value={input.solarKwp} onChange={e => set('solarKwp', Number(e.target.value))}
                      aria-label="Array size in kilowatt peak"
                    />
                    <button type="button" className={s.ghost} onClick={matchSolar}>Match my daily load</button>
                  </label>

                  {m.kwp > 0 ? (
                    <div className={s.plate}>
                      <ShareDonut
                        caption="Where the generation goes"
                        centre={`${Math.round((m.selfAnnual / (m.genAnnual || 1)) * 100)}%`}
                        centreLab="used on site"
                        parts={[
                          { k: 'self', v: m.selfAnnual, label: 'Serves your load' },
                          { k: 'spill', v: Math.max(0, m.genAnnual - m.selfAnnual), label: 'Spills to the grid' },
                        ]}
                      />
                    </div>
                  ) : (
                    /* An empty plate rather than a missing column: at 0 kWp
                       there is no split to draw, and letting the field stretch
                       across both tracks would move the slider under the
                       reader's pointer the moment they raise it off zero. */
                    <p className={`${s.plate} ${s.empty}`}>
                      Set an array size to see how much of it you would use on site.
                    </p>
                  )}
                </div>

                <DayArea
                  values={m.solarDay}
                  caption="Generation across the day"
                  unit="kWh"
                  tone="solar"
                  total={`${fmtN(m.genAnnual / 1000, 1)} MWh a year`}
                />

                {/* Across the width rather than five stacked rows — the same
                    tile row the load and storage steps use. */}
                <dl className={s.facts}>
                  {solarRows(m).map(r => <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}
                </dl>
              </div>
            )}

            {step === 5 && (
              <div className={s.result}>
                {/* The figure and its parts side by side. On its own the number
                    is a claim; next to the three things that make it up it is
                    an argument — and it fills a row that was one wide card
                    with the rest of the width empty. */}
                <div className={s.resultTop}>
                  <div className={s.big}>
                    <span className={s.bigLab}>Estimated first-year saving</span>
                    <strong className={s.bigNum}>{fmtR(saving)}</strong>
                    <span className={s.bigSub}>{savingPctText(m)}</span>
                  </div>

                  <div className={s.breakdown}>
                    <ShareDonut
                      caption="Where it comes from"
                      centre={fmtR(m.saving / 12).replace('R ', 'R')}
                      centreLab="a month"
                      parts={[
                        { k: 'arb', v: m.arbitrage, label: 'Shifting off peak' },
                        { k: 'dem', v: m.demandSaving, label: 'Demand charge relief' },
                        { k: 'sol', v: m.solarSaving, label: 'Solar generation' },
                      ]}
                    />
                  </div>
                </div>

                <dl className={s.headline}>
                  {headlineRows(m).map(r => (
                    <div key={r.k}>
                      <dt>{r.k}</dt>
                      <dd>{r.v}</dd>
                      <p>{r.sub}</p>
                    </div>
                  ))}
                </dl>

                {/* The configuration, card by card, each with the way back to
                    the step that set it. */}
                <div className={s.cardsRow}>
                  {summaryCards(m, input.voltage, input.qty).map((c, i) => (
                    <div key={c.tag} className={s.sum} style={{ ['--i' as string]: String(i) }}>
                      <span className={s.kicker}>{c.tag}</span>
                      <p className={s.sumTitle}>{c.title}</p>
                      <dl className={s.kv}>
                        {c.rows.map(r => <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}
                      </dl>
                      <button type="button" className={s.edit} onClick={() => setStep(c.step)}>Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className={s.simWrap}>
                {/* The banner carries both calls to action. They used to sit
                    under the feature list, where the last thing on the last
                    step was a link tucked below a table; on the banner they
                    are the step's own offer, and the list reads as the
                    supporting detail it is. */}
                <aside className={s.banner}>
                  <Image
                    className={s.bannerArt}
                    src="/images/calc/banner.png"
                    alt=""
                    width={4951}
                    height={1648}
                    sizes="(max-width: 900px) 92vw, 74vw"
                  />
                  <p className={s.bannerCopy}>
                    Get a full in-depth look at how Hubble can help you save.
                  </p>
                  <div className={s.bannerCtas}>
                    <Button href="/full-simulation" variant="primary">Try the full simulator</Button>
                    <Button href="/contact" variant="ghost">Talk to our team</Button>
                  </div>
                </aside>

                <div className={s.sim}>
                  <div className={s.carry}>
                    <span className={s.fieldLab}>Carried into the simulation</span>
                    <p className={s.carryTitle}>{simCarry(m, input.voltage).title}</p>
                    <dl className={s.kv}>
                      {simCarry(m, input.voltage).rows.map(r => (
                        <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>
                      ))}
                    </dl>
                  </div>
                  <ul className={s.simList}>
                    {SIM_FEATURES.map(([k, v], i) => (
                      <li key={k} style={{ ['--i' as string]: String(i) }}>
                        <span className={s.simNo}>{String(i + 1).padStart(2, '0')}</span>
                        <b>{k}</b><span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Outside the pane, and spanning both columns, so its rule and its
            buttons run the panel's full width at every step — the line the
            intro screen draws, held for the rest of the wizard. Out of the
            pane also means it no longer restarts the entrance animation on
            every step: it is standing chrome, not part of the step. */}
        <div className={s.foot}>
          <button
            type="button" className={s.back}
            disabled={step === 0}
            onClick={() => setStep(v => Math.max(0, v - 1))}
          >
            Back
          </button>
          <span className={s.progress} aria-hidden="true">
            <span style={{ ['--p' as string]: String((step + 1) / STEPS.length) }} />
          </span>
          <button
            type="button" className={s.next}
            disabled={blocked || step === last}
            /* Leaving step one is what reveals the rail and the total. The
               button is already gated on `blocked`, so reaching here at all
               means a connection type has been chosen. */
            onClick={() => { setRevealed(true); setStep(v => Math.min(last, v + 1)) }}
          >
            {step === last ? 'Done' : step === 4 ? 'See my saving' : 'Continue'}
          </button>
        </div>
      </div>
    </section>
  )
}
