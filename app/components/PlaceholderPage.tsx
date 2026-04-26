"use client";

import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  icon?: LucideIcon;
  title: string;
  description: string;
}

/**
 * Reusable placeholder for pages that are not yet implemented.
 * Matches the existing design system — used temporarily until
 * each page gets its own full implementation.
 */
export default function PlaceholderPage({
  icon: Icon = Construction,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div
      className="bg-white rounded-[var(--radius-lg)] border border-surface-200 animate-fade-in"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div
          className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center mb-4"
          style={{ background: "var(--color-brand-50)" }}
        >
          <Icon className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} />
        </div>
        <h3 className="text-[16px] font-semibold text-text-primary mb-1">
          {title}
        </h3>
        <p className="text-[13px] text-text-tertiary max-w-[340px]">
          {description}
        </p>
        <div className="mt-5 flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-600 text-[12px] font-medium">
          <Construction className="w-3.5 h-3.5" />
          Segera hadir
        </div>
      </div>
    </div>
  );
}
