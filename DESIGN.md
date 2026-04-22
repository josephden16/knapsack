# KnapSack Design System — OPay Campaign Reporting Platform

## 1. Visual Theme & Atmosphere

KnapSack is a professional marketing intelligence dashboard — the kind of tool a senior marketing director opens on a Monday morning to understand how a $1M campaign is performing. The design must communicate precision, clarity, and brand confidence simultaneously. It is built entirely on OPay's signature green and white, a palette that is optimistic and energetic without sacrificing the seriousness required of financial and performance data.

The canvas is clean white (`#FFFFFF`) with a barely-there off-white page wash (`#F4F6F8`) that separates content panels from the background without introducing visual noise. All data lives on white card surfaces, elevated with a soft, cool-tinted shadow. The primary interactive color is OPay's `#00B140` — a vivid, saturated green that reads as growth, forward momentum, and brand ownership. It appears on buttons, the logo mark, the Top of Funnel accent, and the active state of every toggle.

Three distinct accent colors allow each funnel stage to be immediately scannable without reading a label: **OPay green** (`#00B140`) for Awareness, **professional blue** (`#0066CC`) for Consideration, and **amber** (`#F5A623`) for Conversion. These colors appear consistently as left borders on KPI cards, top borders on channel cards, fills on chart elements, and backgrounds on funnel banner rows — creating a visual language where color = funnel stage everywhere in the product.

The typography is **Inter** — a geometric sans-serif purpose-built for screens and interface density. At KPI display sizes (28–32px), Inter runs at weight 700, making numbers feel authoritative and immediately readable at a glance. Labels are small-caps uppercase in weight 600 with tracked letter-spacing, echoing the conventions of Bloomberg terminals and financial dashboards. Chart axis text drops to 11px at weight 400 in muted gray, receding so it doesn't compete with the data.

Elevation is minimal and functional. Cards sit at Level 1 (a single soft shadow). Modals and dropdowns use Level 2. Nothing needs theatrical depth — this is a dashboard, not a marketing site.

**Key Characteristics:**

- OPay green (`#00B140`) as the dominant brand signal — on logo, buttons, active states, and ToF visuals
- Three-color funnel system (green / blue / amber) that encodes stage identity across every view
- White card surfaces on off-white page — separation without contrast shock
- Inter at weight 700 for KPI values — data first, decoration never
- Cool-tinted shadows (`rgba(0, 71, 28, 0.08)`) — green-tinted depth that echoes the brand
- Conservative border-radius (8–12px on cards, 999px on pills/toggles only)
- `"tnum"` tabular numerals on all financial and metric values
- Funnel accent colors as semantic identifiers, not decorative choices

---

## 2. Color Palette & Roles

### Brand

- **OPay Green** (`#00B140`): Primary brand color. Logo mark background, primary buttons, active toggle state, Top of Funnel accent, chart fill for Awareness data. The color owns the screen — use it deliberately.
- **OPay Green Dark** (`#008F33`): Hover and pressed state on green buttons and interactive elements.
- **OPay Green Light** (`#E6F7ED`): Pale green tint for badge backgrounds, active row highlights, and subtle success states.

### Funnel Accent Colors

Each funnel stage owns a color. These three colors must be applied consistently across KPI card borders, channel card borders, banner backgrounds, chart strokes/fills, and stage pills.

- **ToF — OPay Green** (`#00B140`): Top of Funnel / Awareness
- **MoF — Professional Blue** (`#0066CC`): Middle of Funnel / Consideration
- **BoF — Amber** (`#F5A623`): Bottom of Funnel / Conversion

### Chart Fill Backgrounds (area chart translucent fills)

- **ToF Fill** (`#E6F7ED`): 15% opacity green wash under Awareness line charts
- **MoF Fill** (`#E6F0FA`): 15% opacity blue wash under Consideration line charts
- **BoF Fill** (`#FEF3DC`): 15% opacity amber wash under Conversion line charts

### Backgrounds

- **Page** (`#F4F6F8`): The full-page wash. Barely off-white — creates depth between page and card without dark contrast.
- **Surface** (`#FFFFFF`): All card panels, the header bar, modal backgrounds. Everything that "contains" content is white.

### Text

- **Primary** (`#0D1117`): KPI values, headings, table data, chart bar labels. Near-black with the faintest warm undertone.
- **Secondary** (`#4B5563`): Sub-labels, breadcrumb segments, metric row labels inside channel cards, toggle inactive text.
- **Muted** (`#9CA3AF`): Chart axis labels, placeholder text, footer copy. Recedes without disappearing.
- **On-color** (`#FFFFFF`): Text on any colored background — funnel banners, OPay green buttons, stage pills.

### Borders & Dividers

- **Default** (`#E5E7EB`): Card borders, table row dividers, input outlines.
- **Strong** (`#D1D5DB`): Focused input outlines, separators between major sections.

### Status Badges

- **Active** — background: `#E6F7ED`, text: `#00B140`, border: `1px solid #A7F3C0`
- **Completed** — background: `#EFF6FF`, text: `#0066CC`, border: `1px solid #BFDBFE`

### Shadow Colors

- **Brand Shadow** (`rgba(0, 71, 28, 0.08)`): Primary card shadow. Green-tinted to echo the OPay brand palette — elevation that feels on-brand rather than generic.
- **Ambient Shadow** (`rgba(0, 0, 0, 0.04)`): Secondary shadow layer, pure and subtle, for additional depth reinforcement.
- **Elevated Shadow** (`rgba(0, 71, 28, 0.12), rgba(0, 0, 0, 0.06)`): Modal and dropdown shadow — deeper but still brand-tinted.

---

## 3. Typography Rules

### Font Family

- **Primary**: `Inter`, with fallback: `SF Pro Display, -apple-system, sans-serif`
- **Numerics / Tabular data**: Inter with `font-feature-settings: "tnum"` — enables tabular number widths so columns of figures align perfectly.
- **No monospace font required** for MVP — all content is data and UI, not code.

### Hierarchy

| Role                 | Size | Weight | Line Height | Letter Spacing | Features  | Use                                         |
| -------------------- | ---- | ------ | ----------- | -------------- | --------- | ------------------------------------------- |
| KPI Value — Large    | 32px | 700    | 1.0         | -0.5px         | tnum      | Hero KPI cards (Reach, Spend, Clicks)       |
| KPI Value — Standard | 28px | 700    | 1.0         | -0.3px         | tnum      | Secondary KPI cards                         |
| Page Title           | 24px | 700    | 1.2         | -0.3px         | —         | Campaign name in header                     |
| Section Heading      | 20px | 600    | 1.3         | -0.2px         | —         | Channel names, card headers                 |
| Sub-heading          | 16px | 600    | 1.4         | normal         | —         | Channel metric labels in overview cards     |
| Body                 | 14px | 400    | 1.6         | normal         | —         | Descriptions, sub-labels, breadcrumb text   |
| KPI Label            | 11px | 600    | 1.2         | 0.07em         | uppercase | REACH, GRPS, SPEND labels above values      |
| Chart Axis           | 11px | 400    | 1.2         | normal         | tnum      | X/Y axis tick labels                        |
| Chart Value Label    | 12px | 600    | 1.2         | normal         | tnum      | Value labels on top of bars or end of lines |
| Badge / Pill         | 11px | 600    | 1.0         | 0.02em         | uppercase | Status pills, stage pills                   |
| Table Header         | 11px | 600    | 1.2         | 0.06em         | uppercase | KOL table column headers                    |
| Table Cell           | 13px | 400    | 1.4         | normal         | tnum      | KOL table data rows                         |
| Button — Primary     | 14px | 600    | 1.0         | normal         | —         | "Upload Campaign", "Open →"                 |
| Button — Small       | 13px | 500    | 1.0         | normal         | —         | Secondary buttons, "Drill in →" links       |
| Breadcrumb           | 13px | 400    | 1.0         | normal         | —         | Campaigns › Campaign › Stage › Channel      |
| Footer               | 12px | 400    | 1.4         | normal         | —         | "KnapSack — Campaign Reporting Platform"    |

### Principles

- **700 for data, 400 for context**: KPI values shout at 700; supporting labels and descriptions stay at 400. Weight is reserved for the numbers that matter.
- **`tnum` everywhere numbers appear in columns**: KPI values, chart labels, table cells, axis ticks — tabular figures ensure vertical alignment in any context.
- **Uppercase + letter-spacing for labels**: Small-caps KPI labels (`REACH`, `AVG CTR`) use `text-transform: uppercase` and `letter-spacing: 0.07em` — the dashboard convention that signals "this is a metric identifier, not body copy."
- **Tight tracking at large sizes**: KPI values at 28–32px use slight negative letter-spacing (-0.3px to -0.5px) to tighten the optical weight of large numerals.
- **No display-size decorative typography**: This is a data product. Headlines never exceed 24px — the data is the hero, not the page title.

---

## 4. Component Stylings

### Buttons

**Primary — OPay Green**

- Background: `#00B140`
- Text: `#FFFFFF`
- Padding: `10px 20px`
- Radius: `8px`
- Font: 14px Inter weight 600
- Hover: background `#008F33`
- Active: background `#007A2C`
- Use: "Upload Campaign", primary actions

**Secondary — Outlined**

- Background: `#FFFFFF`
- Text: `#00B140`
- Padding: `10px 20px`
- Radius: `8px`
- Border: `1px solid #00B140`
- Hover: background `#E6F7ED`
- Use: "Download Template", secondary actions

**Ghost — Muted**

- Background: transparent
- Text: `#4B5563`
- Padding: `8px 16px`
- Radius: `8px`
- Border: `1px solid #E5E7EB`
- Hover: background `#F4F6F8`
- Use: Cancel, close actions inside modals

**Drill-in Link**

- Background: transparent
- Text: `#4B5563`
- Font: 13px Inter weight 500
- No border, no radius
- Hover: text `#0D1117`
- Format: `"Drill in →"` — always right-aligned in channel/funnel cards

### Monthly / Quarterly Toggle

A pill-shaped toggle container holding two options.

- **Container**: background `#F4F6F8`, border-radius `999px`, padding `3px`
- **Active button**: background `#00B140`, text `#FFFFFF`, border-radius `999px`, padding `6px 16px`, font 13px weight 600
- **Inactive button**: background transparent, text `#4B5563`, border-radius `999px`, padding `6px 16px`, font 13px weight 500
- Hover on inactive: text `#0D1117`

### KPI Cards

- Background: `#FFFFFF`
- Border-radius: `10px`
- Shadow: `rgba(0, 71, 28, 0.08) 0px 2px 8px 0px`
- Left border: `3px solid {funnel-color}` — green, blue, or amber depending on funnel stage
- Padding: `16px 20px`
- Internal layout: label on top (`11px, uppercase, #9CA3AF`), value below (`28–32px, 700, #0D1117`)

### Funnel Banner Rows

The full-width colored row that introduces each funnel stage on the Campaign Overview page.

- Background: funnel accent color (green / blue / amber)
- Text: `#FFFFFF`
- Border-radius: `10px`
- Padding: `14px 20px`
- Left side: `"{Stage Name} — {Stage Label}"` — stage name in weight 700, label in weight 400 at reduced opacity (`rgba(255,255,255,0.75)`)
- Right side: `"Drill in →"` in weight 600, `#FFFFFF`
- Hover: background darkens by ~8% (use `filter: brightness(0.92)`)

### Channel Overview Cards

Cards used on the three channel overview pages (ToF, MoF, BoF).

- Background: `#FFFFFF`
- Border-radius: `10px`
- Shadow: `rgba(0, 71, 28, 0.08) 0px 2px 8px 0px`
- Top border: `3px solid {funnel-color}`
- Padding: `20px`
- Header row: channel name in `16px weight 600 #0D1117` + "Drill in →" right-aligned
- Metric rows: label (`12px, #9CA3AF`) stacked above value (`15px, weight 600, #0D1117`)
- Row spacing: `12px` between metric rows

### Chart Panels

Wraps each ChartPair (monthly + quarterly charts side by side).

- Background: `#FFFFFF`
- Border-radius: `12px`
- Shadow: `rgba(0, 71, 28, 0.08) 0px 2px 8px 0px`
- Padding: `20px 24px`
- Chart title: `13px weight 600 #0D1117`, format: `"{Metric} · Monthly"` or `"{Metric} · Quarterly"`

**Line Chart (monthly):**

- Stroke: funnel accent color, `strokeWidth: 2`
- Area fill: funnel fill background (e.g., `#E6F7ED` for ToF), opacity 1 as defined color
- Gridlines: horizontal only, `stroke: #F3F4F6`, `strokeDasharray: "4 2"`
- Axis text: `11px #9CA3AF tnum`
- Data point dot: `r: 4`, filled with stroke color, white stroke `2px`

**Bar Chart (quarterly):**

- Bar fill: solid funnel accent color
- Bar corner radius: `4px` on top corners only
- Value label above bar: `12px weight 600 #0D1117 tnum`
- No legend
- Axis text: `11px #9CA3AF`

### Sentiment Donut Chart

Used on the KOL/Influencer detail page.

- Chart type: Recharts `PieChart` with `innerRadius` set to ~55% of outerRadius (donut, not pie)
- Segments: Positive (`#00B140` green), Neutral (`#D1D5DB` gray), Negative (`#F87171` soft red)
- Percentage labels: positioned outside segments, `12px weight 600`, matching segment color
- Legend: horizontal below chart, small colored squares + label text at `12px #4B5563`
- No hover animations — this is static data

### KOL Performance Table

- Container: `#FFFFFF`, `border-radius: 10px`, shadow Level 1
- Header row: `11px uppercase #9CA3AF letter-spacing: 0.06em weight 600`, `border-bottom: 1px solid #E5E7EB`
- Data rows: `13px #0D1117 tnum`, `border-bottom: 1px solid #F3F4F6`
- Row hover: background `#F9FAFB`
- Column alignment: KOL name left-aligned, all numeric columns right-aligned

### GRP Horizontal Bar Chart

- Layout: `BarChart layout="vertical"` (Recharts)
- Bar fill: `#00B140` (always ToF green, as this is a ToF channel)
- Bar corner radius: `4px` on right corners only
- Value label: at end of bar, `12px weight 600 #0D1117`
- Channel name labels: left-aligned, `13px #4B5563`
- Background: white card panel, same shadow as Chart Panels

### Status Badges (Campaign Cards)

**Active**

- Background: `#E6F7ED`
- Text: `#00B140`
- Border: `1px solid #A7F3C0`
- Radius: `999px`
- Padding: `3px 10px`
- Font: `11px weight 600 uppercase`

**Completed**

- Background: `#EFF6FF`
- Text: `#0066CC`
- Border: `1px solid #BFDBFE`
- Radius: `999px`
- Padding: `3px 10px`
- Font: `11px weight 600 uppercase`

### Stage Pills (Header, level 3+ pages)

Pill badge displayed in the page header to identify the current funnel stage.

- Background: funnel accent color (green / blue / amber)
- Text: `#FFFFFF`
- Radius: `999px`
- Padding: `4px 12px`
- Font: `11px weight 700 uppercase letter-spacing: 0.06em`

### Campaign Cards (Home Page)

- Background: `#FFFFFF`
- Border-radius: `12px`
- Shadow Level 1
- Left border: `4px solid {funnel-color}` — green for Active, blue for Completed
- Padding: `20px`
- Campaign name: `18px weight 700 #0D1117`
- Date range: `13px #9CA3AF`
- Divider: `1px solid #E5E7EB`
- Metric labels (BUDGET, SPEND, ROI): `11px uppercase #9CA3AF letter-spacing: 0.07em`
- Metric values: `20px weight 700 #0D1117 tnum`
- "Open →" link: `13px weight 600 #00B140` right-aligned, hover `#008F33`

### Navigation / Page Header

Sticky top bar that appears on all pages except the Home page.

- Background: `#FFFFFF`
- Border-bottom: `1px solid #E5E7EB`
- Height: `64px`
- Shadow: `rgba(0, 71, 28, 0.06) 0px 2px 4px`
- Left: Logo mark (green `#00B140` rounded square `36px`, white "K" at `18px weight 700`) + "KnapSack" (`18px weight 700 #0D1117`) + separator "·" (`#D1D5DB`) + campaign name (`18px weight 600 #0D1117`)
- Sub-line: breadcrumb path at `13px #4B5563`
- Right: Monthly/Quarterly toggle + Stage Pill (if applicable)

### Upload Modal

- Overlay: `rgba(0,0,0,0.4)` backdrop
- Modal: `#FFFFFF`, `border-radius: 16px`, shadow Level 2, `padding: 32px`, max-width `520px`
- Title: `20px weight 700 #0D1117`
- Drop zone: `border: 2px dashed #D1D5DB`, `border-radius: 12px`, background `#F9FAFB`, padding `40px`, centered text `14px #9CA3AF`
- Drop zone hover / drag-over: `border-color: #00B140`, background `#E6F7ED`
- Error messages: `12px #EF4444` below the affected field
- Action row: Cancel (Ghost) + Upload (Primary Green) right-aligned

---

## 5. Layout Principles

### Spacing System

Base unit: `4px`. All spacing values are multiples of 4.

| Token      | Value | Common Use                                         |
| ---------- | ----- | -------------------------------------------------- |
| `space-1`  | 4px   | Icon padding, tight gaps                           |
| `space-2`  | 8px   | Inner card padding (tight), badge padding          |
| `space-3`  | 12px  | Between metric rows in channel cards               |
| `space-4`  | 16px  | Button padding horizontal, card internal padding   |
| `space-5`  | 20px  | Card padding, section gaps within a page           |
| `space-6`  | 24px  | Chart panel padding, between chart pairs           |
| `space-8`  | 32px  | Between major page sections                        |
| `space-10` | 40px  | Page top/bottom padding                            |
| `space-12` | 48px  | Between funnel stage sections on Campaign Overview |

### Grid & Container

- Max content width: `1160px`, centered with `padding: 0 24px`
- KPI strip: 6-column equal-width grid, `gap: 12px`
- Channel overview: 4-column grid (3 for BoF), `gap: 16px`
- Chart pairs: 2-column `[60% | 40%]` split — the monthly line chart is wider, the quarterly bar narrower
- Campaign cards on Home: 2-column grid, `gap: 20px`

### Whitespace Philosophy

- **Data density is a feature**: KPI strips and channel cards are intentionally dense. White space is used around them, not inside them.
- **Cards breathe, grids don't**: Each card has generous internal padding (`20px`), but card grids are compact (`12–16px` gaps). The breathing room is vertical, between sections, not horizontal between cards.
- **Section separation via spacing, not lines**: Funnel stages on Campaign Overview are separated by `48px` vertical space — no horizontal rules needed.

### Border Radius Scale

| Name     | Value   | Use                                        |
| -------- | ------- | ------------------------------------------ |
| Tight    | `6px`   | Small inline elements                      |
| Standard | `8px`   | Buttons, inputs, small components          |
| Card     | `10px`  | KPI cards, channel cards, chart panels     |
| Panel    | `12px`  | Campaign cards, upload drop zone, modal    |
| Pill     | `999px` | Status badges, stage pills, toggle buttons |

Never use radius larger than `16px` on any container. Never use `0px` radius on visible interactive elements.

---

## 6. Depth & Elevation

| Level      | Shadow                                                                           | Use                                                                 |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Flat (0)   | none                                                                             | Page background, inline text, dividers                              |
| Level 1    | `rgba(0, 71, 28, 0.08) 0px 2px 8px 0px`                                          | KPI cards, channel cards, chart panels, campaign cards, page header |
| Level 2    | `rgba(0, 71, 28, 0.12) 0px 8px 24px -4px, rgba(0, 0, 0, 0.06) 0px 4px 12px -2px` | Modals, upload modal, dropdown menus                                |
| Focus Ring | `0 0 0 3px rgba(0, 177, 64, 0.25)`                                               | Keyboard focus on inputs, buttons, interactive elements             |

**Shadow philosophy:** The primary shadow color `rgba(0, 71, 28, 0.08)` is a deep forest green tint — it echoes OPay's green brand color in the same way Stripe echoes its navy palette in shadows. Elevation on this dashboard feels organic and on-brand, not generic gray. The secondary layer in Level 2 is neutral black at very low opacity, adding physical depth without competing with the brand tint.

---

## 7. Do's and Don'ts

### Do

- Use `#00B140` OPay green as the only primary interactive color — buttons, active states, ToF visuals
- Apply the three-color funnel system (green / blue / amber) consistently across every view that belongs to a funnel stage
- Use `font-feature-settings: "tnum"` on every number that appears in a table column, KPI card, chart axis, or chart value label
- Use weight 700 for all KPI metric values — this is the visual hierarchy anchor of the whole product
- Keep card border-radius at `10–12px` — clean and modern without being playful
- Use the green-tinted shadow `rgba(0, 71, 28, 0.08)` for all card elevation — never neutral gray shadows
- Use `text-transform: uppercase` + `letter-spacing: 0.07em` on all KPI label rows (REACH, SPEND, CTR etc.)
- Use OPay green with a white "K" for the logo mark in all contexts

### Don't

- Don't use OPay green for Middle or Bottom of Funnel chart fills — blue and amber own those stages
- Don't use pill-shaped radius (`999px`) on cards or chart panels — only on badges, pills, and the toggle
- Don't use neutral gray shadows (no `rgba(0,0,0,0.15)` alone) — always use the green-tinted shadow formula
- Don't mix funnel accent colors within a single channel's charts — all charts on a ToF detail page are green, all MoF charts are blue, all BoF charts are amber
- Don't use weight 400 or 500 for KPI values — 700 only
- Don't use positive letter-spacing on KPI values — tight or zero tracking only
- Don't use amber (`#F5A623`) for interactive elements (buttons, links) — it is only a BoF semantic color
- Don't display the stage pill on the Home page or Campaign Overview — it appears from the Channel Overview level downward only

---

## 8. Responsive Behavior

### Breakpoints

| Name          | Width       | Key Changes                                                                       |
| ------------- | ----------- | --------------------------------------------------------------------------------- |
| Mobile        | < 640px     | Single column for all grids; KPI strip wraps to 2×3; chart pairs stack vertically |
| Tablet        | 640–1024px  | 2-column channel cards; KPI strip stays 3×2; chart pairs side-by-side             |
| Desktop       | 1024–1280px | Full layout — 6-col KPI strip, 4-col channel cards, 2-col chart pairs             |
| Large Desktop | > 1280px    | Centered at `1160px` max-width with generous margins                              |

### Touch Targets

- All buttons: minimum `44px` height
- "Drill in →" links: minimum `36px` tap target height via padding
- Toggle buttons: `32px` height minimum, `80px` minimum width per option
- Campaign cards: full card is tappable (not just "Open →")

### Collapsing Strategy

- **KPI strip**: 6-column → 3×2 grid on tablet → 2×3 grid on mobile. Values scale down: `32px` → `26px` → `22px`.
- **Channel cards**: 4-column → 2-column on tablet → single column stacked on mobile
- **Chart pairs**: side-by-side → stacked vertically on mobile (monthly first, quarterly below)
- **Campaign Overview funnel banners**: full-width at all sizes; "Drill in →" moves below stage label on mobile
- **Page header**: logo + campaign name on left collapses to logo only on mobile; Monthly/Quarterly toggle moves to below the header on mobile
- **Upload modal**: full-screen on mobile (`border-radius: 0`), standard modal on tablet+

---

## 9. Agent Prompt Guide

### Quick Color Reference

- Primary brand / ToF / buttons: OPay Green (`#00B140`)
- Button hover: OPay Green Dark (`#008F33`)
- MoF accent: Professional Blue (`#0066CC`)
- BoF accent: Amber (`#F5A623`)
- Page background: Off-white (`#F4F6F8`)
- Card / surface: Pure White (`#FFFFFF`)
- Primary text / KPI values: Near-black (`#0D1117`)
- Secondary text / labels: Dark gray (`#4B5563`)
- Muted text / axis labels: Medium gray (`#9CA3AF`)
- Borders: Light gray (`#E5E7EB`)
- Shadow: Green-tinted (`rgba(0, 71, 28, 0.08)`)

### Example Component Prompts

- "Create a KPI card on white background (`#FFFFFF`), `border-radius: 10px`, shadow `rgba(0, 71, 28, 0.08) 0px 2px 8px`, left border `3px solid #00B140`. Label: `REACH`, 11px Inter weight 600, uppercase, letter-spacing 0.07em, color `#9CA3AF`. Value: `12.4M`, 32px Inter weight 700, letter-spacing -0.5px, color `#0D1117`, `font-feature-settings: 'tnum'`."

- "Build a funnel banner row for Top of Funnel. Background `#00B140`, border-radius `10px`, padding `14px 20px`. Left text: 'Top of Funnel' in 15px Inter weight 700 white + ' — Awareness' in 15px weight 400 `rgba(255,255,255,0.75)`. Right text: 'Drill in →' in 13px weight 600 white, right-aligned. Hover: `filter: brightness(0.92)`."

- "Create an area line chart (Recharts AreaChart) for monthly Reach data. Stroke color `#00B140`, strokeWidth 2, area fill `#E6F7ED`. Gridlines: horizontal only, stroke `#F3F4F6`, strokeDasharray `4 2`. Dots: r=4, fill `#00B140`, stroke white 2px. X-axis: month abbreviations (Jan–Jun), 11px `#9CA3AF`. Y-axis: abbreviated numbers, 11px `#9CA3AF`. Chart title above: 'Reach (K) · Monthly', 13px Inter weight 600 `#0D1117`."

- "Design a campaign card on white (`#FFFFFF`), border-radius 12px, shadow `rgba(0, 71, 28, 0.08) 0px 2px 8px`, left border `4px solid #00B140`. Campaign name 'Extra Cover' at 18px weight 700 `#0D1117`. Date range 'Jan — Jun 2025' at 13px `#9CA3AF`. Divider `1px solid #E5E7EB`. Metric row: BUDGET / SPEND / ROI labels at 11px uppercase `#9CA3AF` letter-spacing 0.07em; values `$1.35M`, `$1.18M`, `3.8x` at 20px weight 700 `#0D1117` tnum. Status pill 'Active': background `#E6F7ED`, text `#00B140`, border `1px solid #A7F3C0`, radius 999px, 3px 10px padding, 11px weight 600 uppercase. 'Open →' link 13px weight 600 `#00B140` right-aligned."

- "Build the Monthly/Quarterly toggle. Container: background `#F4F6F8`, border-radius `999px`, padding `3px`, display inline-flex. Active button ('Monthly'): background `#00B140`, text white, border-radius `999px`, padding `6px 16px`, 13px Inter weight 600. Inactive button ('Quarterly'): background transparent, text `#4B5563`, border-radius `999px`, padding `6px 16px`, 13px Inter weight 500. Inactive hover: text `#0D1117`."

- "Create the page header bar. Background `#FFFFFF`, border-bottom `1px solid #E5E7EB`, height 64px, shadow `rgba(0, 71, 28, 0.06) 0px 2px 4px`. Left: green square logo mark (36px, background `#00B140`, border-radius 8px, white 'K' at 18px weight 700) + 'KnapSack' at 18px weight 700 `#0D1117` + '·' separator at `#D1D5DB` + campaign name at 18px weight 600 `#0D1117`. Sub-line: 'Campaign Overview | Jan — Jun 2025 | Budget: $1.35M' at 13px `#4B5563`. Right: Monthly/Quarterly toggle."

### Iteration Guide

1. **Funnel color = stage identity**: Every element on a ToF page uses `#00B140`. Every MoF element uses `#0066CC`. Every BoF element uses `#F5A623`. Never mix.
2. **`tnum` on every number**: Add `font-feature-settings: "tnum"` to any element displaying a metric, chart value, or financial figure.
3. **Weight 700 for KPI values, 600 for labels, 400 for body**: The three-weight system is the hierarchy signal.
4. **Shadow formula**: `rgba(0, 71, 28, 0.08) 0px 2px 8px 0px` for Level 1 (all cards). `rgba(0, 71, 28, 0.12) 0px 8px 24px -4px, rgba(0, 0, 0, 0.06) 0px 4px 12px -2px` for Level 2 (modals).
5. **KPI labels are always uppercase + tracked**: `text-transform: uppercase; letter-spacing: 0.07em; font-size: 11px; font-weight: 600; color: #9CA3AF`.
6. **Border-radius consistency**: Cards and panels at `10–12px`, buttons/inputs at `8px`, badges and toggles at `999px`.
7. **Chart backgrounds are always white**: No colored chart backgrounds. The funnel color lives in the stroke, fill, and bars only.
8. **Line charts are monthly, bar charts are quarterly**: The toggle switches between them — never show both simultaneously on the same metric.
