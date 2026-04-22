"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

interface ShareModalProps {
  campaignSlug: string;
  campaignName: string;
  onClose: () => void;
}

/**
 * Generates (or fetches) a share token for a campaign and presents a
 * copyable link to the user. Also supports revoking the link.
 */
export function ShareModal({
  campaignSlug,
  campaignName,
  onClose,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateLink() {
    setLoading(true);
    setError(null);
    try {
      const tok = await auth.currentUser?.getIdToken();
      if (!tok) throw new Error("Not authenticated");

      const res = await fetch(`/api/campaigns/${campaignSlug}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tok}` },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to generate link");
      }

      const { shareToken } = await res.json();
      setShareUrl(`${window.location.origin}/share/${shareToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate link");
    } finally {
      setLoading(false);
    }
  }

  async function revokeLink() {
    setRevoking(true);
    setError(null);
    try {
      const tok = await auth.currentUser?.getIdToken();
      if (!tok) throw new Error("Not authenticated");

      const res = await fetch(`/api/campaigns/${campaignSlug}/share`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tok}` },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to revoke link");
      }

      setShareUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke link");
    } finally {
      setRevoking(false);
    }
  }

  async function copyToClipboard() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Could not copy to clipboard. Please copy the link manually.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="share-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-modal shadow-elevated p-8 w-full max-w-[480px] z-10">
        {/* Close */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-page hover:text-text-primary transition-colors text-xl leading-none"
        >
          ×
        </button>

        {/* Icon + title */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#E6F7ED" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="15"
                cy="5"
                r="2.5"
                stroke="#00B140"
                strokeWidth="1.5"
              />
              <circle
                cx="5"
                cy="10"
                r="2.5"
                stroke="#00B140"
                strokeWidth="1.5"
              />
              <circle
                cx="15"
                cy="15"
                r="2.5"
                stroke="#00B140"
                strokeWidth="1.5"
              />
              <path
                d="M7.5 8.75L12.5 6.25M7.5 11.25L12.5 13.75"
                stroke="#00B140"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h2
              id="share-modal-title"
              className="text-[18px] font-bold text-text-primary"
            >
              Share Campaign
            </h2>
            <p className="mt-0.5 text-[13px] text-text-muted leading-snug">
              {campaignName}
            </p>
          </div>
        </div>

        {/* Body */}
        {!shareUrl ? (
          <>
            <div className="rounded-lg bg-page border border-border-default p-4 mb-6">
              <p className="text-[13px] text-text-secondary leading-relaxed">
                Generate a read-only shareable link for this campaign. Anyone
                with the link can view the campaign overview without logging in
                — no account required.
              </p>
            </div>

            {error && (
              <p className="mb-4 text-[13px] text-red-600 bg-red-50 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={generateLink}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[14px] font-semibold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#00B140" }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#008F33";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#00B140";
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating link…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle
                      cx="11"
                      cy="3.5"
                      r="1.75"
                      stroke="white"
                      strokeWidth="1.3"
                    />
                    <circle
                      cx="3.5"
                      cy="7.5"
                      r="1.75"
                      stroke="white"
                      strokeWidth="1.3"
                    />
                    <circle
                      cx="11"
                      cy="11.5"
                      r="1.75"
                      stroke="white"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5.25 6.5L9.25 4.5M5.25 8.5L9.25 10.5"
                      stroke="white"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Generate Share Link
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <p className="text-[13px] text-text-secondary mb-3">
              Share this link with management. It gives read-only access to the
              campaign overview — no login required.
            </p>

            {/* Link display */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#F4F6F8] border border-border-default mb-4">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-[12px] text-text-primary font-mono outline-none truncate"
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="shrink-0 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all"
                style={{
                  backgroundColor: copied ? "#E6F7ED" : "#00B140",
                  color: copied ? "#00B140" : "white",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {error && (
              <p className="mb-4 text-[13px] text-red-600 bg-red-50 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between pt-2 border-t border-border-default">
              <button
                type="button"
                onClick={revokeLink}
                disabled={revoking}
                className="text-[12px] font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-60"
              >
                {revoking ? "Revoking…" : "Revoke link"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-page transition-colors"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
