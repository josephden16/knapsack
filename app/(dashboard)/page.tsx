"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { formatMetric } from "@/lib/format";
import { UploadModal } from "@/components/ui/UploadModal";

// ─── Types ───────────────────────────────────────────────────────────────────

type CampaignSummary = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "completed";
  startDate: string;
  endDate: string;
  budget: number;
  spend: number;
  roi: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateRange(startDate: string, endDate: string): string {
  const [sY, sM] = startDate.split("-");
  const [eY, eM] = endDate.split("-");
  const sLabel = MONTHS[parseInt(sM) - 1];
  const eLabel = MONTHS[parseInt(eM) - 1];
  if (sY === eY) return `${sLabel} — ${eLabel} ${sY}`;
  return `${sLabel} ${sY} — ${eLabel} ${eY}`;
}

async function campaignsFetcher([url, token]: [string, string]) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: "active" | "completed" }) {
  const isActive = status === "active";
  return (
    <span
      className="px-[10px] py-[3px] rounded-full text-[11px] font-semibold uppercase tracking-[0.02em] whitespace-nowrap"
      style={{
        background: isActive ? "#E6F7ED" : "#EFF6FF",
        color: isActive ? "#00B140" : "#0066CC",
        border: `1px solid ${isActive ? "#A7F3C0" : "#BFDBFE"}`,
      }}
    >
      {status}
    </span>
  );
}

function ThreeDotsMenu({
  onView,
  onDelete,
}: {
  onView: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Campaign options"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:bg-page hover:text-text-secondary transition-colors text-lg leading-none"
      >
        ···
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-card shadow-elevated border border-border-default overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="w-full px-4 py-2.5 text-left text-[13px] text-text-primary hover:bg-page transition-colors"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full px-4 py-2.5 text-left text-[13px] text-red-500 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  onDelete,
}: {
  campaign: CampaignSummary;
  onDelete: (slug: string) => void;
}) {
  const router = useRouter();
  const isActive = campaign.status === "active";
  const accentColor = isActive ? "#00B140" : "#0066CC";

  return (
    <div
      className="group bg-white rounded-card-lg shadow-card flex flex-col overflow-hidden transition-shadow hover:shadow-elevated cursor-pointer"
      onClick={() => router.push(`/${campaign.slug}`)}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: accentColor }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Top row: name + status pill + ⋯ */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-[18px] font-bold text-text-primary leading-snug group-hover:text-opay-green transition-colors">
            {campaign.name}
          </h2>
          <div
            className="flex items-center gap-1.5 shrink-0 mt-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <StatusPill status={campaign.status} />
            <ThreeDotsMenu
              onView={() => router.push(`/${campaign.slug}`)}
              onDelete={() => onDelete(campaign.slug)}
            />
          </div>
        </div>

        {/* Date range */}
        <p className="mt-1.5 text-[13px] text-text-muted flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect
              x="1"
              y="2"
              width="10"
              height="9"
              rx="1.5"
              stroke="#9CA3AF"
              strokeWidth="1.2"
            />
            <path
              d="M4 1v2M8 1v2M1 5h10"
              stroke="#9CA3AF"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          {formatDateRange(campaign.startDate, campaign.endDate)}
        </p>

        {/* Divider */}
        <div className="my-4 h-px bg-border-default" />

        {/* Metric row */}
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              {
                label: "BUDGET",
                value: formatMetric(campaign.budget, "currency"),
              },
              {
                label: "SPEND",
                value: formatMetric(campaign.spend, "currency"),
              },
              {
                label: "ROI",
                value: formatMetric(campaign.roi, "multiplier"),
              },
            ] as const
          ).map(({ label, value }) => (
            <div key={label}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-text-muted">
                {label}
              </p>
              <p
                className="mt-1 text-[20px] font-bold text-text-primary"
                style={{ fontFeatureSettings: '"tnum"' }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Open link */}
        <div className="mt-4 pt-4 border-t border-border-default flex items-center justify-between">
          <span className="text-[12px] text-text-muted">
            {isActive ? "Campaign in progress" : "Campaign finished"}
          </span>
          <span
            className="text-[13px] font-semibold transition-colors"
            style={{ color: accentColor }}
          >
            Open →
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div
      className="rounded-[16px] border-2 border-dashed border-border-strong bg-white flex flex-col items-center justify-center py-20 px-8 text-center"
      style={{ boxShadow: "inset 0 2px 12px rgba(0,71,28,0.03)" }}
    >
      {/* Stacked icon cluster */}
      <div className="relative mb-6">
        {/* Background rings */}
        <div className="absolute inset-0 rounded-full bg-[#E6F7ED] opacity-40 scale-[2.2] blur-xl" />
        <div className="relative w-20 h-20 rounded-2xl bg-[#E6F7ED] flex items-center justify-center shadow-card">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M10 5h13l7 7v20a2 2 0 01-2 2H10a2 2 0 01-2-2V7a2 2 0 012-2z"
              fill="#E6F7ED"
              stroke="#00B140"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M23 5v7h7"
              stroke="#00B140"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M18 16v9M14 21h8"
              stroke="#00B140"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-[20px] font-bold text-text-primary tracking-[-0.2px]">
        No campaigns yet
      </h3>
      <p className="mt-2 text-[14px] text-text-muted max-w-[320px] leading-relaxed">
        Upload an Excel workbook with your campaign data to generate a full
        funnel reporting dashboard.
      </p>

      {/* CTA group */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onUpload}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold text-white bg-opay-green hover:bg-opay-green-dark transition-colors shadow-card"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 10V2M8 2L5 5M8 2l3 3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Upload Campaign
        </button>
        <a
          href="/knapsack-example.xlsx"
          download
          className="flex items-center gap-1.5 px-5 py-3 rounded-lg text-[13px] font-medium text-opay-green border border-opay-green hover:bg-opay-green-light transition-colors"
        >
          ↓ Download Example
        </a>
        <a
          href="/knapsack-template.xlsx"
          download
          className="flex items-center gap-1.5 px-5 py-3 rounded-lg text-[13px] font-medium text-text-secondary border border-border-strong hover:bg-page transition-colors"
        >
          ↓ Blank Template
        </a>
      </div>

      {/* Steps hint */}
      <div className="mt-10 grid grid-cols-3 gap-4 max-w-[480px] text-left">
        {[
          {
            n: "1",
            title: "Download example",
            body: "See a complete workbook with 6 months of real campaign data.",
          },
          {
            n: "2",
            title: "Fill your data",
            body: "Use the blank template and paste your monthly channel metrics.",
          },
          {
            n: "3",
            title: "Upload & explore",
            body: "Generate charts and KPIs instantly — no code needed.",
          },
        ].map(({ n, title, body }) => (
          <div key={n} className="flex flex-col gap-1.5">
            <div className="w-6 h-6 rounded-full bg-opay-green flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-bold leading-none">
                {n}
              </span>
            </div>
            <p className="text-[12px] font-semibold text-text-primary">
              {title}
            </p>
            <p className="text-[11px] text-text-muted leading-relaxed">
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    const tryGetToken = async () => {
      const user = auth.currentUser;
      if (user) setToken(await user.getIdToken());
    };
    tryGetToken();

    return onAuthStateChanged(auth, async (user) => {
      if (user) setToken(await user.getIdToken());
      else setToken(null);
    });
  }, []);

  const { data, mutate } = useSWR<{ campaigns: CampaignSummary[] }>(
    token ? (["/api/campaigns", token] as [string, string]) : null,
    campaignsFetcher,
  );

  const campaigns = data?.campaigns ?? [];
  const isLoading = !!token && !data;

  const handleDelete = useCallback(
    async (slug: string) => {
      if (
        !window.confirm("Delete this campaign? This action cannot be undone.")
      )
        return;
      const tok = await auth.currentUser?.getIdToken();
      if (!tok) return;
      await fetch(`/api/campaigns/${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tok}` },
      });
      mutate();
    },
    [mutate],
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F4F6F8" }}
    >
      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #00B140 0%, #007A2C 100%)",
        }}
      >
        {/* Decorative dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Decorative large circle */}
        <div
          className="absolute -right-24 -top-24 w-[360px] h-[360px] rounded-full opacity-10"
          style={{ background: "#ffffff" }}
        />

        <div className="relative max-w-[1160px] mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: brand + title */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(255,255,255,0.3)",
              }}
            >
              <span className="text-white font-bold text-[26px] leading-none">
                K
              </span>
            </div>
            <div>
              <h1 className="text-white font-bold text-[22px] leading-none tracking-[-0.3px]">
                KnapSack
              </h1>
              <p
                className="mt-1 text-[13px] font-normal"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Funnel-Based Campaign Reporting · OPay
              </p>
            </div>
          </div>

          {/* Right: upload + template + example */}
          <div className="flex items-center gap-3">
            <a
              href="/knapsack-example.xlsx"
              download
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
              style={{
                color: "rgba(255,255,255,0.9)",
                border: "1.5px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.08)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.16)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
            >
              ↓ Example
            </a>
            <a
              href="/knapsack-template.xlsx"
              download
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
              style={{
                color: "rgba(255,255,255,0.9)",
                border: "1.5px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.08)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.16)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
            >
              ↓ Template
            </a>
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors"
              style={{
                background: "#ffffff",
                color: "#00B140",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#E6F7ED")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#ffffff")}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M7.5 9.5V2M7.5 2L5 4.5M7.5 2L10 4.5"
                  stroke="#00B140"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 10.5v1a1.5 1.5 0 001.5 1.5h8A1.5 1.5 0 0013 11.5v-1"
                  stroke="#00B140"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Upload Campaign
            </button>
          </div>
        </div>

        {/* Stat bar */}
        {!isLoading && campaigns.length > 0 && (
          <div className="relative max-w-[1160px] mx-auto px-6 pb-5 flex items-center gap-8">
            {[
              { label: "Campaigns", value: String(campaigns.length) },
              {
                label: "Active",
                value: String(
                  campaigns.filter((c) => c.status === "active").length,
                ),
              },
              {
                label: "Completed",
                value: String(
                  campaigns.filter((c) => c.status === "completed").length,
                ),
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span
                  className="text-[22px] font-bold leading-none"
                  style={{ color: "#ffffff", fontFeatureSettings: '"tnum"' }}
                >
                  {value}
                </span>
                <span
                  className="text-[12px] font-medium uppercase tracking-[0.06em]"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom wave */}
        <div className="h-6 relative">
          <svg
            viewBox="0 0 1440 24"
            fill="none"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-full h-full"
          >
            <path d="M0 24 Q720 0 1440 24 L1440 24 L0 24Z" fill="#F4F6F8" />
          </svg>
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[1160px] w-full mx-auto px-6 py-8">
        {/* Section header when campaigns exist */}
        {!isLoading && campaigns.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-semibold text-text-primary">
              Your Campaigns
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={{
                  background: "#E6F7ED",
                  color: "#00B140",
                  verticalAlign: "middle",
                }}
              >
                {campaigns.length}
              </span>
            </h2>
            <p className="text-[13px] text-text-muted">
              Select a campaign to view its full reporting dashboard
            </p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 rounded-xl bg-opay-green animate-pulse" />
            <p className="text-[14px] text-text-muted">Loading campaigns…</p>
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState onUpload={() => setUploadOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-8 text-center">
        <p className="text-[12px] text-text-muted">
          KnapSack — Campaign Reporting Platform · OPay Marketing
        </p>
      </footer>

      {/* ── Upload modal ────────────────────────────────────────────────── */}
      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onUploaded={() => mutate()}
        />
      )}
    </div>
  );
}
