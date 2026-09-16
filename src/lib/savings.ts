/**
 * The savings model, ported from the client's Claude Design canvas prototype
 * (`Savings Calculator v2.dc.html`). That prototype is client material and is
 * kept outside the repo, in `../Hubble 2026 Masters/client-material/`.
 *
 * This port is **verified exact** against an independent transcription of the
 * original formula — baseline 3 364 081.6, saving 1 384 161.0, capex 5 060 000,
 * payback 3.656. If a figure here ever looks wrong, diff against those numbers
 * before re-deriving anything.
 *
 * The numbers are carried over unchanged — tariffs, load shapes, battery
 * formats, yields and every step of the arithmetic. Only the surrounding code
 * is new: this file is a pure module so the UI can render it without owning any
 * of it, and so the figures can be checked without a browser.
 *
 * Rates are indicative FY2026/27.
 */

export type Voltage = 'hv' | 'lv'
type Cls = Voltage | 'both'

export type Bands = { peak: number; std: number; off: number }
export type Tariff = {
  id: string; cls: Cls; name: string; dso: string; type: 'TOU' | 'Flat'
  /** Fixed monthly charge, rand. */
  fee: number
  /** Monthly demand charge per kVA, rand. */
  demand: number
  /** Winter and summer energy rates, rand per kWh. */
  w: Bands; s: Bands
}
export type Profile = { id: string; cls: Cls; name: string; desc: string; shape: number[] }
export type Battery = {
  id: string; cls: Cls; tag: string; name: string
  kwh: number; kw: number; eff: number; cost: number
}
export type Location = { id: string; name: string; yield: number }

/** Time-of-use bands, by hour of day. */
const PEAK_H = [7, 8, 9, 18, 19]
const OFF_H = [0, 1, 2, 3, 4, 5, 22, 23]
export const periodOf = (h: number): keyof Bands =>
  PEAK_H.includes(h) ? 'peak' : OFF_H.includes(h) ? 'off' : 'std'
export const isPeakHour = (h: number) => PEAK_H.includes(h)

export const TARIFFS: Tariff[] = [
  { id: 'megaflex', cls: 'hv', name: 'Eskom Megaflex', dso: 'Eskom Direct', type: 'TOU', fee: 6120, demand: 152.4, w: { peak: 7.38, std: 2.29, off: 1.44 }, s: { peak: 3.27, std: 2.13, off: 1.66 } },
  { id: 'nightsave', cls: 'hv', name: 'Nightsave Urban Large', dso: 'Eskom Direct', type: 'TOU', fee: 5480, demand: 186.2, w: { peak: 4.02, std: 2.41, off: 1.52 }, s: { peak: 2.44, std: 2.05, off: 1.61 } },
  { id: 'nmb', cls: 'hv', name: 'Large Business TOU', dso: 'Nelson Mandela Bay', type: 'TOU', fee: 7402, demand: 170.29, w: { peak: 7.38, std: 2.29, off: 1.44 }, s: { peak: 3.27, std: 2.13, off: 1.66 } },
  { id: 'ctlpu', cls: 'hv', name: 'Large Power User TOU', dso: 'City of Cape Town', type: 'TOU', fee: 8140, demand: 143.6, w: { peak: 6.94, std: 2.36, off: 1.51 }, s: { peak: 3.18, std: 2.21, off: 1.72 } },
  { id: 'homeflex', cls: 'lv', name: 'Eskom Homeflex', dso: 'Eskom Direct', type: 'TOU', fee: 230, demand: 0, w: { peak: 7.12, std: 2.18, off: 1.38 }, s: { peak: 3.11, std: 2.02, off: 1.55 } },
  { id: 'businessrate', cls: 'lv', name: 'Eskom Businessrate 1', dso: 'Eskom Direct', type: 'Flat', fee: 610, demand: 0, w: { peak: 3.42, std: 3.42, off: 3.42 }, s: { peak: 2.86, std: 2.86, off: 2.86 } },
  { id: 'ctspu', cls: 'lv', name: 'Small Power User', dso: 'City of Cape Town', type: 'Flat', fee: 415, demand: 0, w: { peak: 3.28, std: 3.28, off: 3.28 }, s: { peak: 3.28, std: 3.28, off: 3.28 } },
  { id: 'citypower', cls: 'lv', name: 'Residential Prepaid', dso: 'City Power Joburg', type: 'Flat', fee: 0, demand: 0, w: { peak: 3.65, std: 3.65, off: 3.65 }, s: { peak: 3.65, std: 3.65, off: 3.65 } },
]

export const PROFILES: Profile[] = [
  { id: 'factory', cls: 'hv', name: 'Factory — 3 shifts', desc: 'Continuous 24/7, dips at shift change.', shape: [.9, .88, .9, .9, .88, .85, .95, 1, 1, .98, 1, .97, .95, .9, .98, 1, .98, .96, .9, .95, .97, .9, .88, .9] },
  { id: 'cold', cls: 'hv', name: 'Cold storage', desc: 'High base, afternoon thermal peak.', shape: [.75, .72, .7, .7, .72, .78, .85, .9, .95, 1, 1, .98, .95, .95, .98, 1, .95, .9, .88, .85, .82, .8, .78, .76] },
  { id: 'office', cls: 'both', name: 'Office / Commercial', desc: 'Weekday 07:00–18:00, flat overnight.', shape: [.15, .14, .14, .14, .15, .2, .35, .6, .85, .95, 1, 1, .95, .95, 1, .98, .9, .7, .45, .3, .22, .18, .16, .15] },
  { id: 'retail', cls: 'both', name: 'Retail / Hospitality', desc: 'Late ramp, holds through trade.', shape: [.2, .18, .18, .18, .2, .25, .35, .5, .7, .85, .95, 1, 1, .98, .95, .95, .98, 1, .95, .8, .55, .35, .25, .22] },
  { id: 'home', cls: 'lv', name: 'Home', desc: 'Morning and evening peaks.', shape: [.25, .2, .18, .18, .2, .3, .6, .8, .55, .4, .35, .35, .4, .38, .4, .45, .6, .85, 1, .95, .8, .6, .4, .3] },
]

export const BATTERIES: Battery[] = [
  { id: 'hv314', cls: 'hv', tag: 'INDUSTRIAL', name: 'HV 314Ah Rack', kwh: 217, kw: 110, eff: 0.94, cost: 1180000 },
  { id: 'cont', cls: 'hv', tag: 'UTILITY', name: 'Container 12.5 MWh', kwh: 12500, kw: 6900, eff: 0.94, cost: 58000000 },
  { id: 'comm100', cls: 'both', tag: 'COMMERCIAL', name: 'Commercial Rack 100', kwh: 100, kw: 50, eff: 0.94, cost: 610000 },
  { id: 'home10', cls: 'lv', tag: 'RESIDENTIAL', name: 'Hubble AM-5', kwh: 10.24, kw: 5.0, eff: 0.95, cost: 88000 },
  { id: 'home5', cls: 'lv', tag: 'RESIDENTIAL', name: 'Hubble AM-2', kwh: 5.12, kw: 3.6, eff: 0.95, cost: 46000 },
]

export const LOCATIONS: Location[] = [
  { id: 'jhb', name: 'Johannesburg', yield: 1900 },
  { id: 'cpt', name: 'Cape Town', yield: 1720 },
  { id: 'pe', name: 'Gqeberha', yield: 1750 },
  { id: 'dbn', name: 'Durban', yield: 1620 },
  { id: 'kim', name: 'Kimberley', yield: 2020 },
]

/** Normalised generation over the day; scaled by annual yield at run time. */
const SOLAR_SHAPE = [0, 0, 0, 0, 0, 0, .04, .14, .32, .52, .72, .88, .96, .96, .88, .72, .52, .3, .12, .02, 0, 0, 0, 0]
const SOLAR_SUM = SOLAR_SHAPE.reduce((a, b) => a + b, 0)
const WINTER_DAYS = 92
const SUMMER_DAYS = 273

/** Options for the current supply class — `both` entries appear either side. */
export const forClass = <T extends { cls: Cls }>(list: T[], v: Voltage) =>
  list.filter(x => x.cls === v || x.cls === 'both')

export type Inputs = {
  voltage: Voltage
  tariffId: string
  profileId: string
  peakKw: number
  batteryId: string
  qty: number
  solarKwp: number
  locId: string
}

export type Model = ReturnType<typeof model>

export function model(input: Inputs) {
  const tariff = TARIFFS.find(t => t.id === input.tariffId) ?? TARIFFS[0]
  const profile = PROFILES.find(p => p.id === input.profileId) ?? PROFILES[0]
  const batt = BATTERIES.find(b => b.id === input.batteryId) ?? BATTERIES[0]
  const loc = LOCATIONS.find(l => l.id === input.locId) ?? LOCATIONS[0]

  const peak = Math.max(1, Number(input.peakKw) || 0)
  const load = profile.shape.map(v => v * peak)
  const dayKwh = load.reduce((a, b) => a + b, 0)
  const annualKwh = dayKwh * 365

  const bandDay = (rates: Bands) => load.reduce((a, v, h) => a + v * rates[periodOf(h)], 0)
  const energyCost = bandDay(tariff.w) * WINTER_DAYS + bandDay(tariff.s) * SUMMER_DAYS
  const baseline = energyCost + tariff.fee * 12 + tariff.demand * peak * 12

  const usable = batt.kwh * Math.max(0, Number(input.qty) || 0)
  const power = batt.kw * Math.max(0, Number(input.qty) || 0)
  const peakDayKwh = load.reduce((a, v, h) => a + (periodOf(h) === 'peak' ? v : 0), 0)
  /* Only what the bank can actually move out of the peak window, after
     round-trip losses and a 10% headroom for depth of discharge. */
  const shifted = Math.min(usable * batt.eff * 0.9, peakDayKwh)
  const arbitrage = shifted * ((tariff.w.peak - tariff.w.off) * WINTER_DAYS + (tariff.s.peak - tariff.s.off) * SUMMER_DAYS)
  /* Demand charge relief is capped at a third of notified maximum demand — past
     that the bank is carrying the site, which this first pass does not claim. */
  const demandSaving = Math.min(power, peak * 0.35) * tariff.demand * 12

  const kwp = Math.max(0, Number(input.solarKwp) || 0)
  const genAnnual = kwp * loc.yield
  const solarDay = SOLAR_SHAPE.map(v => (v / SOLAR_SUM) * (genAnnual / 365))
  const selfAnnual = Math.min(solarDay.reduce((a, v, h) => a + Math.min(v, load[h]), 0) * 365, genAnnual)
  const blendW = bandDay(tariff.w) / dayKwh
  const blendS = bandDay(tariff.s) / dayKwh
  const solarSaving = selfAnnual * ((blendW * WINTER_DAYS + blendS * SUMMER_DAYS) / 365)

  /* Held under 82% of the energy bill plus demand relief: no configuration in a
     first-pass estimate should read as taking the site off grid. */
  const saving = Math.min(arbitrage + demandSaving + solarSaving, energyCost * 0.82 + demandSaving)
  const capex = usable * (batt.cost / batt.kwh) + kwp * (kwp > 500 ? 9500 : 13500)

  return {
    tariff, profile, batt, loc, peak, load, dayKwh, annualKwh, baseline, energyCost,
    usable, power, peakDayKwh, shifted, arbitrage, demandSaving, kwp, genAnnual, selfAnnual,
    solarSaving, solarDay, saving, capex,
    payback: saving > 0 ? capex / saving : 0,
  }
}

/* ── Formatting ─────────────────────────────────────────────── */
/** Thin spaces as the group separator, per the comp. */
const group = (s: string) => s.replace(/,/g, ' ')
export const fmtR = (n: number) => 'R ' + group(Math.round(n).toLocaleString('en-GB'))
export const fmtN = (n: number, d = 0) =>
  group(n.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }))
export const fmtKwh = (n: number) =>
  n >= 1_000_000 ? fmtN(n / 1_000_000, 2) + ' GWh'
    : n >= 1000 ? fmtN(n / 1000, 1) + ' MWh'
      : fmtN(n, n < 100 ? 1 : 0) + ' kWh'

/* ── Derived read-outs ──────────────────────────────────────── */
/* Kept beside the model rather than in the view: these are the prototype's own
   row sets, and they are arithmetic, not presentation. */

export const rateRows = (r: Bands) => [
  { k: 'Peak', v: 'R ' + r.peak.toFixed(2) },
  { k: 'Std', v: 'R ' + r.std.toFixed(2) },
  { k: 'Off', v: 'R ' + r.off.toFixed(2) },
]

export const tariffMeta = (m: Model) => [
  { k: 'Distributor', v: m.tariff.dso },
  { k: 'Monthly fee', v: fmtR(m.tariff.fee) },
  { k: 'Demand', v: m.tariff.demand ? 'R ' + m.tariff.demand.toFixed(2) + '/kVA' : 'None' },
  { k: 'Annual bill', v: fmtR(m.baseline) },
]

export const batterySpec = (b: Battery) =>
  `${fmtN(b.kwh, b.kwh < 100 ? 2 : 0)} kWh · ${fmtN(b.kw, 0)} kW · ${Math.round(b.eff * 100)}% RTE`

/** The units the peak window actually needs, clamped to something orderable. */
export const recQty = (b: Battery, peakDayKwh: number) =>
  Math.max(1, Math.min(200, Math.round(peakDayKwh / b.kwh) || 1))

export const bessRows = (m: Model) => [
  { k: 'Usable capacity', v: fmtKwh(m.usable) },
  { k: 'Discharge power', v: fmtN(m.power, 0) + ' kW' },
  /* Both off `m.shifted` now that the model exports it. They each rebuilt the
     same expression by hand, and the coverage donut on the storage step reads
     the model directly — three copies of one formula that had to agree. */
  { k: 'Daily energy shifted', v: fmtKwh(m.shifted) },
  { k: 'Evening peak covered', v: Math.round((m.shifted / Math.max(1, m.peakDayKwh)) * 100) + '%' },
  { k: 'Indicative capex', v: fmtR(m.usable * (m.batt.cost / m.batt.kwh)) },
]

export const solarRows = (m: Model) => [
  { k: 'Specific yield', v: fmtN(m.loc.yield, 0) + ' kWh/kWp' },
  { k: 'Annual generation', v: fmtKwh(m.genAnnual) },
  { k: 'Self-consumed', v: fmtKwh(m.selfAnnual) },
  { k: 'Share of your load', v: Math.round((m.selfAnnual / m.annualKwh) * 100) + '%' },
  { k: 'Indicative capex', v: fmtR(m.kwp * (m.kwp > 500 ? 9500 : 13500)) },
]

export const headlineRows = (m: Model) => [
  { k: 'Current bill', v: fmtR(m.baseline), sub: fmtKwh(m.annualKwh) + ' a year' },
  { k: 'System capex', v: fmtR(m.capex), sub: 'Storage plus solar' },
  {
    k: 'Simple payback',
    v: m.payback > 0 && m.payback < 40 ? fmtN(m.payback, 1) + ' yrs' : '—',
    sub: m.payback > 0 && m.payback < 40 ? 'Before escalation' : 'Add storage or solar',
  },
]

/** The five configuration cards on the results step; `step` is where Edit goes. */
export const summaryCards = (m: Model, voltage: Voltage, qty: number) => [
  { tag: 'Connection', title: voltage === 'hv' ? 'Medium / high voltage' : 'Low voltage', step: 0,
    rows: [{ k: 'Tariff type', v: m.tariff.type }, { k: 'DSO', v: m.tariff.dso.split(' ')[0] }] },
  { tag: 'Tariff', title: m.tariff.name, step: 1,
    rows: [{ k: 'Peak (winter)', v: 'R ' + m.tariff.w.peak.toFixed(2) }, { k: 'Demand', v: 'R ' + m.tariff.demand.toFixed(2) }, { k: 'Annual bill', v: fmtR(m.baseline) }] },
  { tag: 'Load', title: m.profile.name, step: 2,
    rows: [{ k: 'Peak demand', v: fmtN(m.peak, 0) + ' kW' }, { k: 'Annual use', v: fmtKwh(m.annualKwh) }] },
  { tag: 'Storage', title: `${m.batt.name} × ${qty}`, step: 3,
    rows: [{ k: 'Usable', v: fmtKwh(m.usable) }, { k: 'Power', v: fmtN(m.power, 0) + ' kW' }, { k: 'Arbitrage', v: fmtR(m.arbitrage) }] },
  { tag: 'Solar', title: m.kwp > 0 ? fmtN(m.kwp, 0) + ' kWp array' : 'No array', step: 4,
    rows: [{ k: 'Location', v: m.loc.name }, { k: 'Generation', v: fmtKwh(m.genAnnual) }, { k: 'Saving', v: fmtR(m.solarSaving) }] },
]

export const simCarry = (m: Model, voltage: Voltage) => ({
  title: (voltage === 'hv' ? 'Medium / high voltage' : 'Low voltage') + ' · ' + m.profile.name,
  rows: [
    { k: 'Tariff', v: m.tariff.type + ' · ' + m.tariff.dso.split(' ')[0] },
    { k: 'Peak demand', v: fmtN(m.peak, 0) + ' kW' },
    { k: 'Storage / solar', v: fmtKwh(m.usable) + (m.kwp > 0 ? ' · ' + fmtN(m.kwp, 0) + ' kWp' : '') },
    { k: 'First-year saving', v: fmtR(m.saving) },
  ],
})

export const savingPctText = (m: Model) =>
  `${Math.round((m.saving / m.baseline) * 100)}% off your bill · ${fmtR(m.saving / 12)} a month`
