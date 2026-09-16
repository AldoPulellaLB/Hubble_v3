# Hubble Products — Catalogue & Content Reference

Compiled 2026-08-17 from `Docs/Products/*.pdf` and the live site (`hubbleenergy.com`).
This is the working source for the Products section. Specs are as published — **verify against
current spec sheets before launch**, all brochures carry "specifications subject to change".

---

## Structure

Three categories, per the brief and the new sitemap:

| Category | Old-site name | Voltage class | What it is |
|---|---|---|---|
| **Residential** | Home + Small Business | Low Voltage (12–51.2V) | 4 series, 8 models |
| **Commercial** | Commercial + Industrial | High Voltage (204–840V) | Indoor racks/stacks + outdoor all-in-one |
| **CloudLink** | Monitoring | — | The intelligence layer + mobile apps |

---

## 1. Residential — Low Voltage

> *"We design and manufacture best-in-class residential energy storage products — available through
> our nationwide network of resellers and installers."*

**Category pillars (from the live site, reusable):** Versatile range 12V→51V · Seamless inverter
integration via CAN bus · Advanced first-life prismatic lithium cells · Remote monitoring via
CloudLink.

### 1.1 Range at a glance

| Series | Model | Capacity | Voltage | C-rate | CloudLink | Warranty | Mounting |
|---|---|---|---|---|---|---|---|
| **S** | S-100A | 1.2 kWh · 100Ah | 12.8V | 1.0C | — | 10 yr | Free-standing; lead-acid replacement |
| **X** | X-101 (X5+) | 5.5 kWh · 116Ah | 48V | 1.0C | Ready | 10 yr | Standard server rack |
| **AM** | AM2+ | 5.5 kWh · 117Ah | 48V | 1.0C | Integrated | 10 yr | Wall or shelf rack |
| **AM** | AM4 | 2.56 kWh · 100Ah | 25.6V | 1.0C | Ready | 10 yr | Wall or shelf rack |
| **AM+** | AM5+ | 5.12 kWh · 100Ah | 51.2V | — | Integrated | **Unlimited cycles**, 10 yr | Shelf rack / wall bracket |
| **AM+** | AM10+ | 10 kWh · 200Ah | 51.2V | — | Integrated | **Unlimited cycles**, 10 yr | Wall bracket |
| **AM+** | AM16+ | 16.1 kWh · 314Ah | 51.2V | — | Integrated | **Unlimited cycles**, 10 yr | Floor-standing, no install |
| **Blade** | Blade | 7 kWh / 10 kW · 137Ah | 51.2V | **1.5C** | Built-in | **Unlimited cycles**, 10 yr | Wall-mount brackets |

*Unlimited-cycle warranty applies to AM5+, AM10+, AM16+ and Blade (Ts & Cs apply).*

### 1.2 Key specs by model

<details><summary><b>S-100A</b> — 1.2 kWh · 12.8V</summary>

- Rated capacity (5HR) 100Ah · Nominal 12.8V · Discharge end 12V · Charge limit 14V
- Max charge / continuous discharge 100A · Cell C-rating 1.0C
- Weight ~10.5 kg · Dimensions 305 × 170 × 220 mm (W×D×H)
- Configurable 12V / 24V / 36V / 48V in series; up to 16 batteries (4S4P) in 48V
- Cells 1st-life prismatic LiFePO4 · Design life ±15 yrs · Cycle life ±4 000 @ 1C
- IP65 · Black polypropylene case
- Certification CE, UN38.3, GBT31484/31485/31486-2015
- Positioning: **lead-acid replacement** when paired with lithium-compatible inverters
</details>

<details><summary><b>X-101 (X Series)</b> — 5.5 kWh · 48V</summary>

- Rated capacity (5HR) 116Ah · Equalised charge 53.8V · Max continuous charge/discharge 105A
- Weight ~42 kg · Dimensions 442 × 495 × 177.5 mm (W×D×H) — standard server rack
- Parallel up to 15 packs with full comms · 1 × CAN-bus, 2 × battery link ports
- Design life ±15 yrs · Cycle life ±6 000 @ 50% DOD, >3 000 @ 100% DOD
- Internal fire suppression system · CloudLink-ready · White baked-lacquer steel
</details>

<details><summary><b>AM2+</b> — 5.5 kWh · 48V</summary>

- Rated capacity (5HR) 117Ah · Equalised charge 53.8V · Max continuous charge/discharge 105A
- Weight ~42 kg · Dimensions 375 × 145 × 467 mm (W×D×H)
- Parallel up to 15 packs · Cycle life ±6 000 @ 50% DOD, >3 000 @ 100% DOD
- Integrated 24/7 CloudLink monitoring · Internal fire suppression · Wall or shelf rack
</details>

<details><summary><b>AM4</b> — 2.56 kWh · 25.6V</summary>

- Rated capacity (5HR) 100Ah · Equalised charge 27.6V · Max continuous charge/discharge 100A
- Weight ~25 kg · Dimensions 420 × 153 × 490 mm (W×D×H)
- Smart LED status bar · CloudLink-ready · Internal fire suppression
- Cycle life >6 000 @ 50% DOD, ±3 000 @ 100% DOD
</details>

<details><summary><b>AM+ Series (AM5+ / AM10+ / AM16+)</b> — 51.2V</summary>

| | AM5+ | AM10+ | AM16+ |
|---|---|---|---|
| Nominal energy | 5.12 kWh | 10 kWh | 16.1 kWh |
| Rated capacity | 100Ah | 200Ah | 314Ah |
| Charge current | 100A max | 115A max | 130A continuous |
| Discharge current | 100A max | 200A max | 200A max |
| Recommended charge | 30A | 60A | 105A |
| Dimensions (H×W×D) | 600 × 500 × 153 mm | 675 × 510 × 230 mm | 1035 × 500 × 265 mm |
| Weight | 53 kg | 89 kg | 131.5 kg |
| Mounting | Shelf rack / wall bracket | Wall bracket | Floor — no install |

**Shared across the series**
- Nominal 51.2V · LiFePO4 (LFP), 16 cells per battery · Operating range 44.8–57.6 Vdc
- Inverter cut-off 49V recommended / 47V minimum · Charging voltage 55.2 Vdc
- Cycle life: **unlimited cycles within the 10-year warranty** (Ts & Cs apply)
- BMS: passive cell balancing near full charge; **intelligent current limiter** drops charge to 20A
  if it exceeds 200A (AM10+/AM16+) or 100A (AM5+)
- Protection: over-charge, over-discharge, over-current, short circuit, over/under temperature
- CloudLink built in — ≤2W self-consumption, 2.4 GHz Wi-Fi 802.11 b/g/n/e/i, CAN / RS485 / RS232
- Environment: −10 °C to 50 °C operating · humidity 15–75% · CE, IEC, UN38.3
- Scalable to **120 units** · RGB LED display strip · heavy-duty handles
- AM16+ adds: low centre of gravity with anti-tip, wheels for mobility, plug-and-play floor placement
</details>

<details><summary><b>Blade</b> — 7 kWh / 10 kW · 51.2V · the flagship</summary>

- Rated capacity (5HR) 137Ah · Design capacity 7 kWh / 10 kW · Equalised charge 55.8V
- **1.5C rating** — industry-leading performance in the range
- Max continuous charging 140A · Max continuous discharging 200A
- Weight ~64 kg · Dimensions 1125 × 175 × 340 mm (W×D×H) — slim wall-mount
- **16-cell LiFePO4 graphite Blade cells** — positioned as "the safest in the industry"
- Built-in cloud monitoring, Wi-Fi enabled · firmware updates over the internet
- Smart LED status bar · internal wiring cable compartment · parallel up to 15 units
- Operating: charging −20 °C to +55 °C · discharging −30 °C to +55 °C
- Cycle life: **unlimited within the 10-year warranty**
- Ports: 1 × CAN-bus, 2 × battery link, 1 × Axpert inverter port
</details>

---

## 2. Commercial & Industrial — High Voltage

> *"Your turnkey energy solutions partner."* Fully integrated solutions from design and
> installation to monitoring and maintenance.

Split two ways on the old site — keep the split, it's a genuinely useful distinction:

### 2.1 Indoor solutions

| Product | Capacity | Voltage | C-rate | Notes |
|---|---|---|---|---|
| **HV100Ah (Rack)** | 20.4 – 76.8 kWh | 204 – 768V | 1C | 4 models; standard server cabinets; smart BMU auto-detects modules |
| **HV100Ah (Stack)** | 30.7 – 81.9 kWh | 307 – 819V | 1C | 6 models; stackable, floor-standing; parallel up to 8 ESS/string |
| **HV280Ah (Rack)** | — | — | — | *Spec not yet captured — needs the data sheet* |
| **HV314Ah (Rack) / HV-768-241** | **241 kWh** | **768V** | 0.5C | 15 × 16.077 kWh modules; parallel 10 ESS/string → **2.41 MWh**; 10 000 cycles |

**HV-768-241 detail:** max rated continuous power 120.6 kW · operating range 720–840V (10–100% SOC)
· continuous charge/discharge 157A (0.5C) @ 25 °C · dual-channel **active cell & module balancing**
· forced-air cooling · intelligent touchscreen · fire detection · cell leakage protection ·
A-grade prismatic LiFePO4.

**Shared indoor features:** modular buildable design · intelligent touchscreen · Wi-Fi monitoring,
live + historical · remote firmware updates · CAN bus integration with leading inverters · remote
monitoring/management/diagnostics via EMS · off-grid, on-grid & solar ready · 10-yr warranty.

### 2.2 Outdoor solutions

| Product | Power | Storage | Notes |
|---|---|---|---|
| **Energy Cube** | 50–80 kW · 105 kW · 125 kW | 143–160 kWh · 241 kWh · 261 kWh | All-in-one outdoor |
| **Energy Block** | 150–600 kW / 250–1000 kW | 241 – 2410 kWh | 0.7C; industrial transformer inverter system; Block 150 / Block 250 |
| **Energy Container** | 500 kW | 482 – 1446 kWh | Plus liquid-cooled: 5.015 MWh, 6.25 MWh 2h (587Ah cells), 6.25 MWh 4h (1175Ah cells) — non-walk-in, all maintenance from the exterior |

<details><summary><b>Energy Cube 50–80 kW / 143–160 kWh</b> — full technical data</summary>

**AC output (on/off grid)**
| | 50 kW | 80 kW |
|---|---|---|
| Max AC output | 55 kVA | 88 kVA |
| Rated AC output | 50 kW | 80 kVA |
| AC output rated current | 72.5A | 115.9A |

Peak power (off grid) 1.5 × rated for 10s · rated output 400V · range 320–460V · 50/60 Hz ·
THDI <3% · PF 0.8 leading to 0.8 lagging · three phase + N · **on/off grid switch <20 ms**

**Battery**
| | 50 kW / 143 kWh | 80 kW / 160 kWh |
|---|---|---|
| Cell spec | 3.2V 280Ah | 3.2V 314Ah |
| Combination | 160S1P | 1P160S |
| Capacity | 143 kWh | 160 kWh |
| Max charge/discharge power | 50 kW | 80 kW |
| Max charge/discharge current | 100A | 160A |
| Voltage range | 448–584V | 464–576V |

Battery rated voltage 512V · Li-ion

**PV string input** — max DC input 65 kW / 160 kW · max DC input voltage 1000V · start-up 180V ·
full-load DC range 450–850V · 4 or 6 MPPT trackers, 2 strings each

**Physical & environmental** — cabinet 1180 × 1020 × 2275 mm · 1780 kg / 1850 kg approx ·
max cycle efficiency ≥90% · **IP54** · corrosion rating **C3** · humidity 0–100% non-condensing ·
**−30 °C to 50 °C** (derating >45 °C) · max altitude 2000 m · intelligent air cooling ·
gas-based fire extinguishing with pressure relief valve, pack-level and cluster-level fire
protection · Ethernet / 485 / CAN, Modbus TCP · hybrid inverter with integrated EMS ·
forkliftable with rigging eye bolts · certified UN3536, UN38.3, NRS097, IP54
</details>

**Shared outdoor features:** all-in-one LiFePO4 + hybrid inverter + MPPTs in one outdoor-ready
enclosure · **IP54, C4 corrosion resistance** (coastal-capable) · advanced EMS enabling **energy
arbitrage, peak shaving and load management** · 10 000-cycle life · cell leakage protection ·
active cell & module balancing · intelligent fire suppression, smoke detection, alarm · industrial
air conditioning · remote monitoring · optional on-site commissioning · optional SLA · 10-yr
battery warranty (inverter 5 yr, extendable to 10).

### 2.3 Commercial page copy assets (reusable)

**Why choose Hubble** — pre-sale system design · local support, training and commissioning ·
field service technicians · comprehensive warranty & optional SLA · remote monitoring and
management via EMS · proactive monitoring · off-grid, on-grid, solar-ready · world-class product
with local expertise · scalable, modular, bespoke.

**Three proof pillars** — *On the ground expertise* (30 years combined industry experience; site
visits, system design, remote diagnostics) · *Local R&D* (in-house engineers and software
developers solving African energy challenges) · *Quality + reliable product*.

**The three benefit clusters** — map straight onto the brand strategy's commercial framing:

| Cluster | Points |
|---|---|
| **Energy security, reduced disruptions** | Reliable power · ensured productivity (manufacturing, data centres, HVAC, critical operations) · reduce diesel reliance · quick response to supply demands |
| **Predictable & manageable energy costs** | Peak shaving · long-term savings · real-time monitoring with remote diagnosis |
| **Improved sustainability, access to green markets** | Reduce carbon emissions · maximise solar · scalable systems |

**Quotes available for use**
- *"Farmers are already reporting huge losses as processing machinery, irrigation equipment and other machinery are damaged and come to a standstill due to power outages."* — Agri SA
- *"Our Hubble High Voltage solution mitigates the impact of loadshedding, arbitrages the expensive peak electricity costs and minimises our carbon footprint."* — John Drinkwater, MD, Cerebos
- *"South Africa needs to take urgent action to mitigate against the CBAM and other carbon border taxes, or be left behind to the detriment of its economy and people."* — Trade & Industrial Policy Strategies (TIPS)

---

## 3. CloudLink

> **Proactive Monitoring — Maintain | Monitor | Diagnose**

24/7 remote monitoring with industry-grade end-to-end encryption and plug-and-play design. Fleet
management, live and historical data, real-time power-flow dashboard. Serves homeowners, installers
and corporations — and lets Hubble's own support team deliver rapid remote diagnostics.

**How it connects:** to the Hubble BMS via the RS232 port, reporting all statistics and alarms to
the cloud for both battery and select inverters. Its own CAN bus protocol **encapsulates five
different CAN bus protocols** — on connection to a CAN-enabled inverter it **auto-detects and
enables the correct protocol** via its onboard AI.

### 3.1 Eight key features

| Feature | Detail |
|---|---|
| **Artificial intelligence** | Built-in AI processor and algorithmic neural coding |
| **CAN bus** | Converter for Hubble lithium BMS; multiple protocols built in for maximum inverter compatibility |
| **Cloud monitoring & control** | Reports inverter and battery values to the cloud for monitoring, control and troubleshooting |
| **Cloud control** | Remotely change inverter operation modes and setup settings |
| **Security** | Industry-grade end-to-end encrypted cloud reporting and inverter control |
| **Auto updates** | Seamless encrypted over-the-cloud firmware updates |
| **Install** | Plug and play; powers directly from supporting inverter comm ports |
| **Local** | Supported, designed and engineered in South Africa |

### 3.2 Inverter compatibility

Battery monitoring across all; inverter monitoring/control varies.

| Inverter | Battery monitoring | Inverter monitoring | Inverter control |
|---|---|---|---|
| Microcare, Must, MLT, GoodWe, Growatt, Victron | ✅ | ❌ | ✅ |
| Phocos, Kodak, Synapse, Mecer, Sunsynk, Deye | ✅ | — | — |

*Table on the live site is partially collapsed — confirm the full matrix against the current
CloudLink brochure.* Inverter guides also exist for **Solis, Luxpower and Axpert**.

### 3.3 The apps — required on the home page

| App | iOS | Android |
|---|---|---|
| **Hubble CloudLink** (owner) | `apps.apple.com/gb/app/hubble-cloudlink/id6741428125` | `play.google.com/store/apps/details?id=com.hubble_energy.app` |
| **Hubble Installer v3** | `apps.apple.com/gb/app/hubble-installer-v3/id6755183600` | `play.google.com/store/apps/details?id=com.hubble_energy.installer` |

The brief calls for CloudLink featured on the home page as a downloadable app. **Two apps exist** —
recommend leading with the owner app on the home page and surfacing the Installer app on the
CloudLink product page and in the Partners section.

### 3.4 Strategic note

Per the brand strategy, CloudLink is the "Nike Air" of Hubble — the proprietary intelligence built
into every system, not a standalone product. Its differentiator worth foregrounding: **fleet
management across multiple sites regardless of equipment brand or age.**

---

## 4. Case studies available now

Enough to populate `/projects` at launch.

| Project | Scale | System | Story |
|---|---|---|---|
| **Cerebos Salt** | 2.211 MWh | 768V 120Ah 1C · 24 × 92.16 kWh racks | Electricity was up to 30% of salt manufacturing cost. Loadshedding threatened plant viability. Partner: Avianto Energy. East/West fixed solar. Reduces cost, mitigates loadshedding, arbitrages winter peak tariffs. |
| **MalaMala Game Reserve** | 860 kWh | 4 × HV768 clusters · 1 × ATESS PCS500 · 728 × 570W panels | Off-grid, Sabi Sand. Generator-integrated, PLC-controlled. Partner: Sunspec Solar. |
| **The Outpost, Kruger** | 256 kWh | 5 × HV512 sets · 118 × 550W panels | Recharges in 7 hours of daylight, powers 100% of lodge operations including conservation, wildlife monitoring and anti-poaching devices. Fits standard server cabinets. |
| **Rattray's on MalaMala** | 204 kWh | 4 × HV512 clusters · 1 × ATESS HPS150 · 340 × 550W panels | Ultra-luxury safari camp. Built-in CloudLink, modular scaling. |
| **Kirkman's Kamp** | 860 kWh | 4 × HV768 clusters | Sabi Sand. 10 000 cycles, active balancing, generator-integrated. |
| **Lodge, Mpumalanga** | 860 kWh | 4 × HV768 clusters · 1 × Megarevo MPS500 | Backup power plus meaningful cost savings. Partner: Infinix. |

**Filter facets these support:** Product (HV768 / HV512 / Cube) · Sector (Hospitality & Lodges /
Manufacturing / Agriculture) · Application (Off-grid / Backup / Arbitrage).

Applications called out on the old site: **Commercial & Industrial · Agriculture · Lodges ·
Microgrid · Access to green markets.**

---

## 5. Company facts (for About / proof strips)

- Founded **2020** as Hubble Lithium; renamed Hubble Energy
- Acquired by the **Bud Group in 2023**
- CloudLink app launched **2022**
- In-house R&D: battery management systems built for local conditions
- Portfolio spans up to **10 MWh**
- Services: data logging and analysis, **ROI modelling**, system design
- Counters (as published, verify): **20** years experience · **14** products · **160 000** products
  installed · **04** branches
- Branches: **Cape Town, Johannesburg, Gqeberha, Durban** — Mon–Thu 08:00–16:30, Fri 08:00–16:00
- Note: the new sitemap adds **Nigeria and Zambia** to the Africa presence; the live site only
  shows South African branches

---

## 6. Naming — follow the brand strategy

**High Voltage and Low Voltage are part of the brand architecture and are used as such.** The
strategy's narrative page (p.56) sets them out explicitly as the two arms of the offer:

| | Strategy wording |
|---|---|
| **LV** | *Residential and small-scale energy* → **"Intelligent energy for everyday life"**<br>Energy designed with a clear purpose. Ready when it matters. Quietly working behind every part of daily life. |
| **HV** | *Business and industrial energy* → **"Intelligent energy for sustained performance"**<br>Energy built around the business. Connected to its ambitions. Engineered to move performance forward. |
| **Master** | Hubble — **"Intelligent energy, always at work."**<br>Energy that can be seen and understood. Systems that respond and keep improving. Confidence that Hubble is always on it. |

What the strategy critiques (p.36) is **LV/HV as the *only* organising logic** — where the catalogue
leads with voltage and capacity and the commercial or human outcome arrives late, and where
CloudLink shows up as a compatibility footnote. The fix is ordering, not deletion.

**So on the new site:**

| Level | Treatment |
|---|---|
| Category name | **Residential** and **Commercial** (per the site map), with **Low Voltage** / **High Voltage** carried as the named system class throughout — page eyebrows, section labels, filters, spec tables, nav sub-labels |
| Lead line | The strategy's positioning line — *Intelligent energy for everyday life* / *Intelligent energy for sustained performance* |
| Opening copy | The outcome first, the voltage class immediately after. Not voltage instead of outcome, and not outcome without voltage. |
| Model names | Unchanged — **Blade, AM16+, X-101, HV-768-241, HV100Ah Stack, Energy Cube, Energy Block, Energy Container**. These carry reseller and installer recognition. |
| CloudLink | Present across both arms as the connective intelligence, plus its own page |

Example of the intended order on a Residential page:

> **Low Voltage** *(eyebrow)*
> ## Intelligent energy for everyday life
> Energy designed with a clear purpose. Ready when it matters. Quietly working behind every part
> of daily life. *(lead)*
> A Low Voltage system from 12V to 51.2V, built around how people actually live. *(spec context)*

All body and section copy across the site should be written from
[`brand-strategy.md`](brand-strategy.md) — the strategy's own lines are the source, with the
technical detail in this document as supporting proof.

---

## 7. Still needed

- **Product photography / renders** for all 8 LV models and the HV range
- **HV280Ah (Rack)** spec sheet — the one indoor model without captured data
- **Full CloudLink inverter compatibility matrix** — the live table is partially collapsed
- **CloudLink app screenshots** for the home page feature block
- Confirmation on **pricing** — the old site shows none; assuming the new site stays quote-led
  (consistent with "must not feel like an e-commerce site")
