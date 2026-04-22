# KnapSack — Funnel-Based Campaign Reporting Platform
### Product Spec · OPay Marketing · v1.0

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Navigation & URL Structure](#3-navigation--url-structure)
4. [Authentication & Backend Architecture](#4-authentication--backend-architecture)
5. [Data Model & Upload Format](#5-data-model--upload-format)
6. [Screen Specifications](#6-screen-specifications)
   - 6.1 [Home — Campaign List](#61-home--campaign-list)
   - 6.2 [Campaign Overview](#62-campaign-overview)
   - 6.3 [Top of Funnel — Channel Overview](#63-top-of-funnel--channel-overview)
   - 6.4 [Middle of Funnel — Channel Overview](#64-middle-of-funnel--channel-overview)
   - 6.5 [Bottom of Funnel — Channel Overview](#65-bottom-of-funnel--channel-overview)
   - 6.6 [TVC / Broadcast Detail](#66-tvc--broadcast-detail)
   - 6.7 [KOL / Influencer Detail](#67-kol--influencer-detail)
   - 6.8 [Organic Social Detail](#68-organic-social-detail)
   - 6.9 [PR / Media Detail](#69-pr--media-detail)
   - 6.10 [Meta Ads Detail](#610-meta-ads-detail)
   - 6.11 [TikTok Ads Detail](#611-tiktok-ads-detail)
   - 6.12 [X Ads Detail](#612-x-ads-detail)
   - 6.13 [Branding / Perf. Ads Detail](#613-branding--perf-ads-detail)
   - 6.14 [In-App Pages Detail](#614-in-app-pages-detail)
   - 6.15 [Landing Pages Detail](#615-landing-pages-detail)
   - 6.16 [Deep Links Detail](#616-deep-links-detail)
7. [Shared Components](#7-shared-components)
8. [Data Upload Flow](#8-data-upload-flow)
9. [Two-Week Shipping Plan](#9-two-week-shipping-plan)

---

## 1. Overview

KnapSack is a single-page web application that ingests uploaded campaign data files and renders a hierarchical, drill-down reporting dashboard for OPay's marketing campaigns. Reports are organized around a three-stage marketing funnel — Awareness (Top), Consideration (Middle), and Conversion (Bottom) — and broken down by channel within each stage.

**Key constraints:**
- Data is uploaded by the user (CSV/Excel), not pulled from a live database.
- The UI follows the layout and structure of the design PDF mockups, re-skinned to OPay's green-and-white brand identity.
- Two campaigns are shown in the mockup ("Extra Cover" and "Big Friday"), but the system must generalize to any number of campaigns.
- Charts display data in two granularities: Monthly (line chart) and Quarterly (bar chart), toggled at the page level.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Replaces Vite+React; gives us API routes, server components, and middleware in a single project — perfect for vibe coding a full-stack app fast |
| Charts | Recharts | Simple API, good line + bar chart support |
| Styling | Tailwind CSS | Utility-first; configure OPay green as a custom color in `tailwind.config.js` |
| File parsing | SheetJS (XLSX) | Parses uploaded `.xlsx` files in API routes before persisting |
| Authentication | **Firebase Auth** | Fastest possible setup — enable Google OAuth in the Firebase console, drop in the client SDK, done. No adapter, no session config, no extra models in the DB |
| ORM | **Prisma** | Type-safe DB client, great MongoDB support, auto-generates types from schema |
| Database | **MongoDB Atlas** | Document model suits embedded time-series campaign data; free tier is sufficient for MVP |
| Server state | **SWR** | Lightweight data-fetching with caching and revalidation on the client |
| Deployment | **Vercel** | Zero-config Next.js deployment; add Firebase + MongoDB env vars |

### Project Structure

```
knapsack/
├── app/                        # Next.js App Router pages & layouts
│   ├── (auth)/                 # Login / register pages (unauthenticated group)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/            # All dashboard pages (auth-protected group)
│   │   ├── layout.tsx          # Shared header, auth guard
│   │   ├── page.tsx            # Home — Campaign List
│   │   └── [campaignSlug]/
│   │       ├── page.tsx        # Campaign Overview
│   │       ├── top-of-funnel/...
│   │       ├── middle-of-funnel/...
│   │       └── bottom-of-funnel/...
│   └── api/
│       ├── campaigns/
│       │   ├── route.ts        # GET all campaigns for authenticated user
│       │   └── [slug]/route.ts # GET single campaign, DELETE
│       └── upload/route.ts     # POST — parse XLSX, validate, persist
├── components/                 # Shared UI components
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── firebase.ts             # Firebase client SDK init (for use in browser)
│   ├── firebase-admin.ts       # Firebase Admin SDK init (for use in API routes)
│   └── parsers/                # Sheet-specific parsing functions
├── prisma/
│   └── schema.prisma
└── middleware.ts               # Protects all (dashboard) routes
```

---

## 3. Navigation & URL Structure

The app has four levels of depth. Every level shows a breadcrumb.

```
/                                          → Campaign List (Home)
/:campaignSlug                             → Campaign Overview
/:campaignSlug/top-of-funnel               → ToF Channel Overview
/:campaignSlug/top-of-funnel/tvc           → TVC/Broadcast Detail
/:campaignSlug/top-of-funnel/kol           → KOL/Influencer Detail
/:campaignSlug/top-of-funnel/organic       → Organic Social Detail
/:campaignSlug/top-of-funnel/pr            → PR/Media Detail
/:campaignSlug/middle-of-funnel            → MoF Channel Overview
/:campaignSlug/middle-of-funnel/meta       → Meta Ads Detail
/:campaignSlug/middle-of-funnel/tiktok     → TikTok Ads Detail
/:campaignSlug/middle-of-funnel/x-ads      → X Ads Detail
/:campaignSlug/middle-of-funnel/branding   → Branding/Perf. Ads Detail
/:campaignSlug/bottom-of-funnel            → BoF Channel Overview
/:campaignSlug/bottom-of-funnel/in-app     → In-App Pages Detail
/:campaignSlug/bottom-of-funnel/landing    → Landing Pages Detail
/:campaignSlug/bottom-of-funnel/deep-links → Deep Links Detail
```

**Breadcrumb format** (shown in header sub-line):
`Campaigns › {Campaign Name} › {Funnel Stage} › {Channel}`

---

## 4. Authentication & Backend Architecture

### 4.1 Authentication

Authentication is handled entirely by **Firebase Authentication** with **Google OAuth** as the sole sign-in method. This is the fastest possible setup — no session config, no adapter, no extra database models. The entire auth flow is handled by Firebase on the client; the backend only needs to verify the token.

**Setup steps (one-time, ~5 minutes):**
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Go to **Authentication → Sign-in method** and enable **Google**.
3. Copy the Firebase config object into env vars (see Section 9 Environment Variables).
4. Generate a Firebase Admin SDK service account key and add it to env vars.

**Client-side auth** (`lib/firebase.ts`):

```ts
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"

const app = initializeApp({
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
})

export const auth     = getAuth(app)
export const provider = new GoogleAuthProvider()

export const signInWithGoogle = () => signInWithPopup(auth, provider)
export const signOutUser      = () => signOut(auth)
```

**Sign-in flow:**
1. User clicks "Sign in with Google" on `/login`.
2. `signInWithGoogle()` opens the Google popup — user picks their account.
3. Firebase returns a user object with `uid`, `email`, `displayName`, `photoURL`.
4. On first sign-in, the client calls `POST /api/campaigns` with the ID token — the API upserts a minimal `User` record in MongoDB (just `firebaseUid` + `email`), so campaigns can be scoped to the user.
5. Firebase persists the session in `localStorage` automatically — the user stays logged in across page refreshes.
6. On sign-out, `signOutUser()` clears the Firebase session and redirects to `/login`.

**Auth state in the app** — use Firebase's `onAuthStateChanged` in a top-level client component or context to reactively track the current user:

```ts
import { onAuthStateChanged } from "firebase/auth"

onAuthStateChanged(auth, (user) => {
  if (user) {
    // user.uid, user.email, user.displayName available
  } else {
    // redirect to /login
  }
})
```

### 4.2 Protecting Routes

`middleware.ts` checks for the presence of a Firebase session cookie. Since Firebase manages the session client-side, the simplest MVP approach is to handle the auth guard in the `/(dashboard)/layout.tsx` client component using `onAuthStateChanged` — if no user, redirect to `/login`.

```tsx
// app/(dashboard)/layout.tsx  (client component)
"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function DashboardLayout({ children }) {
  const router = useRouter()
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login")
    })
  }, [router])
  return <>{children}</>
}
```

### 4.3 Server-Side Token Verification

API routes verify the caller's identity using the **Firebase Admin SDK**, which validates the ID token sent in the `Authorization` header.

**Admin SDK init** (`lib/firebase-admin.ts`):

```ts
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

export const adminAuth = getAuth()
```

**In every API route**, extract and verify the token before touching the database:

```ts
const token = req.headers.get("Authorization")?.split("Bearer ")[1]
if (!token) return Response.json({ error: "Unauthorised" }, { status: 401 })

const decoded = await adminAuth.verifyIdToken(token)
const firebaseUid = decoded.uid   // use this to scope all DB queries
```

The client retrieves the current ID token before each API call with:
```ts
const token = await auth.currentUser?.getIdToken()
```

### 4.4 Data Ownership

Every `Campaign` document in MongoDB stores a `firebaseUid` field (the Firebase user's `uid`). All API routes scope Prisma queries to `firebaseUid`, so users only ever see their own campaigns.

### 4.5 API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/campaigns` | List all campaigns for the authenticated user |
| `POST` | `/api/upload` | Parse uploaded `.xlsx`, validate, and persist a new campaign |
| `GET` | `/api/campaigns/[slug]` | Fetch a single campaign's full data |
| `DELETE` | `/api/campaigns/[slug]` | Delete a campaign (with ownership check) |

**Upload API (`/api/upload`) flow:**
1. Receive `multipart/form-data` with the `.xlsx` file + `Authorization: Bearer {idToken}` header.
2. Verify the Firebase ID token with Admin SDK → extract `firebaseUid`.
3. Parse all sheets with SheetJS on the server.
4. Run validation (see Section 9.3).
5. If valid, write a single `Campaign` document to MongoDB via Prisma.
6. Return `{ slug }` to the client; client redirects to `/:slug`.

### 4.6 Prisma Schema (MongoDB)

No NextAuth adapter models needed — Firebase owns the session entirely. The schema is lean: just a `User` record (for ownership) and the `Campaign` document.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("MONGODB_URL")
}

model User {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  firebaseUid String     @unique   // Firebase Auth uid — primary identity key
  email       String     @unique
  name        String?
  photo       String?
  createdAt   DateTime   @default(now())
  campaigns   Campaign[]
}

model Campaign {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  firebaseUid String                     // denormalised for fast scoped queries
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Metadata
  name        String
  slug        String
  status      String   // "active" | "completed"
  startDate   String   // YYYY-MM
  endDate     String   // YYYY-MM
  budget      Float
  spend       Float
  roi         Float
  createdAt   DateTime @default(now())

  // Time-series channel data — arrays of JSON objects, one object per month.
  // Keys match the column names defined in Section 7 (Data Model).
  tofSummary       Json[]
  tofTvc           Json[]
  tofKol           Json[]
  tofKolPerformers Json[]   // flat table rows, not time-series
  tofOrganic       Json[]
  tofPr            Json[]

  mofSummary       Json[]
  mofMeta          Json[]
  mofTiktok        Json[]
  mofX             Json[]
  mofBranding      Json[]

  bofSummary       Json[]
  bofInapp         Json[]
  bofLanding       Json[]
  bofDeeplinks     Json[]

  @@unique([firebaseUid, slug])   // slugs are unique per user
}
```

> **Why embed arrays in one document?** Campaign data is always read together — there are no queries that fetch only one channel in isolation. A single document read per campaign avoids joins, keeps latency low, and maps perfectly to how the dashboard consumes data.

---

## 5. Design System

See [DESIGN.md](./DESIGN.md) for the complete design system — color palette, typography scale, component specs (KPI cards, funnel banners, chart panels, toggle), elevation, responsive behavior, and an agent prompt guide with copy-paste component prompts.

---

## 5. Data Model & Upload Format

Data is provided via uploaded files (one per campaign). The recommended format is a single Excel workbook with multiple sheets, or multiple CSV files — one per channel/section.

### 5.1 Campaign Metadata (Sheet: `campaign`)

| Column | Type | Example |
|---|---|---|
| `name` | string | Extra Cover |
| `slug` | string | extra-cover |
| `status` | `active` \| `completed` | active |
| `start_date` | YYYY-MM | 2025-01 |
| `end_date` | YYYY-MM | 2025-06 |
| `budget` | number | 1350000 |
| `spend` | number | 1180000 |
| `roi` | number | 3.8 |

### 5.2 Top of Funnel — Summary KPIs (Sheet: `tof_summary`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | e.g. 2025-01 |
| `reach` | number | e.g. 12400000 |
| `grps` | number | e.g. 284 |
| `brand_recall_pct` | number | e.g. 74 |
| `sov_pct` | number | e.g. 42 |
| `sentiment` | number | e.g. 82 (out of 100) |
| `spend` | number | e.g. 620000 |

### 5.3 Top of Funnel — TVC / Broadcast (Sheet: `tof_tvc`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `reach` | number | |
| `grps` | number | |
| `frequency` | number | |
| `ad_recall_pct` | number | |
| `spend` | number | |
| `cpr` | number | Cost per reach |
| `channel_ait_grp` | number | GRP for AIT |
| `channel_channelstv_grp` | number | GRP for Channels TV |
| `channel_nta_grp` | number | GRP for NTA |
| `channel_stv_grp` | number | GRP for STV |
| `channel_others_grp` | number | GRP for Others |

### 5.4 Top of Funnel — KOL / Influencer (Sheet: `tof_kol`)

**Monthly summary** (one row per month):

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `reach` | number | |
| `engagement_pct` | number | |
| `sentiment` | number | out of 100 |
| `cost` | number | |
| `top_kol` | string | e.g. Davido |
| `roi` | number | |
| `sentiment_positive_pct` | number | e.g. 68 |
| `sentiment_neutral_pct` | number | e.g. 24 |
| `sentiment_negative_pct` | number | e.g. 8 |

**KOL performance table** (Sheet: `tof_kol_performers`):

| Column | Type | Description |
|---|---|---|
| `campaign_slug` | string | Links to campaign |
| `kol_name` | string | e.g. Davido |
| `reach` | number | |
| `engagement_pct` | number | |
| `cost` | number | |
| `roi` | number | |

### 5.5 Top of Funnel — Organic Social (Sheet: `tof_organic`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `impressions` | number | |
| `likes` | number | |
| `comments` | number | |
| `shares` | number | |
| `engagement_rate_pct` | number | |
| `top_post` | string | e.g. Cashback |

### 5.6 Top of Funnel — PR / Media (Sheet: `tof_pr`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `mentions` | number | |
| `earned_pct` | number | |
| `paid_pct` | number | |
| `sov_pct` | number | |
| `top_outlet` | string | e.g. TechCabal |
| `tone` | string | e.g. Positive |

### 5.7 Middle of Funnel — Summary KPIs (Sheet: `mof_summary`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `clicks` | number | |
| `avg_ctr_pct` | number | |
| `avg_cpc` | number | |
| `avg_roas` | number | |
| `spend` | number | |
| `top_channel` | string | e.g. TikTok |

### 5.8 Middle of Funnel — Paid Social Channels (Sheets: `mof_meta`, `mof_tiktok`, `mof_x`)

All three sheets share the same schema (one row per month):

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `clicks` | number | |
| `ctr_pct` | number | |
| `cpc` | number | |
| `cpm` | number | |
| `vtr_pct` | number | View-through rate |
| `roas` | number | |

### 5.9 Middle of Funnel — Branding / Perf. Ads (Sheet: `mof_branding`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `impressions` | number | |
| `ctr_pct` | number | |
| `cpm` | number | |
| `vtr_pct` | number | |
| `roas` | number | |
| `spend` | number | |

### 5.10 Bottom of Funnel — Summary KPIs (Sheet: `bof_summary`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `sign_ups` | number | |
| `installs` | number | |
| `drop_off_pct` | number | |
| `cpa` | number | |
| `conv_rate_pct` | number | |
| `spend` | number | |

### 5.11 Bottom of Funnel — In-App Pages (Sheet: `bof_inapp`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `page_views` | number | |
| `sign_ups` | number | |
| `drop_off_pct` | number | |
| `bounce_pct` | number | |
| `conv_rate_pct` | number | |
| `avg_time_seconds` | number | e.g. 134 for "2m 14s" |

### 5.12 Bottom of Funnel — Landing Pages (Sheet: `bof_landing`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `clicks` | number | |
| `conversions` | number | |
| `bounce_pct` | number | |
| `cto_pct` | number | Click-to-open rate |
| `conv_rate_pct` | number | |
| `top_page` | string | e.g. /promo |

### 5.13 Bottom of Funnel — Deep Links (Sheet: `bof_deeplinks`)

One row per month.

| Column | Type | Description |
|---|---|---|
| `month` | YYYY-MM | |
| `clicks` | number | |
| `installs` | number | |
| `cto_pct` | number | |
| `app_opens` | number | |
| `conv_rate_pct` | number | |
| `top_link` | string | e.g. opay:// |

### 5.14 Quarterly Aggregation Logic

Quarterly values are computed in-app from monthly rows:

- **Sums** (accumulate over the quarter): reach, grps, clicks, impressions, spend, mentions, likes, comments, shares, installs, sign_ups, page_views, conversions, app_opens
- **Averages** (average over months in the quarter): all `_pct` fields, cpc, cpm, cpa, roas, frequency, sentiment, roi
- **Last value in quarter**: top_kol, top_post, top_outlet, tone, top_page, top_link, top_channel

Quarter assignment: Jan–Mar = Q1, Apr–Jun = Q2, Jul–Sep = Q3, Oct–Dec = Q4.

---

## 6. Screen Specifications

---

### 6.1 Home — Campaign List

**Route:** `/`

**Layout:**
- Centered KnapSack logo (green rounded square with "K") + title "KnapSack"
- Subtitle: "Funnel-Based Campaign Reporting Platform · OPay"
- Instruction text: "Select a campaign to view its full reporting dashboard"
- Campaign cards in a 2-column responsive grid

**Campaign Card:**
```
┌─────────────────────────────────────────────────┐
│  {Campaign Name}                 [{Status Pill}] │
│  {Start Month} — {End Month}                     │
│ ─────────────────────────────────────────────── │
│  BUDGET      SPEND       ROI                     │
│  ${budget}   ${spend}    {roi}x                  │
│                                      Open →      │
└─────────────────────────────────────────────────┘
```

- Active campaign: `border-left: 4px solid #00B140` (OPay green)
- Completed campaign: `border-left: 4px solid #0066CC` (blue)
- Status pill Active: `background: #E6F7ED`, `color: #00B140`, `border-radius: 999px`
- Status pill Completed: `background: #EFF6FF`, `color: #0066CC`, `border-radius: 999px`
- "Open →" is a link to `/:campaignSlug`
- Footer: "KnapSack — Campaign Reporting Platform · OPay Marketing"

**Upload trigger:** A "+" or "Upload Campaign" button (or drag-and-drop zone) that opens the upload flow described in Section 8. This can be positioned top-right or as a third card.

---

### 6.2 Campaign Overview

**Route:** `/:campaignSlug`

**Header:**
- Left: `[ K ]  KnapSack · {Campaign Name}` / `Campaign Overview | {Date Range} | Budget: ${budget}`
- Right: `[Monthly] [Quarterly]` toggle

**Three funnel-stage sections, stacked vertically:**

#### Top of Funnel — Awareness
- Banner bar in **amber/orange** background, full width, label: `Top of Funnel — Awareness`, right side: `Drill in →` (links to `/:campaignSlug/top-of-funnel`)
- KPI strip (6 cards): REACH, GRPS, BRAND RECALL, SOV, SENTIMENT, SPEND

#### Middle of Funnel — Consideration
- Banner bar in **neon green** background: `Middle of Funnel — Consideration` + `Drill in →`
- KPI strip (6 cards): CLICKS, AVG CTR, AVG CPC, AVG ROAS, SPEND, TOP

#### Bottom of Funnel — Conversion
- Banner bar in **dark orange** background: `Bottom of Funnel — Conversion` + `Drill in →`
- KPI strip (6 cards): SIGN-UPS, INSTALLS, DROP-OFF, CPA, CONV RATE, SPEND

**KPI card format:**
```
LABEL (small caps, muted)
{Value} (large, white, bold)
```
Each card is white with `--shadow-card` and a `3px` colored left border matching its funnel color (`--tof-color`, `--mof-color`, or `--bof-color`). KPI values are `#0D1117`; labels are `#4B5563`.

---

### 6.3 Top of Funnel — Channel Overview

**Route:** `/:campaignSlug/top-of-funnel`

**Header:** Same structure, sub-label: `Awareness — Channel overview`, stage pill: AWARENESS (amber)

**Summary KPI strip (6 cards):** REACH, GRPS, BRAND RECALL, SOV, SENTIMENT, SPEND

**4-column channel card grid:**

| Card | TVC / Broadcast | KOL / Influencer | Organic Social | PR / Media |
|---|---|---|---|---|
| Header | "TVC / Broadcast" | "KOL / Influencer" | "Organic Social" | "PR / Media" |
| Link | `…/tvc` | `…/kol` | `…/organic` | `…/pr` |
| Metric rows | Reach, GRPs, Frequency, Ad Recall, Spend, CPR | Reach, Engagement, Sentiment, Cost, Top KOL, ROI | Impressions, Likes, Comments, Shares, Eng. Rate, Top Post | Mentions, Earned%, Paid%, SOV, Top Outlet, Tone |

Each channel card has:
- Title + "Drill in →" link at top
- Metric label (small, muted) + value (white, semi-bold) rows
- Top border in amber

---

### 6.4 Middle of Funnel — Channel Overview

**Route:** `/:campaignSlug/middle-of-funnel`

**Header:** Sub-label: `Consideration — Channel overview`, stage pill: CONSIDERATION (neon green)

**Summary KPI strip (6 cards):** CLICKS, AVG CTR, AVG CPC, AVG ROAS, SPEND, TOP

**4-column channel card grid:**

| Card | Meta Ads | TikTok Ads | X Ads | Branding / Perf. Ads |
|---|---|---|---|---|
| Link | `…/meta` | `…/tiktok` | `…/x-ads` | `…/branding` |
| Metric rows | Clicks, CTR, CPC, CPM, VTR, ROAS | Clicks, CTR, CPC, CPM, VTR, ROAS | Clicks, CTR, CPC, CPM, VTR, ROAS | Impressions, CTR, CPM, VTR, ROAS, Spend |

Top border: neon green.

---

### 6.5 Bottom of Funnel — Channel Overview

**Route:** `/:campaignSlug/bottom-of-funnel`

**Header:** Sub-label: `Conversion — Channel overview`, stage pill: CONVERSION (dark orange)

**Summary KPI strip (6 cards):** SIGN-UPS, INSTALLS, DROP-OFF, CPA, CONV RATE, SPEND

**3-column channel card grid:**

| Card | In-App Pages | Landing Pages | Deep Links |
|---|---|---|---|
| Link | `…/in-app` | `…/landing` | `…/deep-links` |
| Metric rows | Page Views, Sign-ups, Drop-off, Bounce, Conv Rate, Avg Time | Clicks, Conversions, Bounce, CTO, Conv Rate, Top Page | Clicks, Installs, CTO, App Opens, Conv Rate, Top Link |

Top border: dark orange.

---

### 6.6 TVC / Broadcast Detail

**Route:** `/:campaignSlug/top-of-funnel/tvc`

**Breadcrumb:** Campaigns › {Campaign} › Top of Funnel › TVC / Broadcast

**KPI strip (6 cards):** REACH, GRPS, FREQUENCY, AD RECALL, SPEND, CPR

**Charts (2 per row, left = monthly line, right = quarterly bar, color = `--chart-tof`):**

| Row | Left Chart | Right Chart |
|---|---|---|
| T1 | Reach (K) · Monthly | Reach (K) · Quarterly |
| T2 | GRPs · Monthly | GRPs · Quarterly |
| T3 | Frequency · Monthly | Frequency · Quarterly |
| T4 | Ad Recall (%) · Monthly | Ad Recall (%) · Quarterly |

**Additional chart (below, left-aligned, ~45% width):**
- `GRP by Broadcast Channel` — horizontal bar chart
- Bars: AIT, Channels TV, NTA, STV, Others
- Color: `--chart-tof`
- Values labeled at end of each bar

---

### 6.7 KOL / Influencer Detail

**Route:** `/:campaignSlug/top-of-funnel/kol`

**Breadcrumb:** Campaigns › {Campaign} › Top of Funnel › KOL / Influencer

**KPI strip (6 cards):** REACH, ENGAGEMENT, SENTIMENT, COST, TOP KOL, ROI

**Charts (2 per row, color = `--chart-tof`):**

| Row | Left Chart | Right Chart |
|---|---|---|
| T1 | Reach (K) · Monthly | Reach (K) · Quarterly |
| T2 | Engagement (%) · Monthly | Engagement (%) · Quarterly |
| T3 | Sentiment · Monthly | Sentiment · Quarterly |

**Additional components (below charts):**

**Sentiment Split donut chart** (~30% width):
- Three segments: Positive (green), Neutral (gray), Negative (red/salmon)
- Percentage labels on each segment
- Legend: Positive, Neutral, Negative

**KOL Performance table** (~50% width, placed to the right of or below donut):
```
KOL Performance
───────────────────────────────────
KOL          REACH    ENG.   COST   ROI
{kol_name}   {reach}  {eng%} {cost} {roi}x
...
```
- Alternating row background for readability
- Header row in muted text

---

### 6.8 Organic Social Detail

**Route:** `/:campaignSlug/top-of-funnel/organic`

**Breadcrumb:** Campaigns › {Campaign} › Top of Funnel › Organic Social

**KPI strip (6 cards):** IMPRESSIONS, LIKES, COMMENTS, SHARES, ENG. RATE, TOP POST

**Charts (2 per row, color = `--chart-tof`):**

| Row | Left Chart | Right Chart |
|---|---|---|
| T1 | Impressions (K) · Monthly | Impressions (K) · Quarterly |
| T2 | Likes (K) · Monthly | Likes (K) · Quarterly |
| T3 | Shares (K) · Monthly | Shares (K) · Quarterly |

---

### 6.9 PR / Media Detail

**Route:** `/:campaignSlug/top-of-funnel/pr`

**Breadcrumb:** Campaigns › {Campaign} › Top of Funnel › PR / Media

**KPI strip (6 cards):** MENTIONS, EARNED, PAID, SOV, TOP OUTLET, TONE

**Charts (2 per row, color = `--chart-tof`):**

| Row | Left Chart | Right Chart |
|---|---|---|
| T1 | Mentions · Monthly | Mentions · Quarterly |
| T2 | Earned (%) · Monthly | Earned (%) · Quarterly |
| T3 | SOV (%) · Monthly | SOV (%) · Quarterly |

---

### 6.10 Meta Ads Detail

**Route:** `/:campaignSlug/middle-of-funnel/meta`

**Breadcrumb:** Campaigns › {Campaign} › Middle of Funnel › Meta Ads

**KPI strip (6 cards):** CLICKS, CTR, CPC, CPM, VTR, ROAS

**Charts (2 per row, color = `--chart-mof`):**

| Row | Left Chart | Right Chart |
|---|---|---|
| T1 | Clicks (K) · Monthly | Clicks (K) · Quarterly |
| T2 | CTR (%) · Monthly | CTR (%) · Quarterly |
| T3 | CPC ($) · Monthly | CPC ($) · Quarterly |
| T4 | ROAS (x) · Monthly | ROAS (x) · Quarterly |

---

### 6.11 TikTok Ads Detail

**Route:** `/:campaignSlug/middle-of-funnel/tiktok`

**Breadcrumb:** Campaigns › {Campaign} › Middle of Funnel › TikTok Ads

**KPI strip (6 cards):** CLICKS, CTR, CPC, CPM, VTR, ROAS

**Charts:** Identical schema to Meta Ads (Section 6.10), color = `--chart-mof`.

---

### 6.12 X Ads Detail

**Route:** `/:campaignSlug/middle-of-funnel/x-ads`

**Breadcrumb:** Campaigns › {Campaign} › Middle of Funnel › X Ads

**KPI strip (6 cards):** CLICKS, CTR, CPC, CPM, VTR, ROAS

**Charts:** Identical schema to Meta Ads (Section 6.10), color = `--chart-mof`.

---

### 6.13 Branding / Perf. Ads Detail

**Route:** `/:campaignSlug/middle-of-funnel/branding`

**Breadcrumb:** Campaigns › {Campaign} › Middle of Funnel › Branding / Perf. Ads

**KPI strip (6 cards):** IMPRESSIONS, CTR, CPM, VTR, ROAS, SPEND

**Charts (2 per row, color = `--chart-mof`):**

| Row | Left Chart | Right Chart |
|---|---|---|
| T1 | Impressions (K) · Monthly | Impressions (K) · Quarterly |
| T2 | CTR (%) · Monthly | CTR (%) · Quarterly |
| T3 | ROAS (x) · Monthly | ROAS (x) · Quarterly |

---

### 6.14 In-App Pages Detail

**Route:** `/:campaignSlug/bottom-of-funnel/in-app`

**Breadcrumb:** Campaigns › {Campaign} › Bottom of Funnel › In-App Pages

**KPI strip (6 cards):** PAGE VIEWS, SIGN-UPS, DROP-OFF, BOUNCE, CONV RATE, AVG TIME

> AVG TIME display: convert `avg_time_seconds` to `{m}m {s}s` format (e.g. 134s → "2m 14s")

**Charts (2 per row, color = `--chart-bof`):**

| Row | Left Chart | Right Chart |
|---|---|---|
| T1 | Page Views (K) · Monthly | Page Views (K) · Quarterly |
| T2 | Sign-ups · Monthly | Sign-ups · Quarterly |
| T3 | Drop-off (%) · Monthly | Drop-off (%) · Quarterly |
| T4 | Bounce Rate (%) · Monthly | Bounce Rate (%) · Quarterly |

> Drop-off and Bounce Rate lines trend **downward** — this is intentional (lower is better).

---

### 6.15 Landing Pages Detail

**Route:** `/:campaignSlug/bottom-of-funnel/landing`

**Breadcrumb:** Campaigns › {Campaign} › Bottom of Funnel › Landing Pages

**KPI strip (6 cards):** CLICKS, CONVERSIONS, BOUNCE, CTO, CONV RATE, TOP PAGE

**Charts (2 per row, color = `--chart-bof`):**

| Row | Left Chart | Right Chart |
|---|---|---|
| T1 | Clicks (K) · Monthly | Clicks (K) · Quarterly |
| T2 | Conversions · Monthly | Conversions · Quarterly |
| T3 | Bounce Rate (%) · Monthly | Bounce Rate (%) · Quarterly |

---

### 6.16 Deep Links Detail

**Route:** `/:campaignSlug/bottom-of-funnel/deep-links`

**Breadcrumb:** Campaigns › {Campaign} › Bottom of Funnel › Deep Links

**KPI strip (6 cards):** CLICKS, INSTALLS, CTO, APP OPENS, CONV RATE, TOP LINK

**Charts (2 per row, color = `--chart-bof`):**

| Row | Left Chart | Right Chart |
|---|---|---|
| T1 | Clicks (K) · Monthly | Clicks (K) · Quarterly |
| T2 | Installs · Monthly | Installs · Quarterly |
| T3 | CTO (%) · Monthly | CTO (%) · Quarterly |

---

## 7. Shared Components

### 7.1 `<KpiStrip metrics={[]} funnelColor="" />`
Renders the 6-card row. Each card receives `{ label, value, format }`. `format` is one of: `number`, `currency`, `percent`, `multiplier`, `text`.

**Value formatting rules:**
- `number`: abbreviate with K/M suffix (e.g. 12400000 → "12.4M", 243000 → "243K")
- `currency`: same abbreviation but prefix `$` (e.g. 620000 → "$620K")
- `percent`: append `%` (e.g. 74 → "74%")
- `multiplier`: append `x` (e.g. 3.8 → "3.8x")
- `ratio`: show as `{value}/100` (e.g. 82 → "82/100") — used for Sentiment
- `text`: render as-is (e.g. "TikTok", "Positive")

### 7.2 `<ChartPair metric="" monthlyData={[]} quarterlyData={[]} color="" unit="" />`
Renders the standard two-chart row: left is a Recharts `AreaChart` or `LineChart` (monthly), right is a `BarChart` (quarterly). Both show a labeled value on the rightmost/topmost data point.

**Line chart specs:**
- Smooth curve (`type="monotone"`)
- Chart background: white (`#FFFFFF`)
- Stroke: funnel accent color (`--chart-tof`, `--chart-mof`, or `--chart-bof`), `strokeWidth: 2`
- Area fill: `--chart-tof-bg` / `--chart-mof-bg` / `--chart-bof-bg` (pale tinted fill)
- Gridlines: light horizontal only, `stroke: #F3F4F6`
- Dot on each data point: small filled circle, same color as stroke
- X-axis: month abbreviations (Jan, Feb…), `color: #9CA3AF`
- Y-axis: abbreviated numbers, `color: #9CA3AF`

**Bar chart specs:**
- Chart background: white (`#FFFFFF`)
- Single bar per quarter, full-width relative to chart area
- Bar fill: solid funnel accent color, no gradient
- Value label on top of bar: `font-weight: 600, color: #0D1117`
- No legend
- X-axis: Q1, Q2, etc. (or Q1-Q2 for campaigns shorter than 6 months)
- Bar corner radius: `border-radius: 4px` (top corners only)

### 7.3 `<ChannelCard title="" metrics={[]} drillPath="" funnelColor="" />`
The summary card used on channel overview pages. Renders title + "Drill in →" link + metric rows.

### 7.4 `<FunnelBanner label="" stageName="" drillPath="" color="" />`
The full-width banner row on the Campaign Overview page. Background = funnel accent color (OPay green, blue, or amber). Text and "Drill in →" link are white. `border-radius: 8px`.

### 7.5 `<Breadcrumb segments={[]} />`
Renders the "Campaigns › X › Y › Z" trail. Each segment except the last is a clickable link.

### 7.6 `<PageHeader campaignName="" subLabel="" dateRange="" budget="" />`
Consistent top header across all inner pages.

### 7.7 `<SentimentDonut positive={} neutral={} negative={} />`
Recharts `PieChart` with three segments. Colors: green for positive, gray for neutral, salmon/red for negative. Labels float outside segments.

### 7.8 `<KolTable rows={[]} />`
Renders the KOL performance table: KOL | Reach | Eng. | Cost | ROI.

### 7.9 `<HorizontalBarChart title="" data={[{label, value}]} color="" />`
Used for "GRP by Broadcast Channel". Recharts `BarChart` with `layout="vertical"`, value labels at end of bars.

---

## 8. Data Upload Flow

### 8.1 User Flow

1. User logs in and lands on the Home page. Previously uploaded campaigns are fetched from MongoDB via `GET /api/campaigns` and rendered immediately.
2. If no campaigns exist, show an empty state with an upload prompt.
3. User clicks "Upload Campaign" — a modal opens with a drag-and-drop zone.
4. User selects an `.xlsx` file. The file is sent as `multipart/form-data` to `POST /api/upload`.
5. The API route parses all sheets with SheetJS **on the server**, runs validation, and either:
   - **Error:** Returns `{ errors: [...] }` — the modal displays field-level error messages.
   - **Success:** Writes the campaign document to MongoDB, returns `{ slug }`.
6. On success the modal closes, the campaign list re-fetches (SWR revalidation), and the user is navigated to `/:slug`.

> All subsequent visits show the campaign immediately — no re-uploading needed.

### 8.2 Template Download

A "Download Template" link on the upload modal delivers a pre-built `.xlsx` file with all 15 sheets named and column headers filled. Generate this file once with SheetJS and serve it as a static asset from `/public/knapsack-template.xlsx`.

### 8.3 Validation Rules (enforced server-side in `/api/upload`)

- `campaign` sheet must exist with exactly one data row.
- All `month` values must match `YYYY-MM` format.
- All numeric fields must parse as finite numbers (no empty cells, no non-numeric strings).
- KOL sentiment percentages (`positive + neutral + negative`) must sum to 100 (±2 tolerance).
- The `slug` derived from `campaign.name` must not already exist for this user.
- Return all errors in a single response (not one at a time) so the user can fix everything at once.

### 8.4 Campaign Management

From the Home page, each campaign card has a **⋯ menu** with:
- **View** — opens the campaign dashboard
- **Delete** — calls `DELETE /api/campaigns/[slug]` with a confirmation prompt; removes the MongoDB document

---

## 9. Two-Week Shipping Plan

### Phase 1 — Backend, Auth & Foundation

| Task | To-do |
|---|---|
| T1 | Scaffold Next.js 14 (App Router) + Tailwind + SWR. Set up folder structure. Configure `tailwind.config.js` with OPay green. Add `MONGODB_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET` to `.env.local`. |
| T2 | Set up Prisma with MongoDB provider. Write `schema.prisma` (all models from Section 4.4). Run `prisma generate`. Create `lib/prisma.ts` singleton. |
| T3 | Set up Firebase project (5 min): enable Google OAuth, copy config to `.env.local`, download Admin SDK service account key. Build `lib/firebase.ts` (client) and `lib/firebase-admin.ts` (server). Build `/login` page with "Sign in with Google" button. Add auth guard to `/(dashboard)/layout.tsx`. Smoke-test sign-in end-to-end. |
| T4 | Build `/api/upload` route: SheetJS parsing, all validation rules, Prisma write. Build `/api/campaigns` (GET list) and `/api/campaigns/[slug]` (GET single, DELETE). Test with a real `.xlsx` file. |
| T5 | Build design system components: `KpiStrip`, `ChannelCard`, `FunnelBanner`, `Breadcrumb`, `PageHeader`. Build `ChartPair` and `HorizontalBarChart` with Recharts + OPay color scheme. Connect to mock data. |

### Phase 2 — All Dashboard Screens

| Task | To-do |
|---|---|
| T6 | Home page: fetch campaigns via SWR (`/api/campaigns`), campaign cards, upload modal (drag-and-drop → POST → redirect), delete menu, empty state, template download link. |
| T7 | Campaign Overview page (all 3 funnel banners + KPI strips, live data from `/api/campaigns/[slug]`). |
| T8 | ToF Channel Overview + TVC Detail + KOL Detail (sentiment donut + KOL table). |
| T9 | Organic Social Detail + PR/Media Detail + MoF Channel Overview + Meta Ads Detail. |
| T10 | TikTok Ads + X Ads + Branding Detail + all BoF screens (Channel Overview, In-App, Landing Pages, Deep Links). Final polish, test with both campaign datasets, fix edge cases. |

### Definition of Done (per screen)

- [ ] Data loads from MongoDB via API route (no hardcoded values)
- [ ] Only the authenticated user's campaigns are accessible
- [ ] All KPI values render and format correctly
- [ ] Monthly line charts and quarterly bar charts render correctly
- [ ] Monthly/Quarterly toggle switches all charts on the page
- [ ] Breadcrumb navigation works in both directions
- [ ] Responsive at 1280px and 1440px widths

### Environment Variables

```bash
# .env.local

# MongoDB
MONGODB_URL="mongodb+srv://..."         # MongoDB Atlas connection string

# Firebase client SDK (safe to expose — prefix NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"

# Firebase Admin SDK (server-only — never expose these)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> The `FIREBASE_PRIVATE_KEY` value comes from the service account JSON downloaded from **Firebase Console → Project Settings → Service Accounts → Generate new private key**. In Vercel, paste the key as-is — Vercel handles the newline escaping automatically.

---

*KnapSack Spec v1.3 — OPay Marketing · April 2026*