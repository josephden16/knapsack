"use client";

import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbSegment {
  label: string;
  /** Omit for the last (current) segment — it renders as plain text. */
  href?: string;
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
}

/**
 * Renders "Campaigns › Campaign › Stage › Channel" navigation trail.
 * All segments with an href are clickable links; the last is plain text.
 */
export function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className="flex items-center gap-1 text-[13px]"
    >
      {segments.map((segment, i) => (
        <Fragment key={segment.label}>
          {i > 0 && <span className="text-text-muted select-none">›</span>}
          {segment.href ? (
            <Link
              href={segment.href}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {segment.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">
              {segment.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
