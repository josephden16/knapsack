"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

interface UploadModalProps {
  onClose: () => void;
  /** Called after the campaign is persisted — use to trigger SWR revalidation. */
  onUploaded: () => void;
}

export function UploadModal({ onClose, onUploaded }: UploadModalProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const acceptFile = useCallback((f: File) => {
    setFile(f);
    setErrors([]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) acceptFile(f);
    },
    [acceptFile],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    const tok = await auth.currentUser?.getIdToken();
    if (!tok) {
      setErrors(["Authentication error. Please refresh and try again."]);
      return;
    }

    setUploading(true);
    setErrors([]);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${tok}` },
        body: form,
      });

      const json = await res.json();

      if (!res.ok) {
        setErrors(
          Array.isArray(json.errors)
            ? json.errors
            : [json.error ?? "Upload failed. Please try again."],
        );
        setUploading(false);
        return;
      }

      onUploaded();
      router.push(`/${json.slug}`);
    } catch {
      setErrors(["Network error. Please try again."]);
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="upload-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-modal shadow-elevated p-8 w-full max-w-[520px] z-10">
        <h2
          id="upload-modal-title"
          className="text-[20px] font-bold text-text-primary mb-6"
        >
          Upload Campaign
        </h2>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={[
            "flex flex-col items-center justify-center gap-3 rounded-[12px] p-10 cursor-pointer select-none",
            "border-2 border-dashed transition-colors outline-none",
            dragOver
              ? "border-opay-green bg-opay-green-light"
              : file
                ? "border-opay-green bg-[#E6F7ED]/60"
                : "border-border-strong bg-[#F9FAFB] hover:border-opay-green hover:bg-[#E6F7ED]/40 focus-visible:border-opay-green",
          ].join(" ")}
        >
          {file ? (
            <>
              <div className="w-10 h-10 rounded-lg bg-opay-green-light flex items-center justify-center">
                {/* File icon */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M11 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V8l-6-6z"
                    stroke="#00B140"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 2v6h6"
                    stroke="#00B140"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-text-primary text-center break-all px-2">
                {file.name}
              </p>
              <p className="text-[12px] text-text-muted">
                Click to change file
              </p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                {/* Upload arrow icon */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 13V3M10 3L7 6M10 3l3 3"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-[14px] text-text-muted text-center">
                Drag &amp; drop your{" "}
                <span className="font-medium text-text-secondary">.xlsx</span>{" "}
                file here,{" "}
                <span className="text-opay-green font-medium">
                  or click to browse
                </span>
              </p>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx"
          className="sr-only"
          onChange={handleFileInput}
          tabIndex={-1}
        />

        {/* Errors */}
        {errors.length > 0 && (
          <ul className="mt-4 space-y-1" role="alert">
            {errors.map((err, i) => (
              <li key={i} className="text-[12px] text-red-500">
                • {err}
              </li>
            ))}
          </ul>
        )}

        {/* Action row */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <a
            href="/knapsack-template.xlsx"
            download
            onClick={(e) => e.stopPropagation()}
            className="text-[13px] font-medium text-opay-green hover:text-opay-green-dark transition-colors shrink-0"
          >
            ↓ Download Template
          </a>

          <div className="flex gap-3">
            {/* Ghost / cancel */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-[10px] rounded-lg text-[14px] font-medium text-text-secondary border border-border-default hover:bg-page transition-colors"
            >
              Cancel
            </button>

            {/* Primary / upload */}
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-5 py-[10px] rounded-lg text-[14px] font-semibold text-white bg-opay-green hover:bg-opay-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Uploading…" : "Upload Campaign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
