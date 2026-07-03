"use client";

import { useMemo, useState } from "react";
import type { Goal, Transformation } from "@/content/site";
import { goalLabels } from "@/content/site";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

type Filter = "all" | Goal;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "fat-loss", label: goalLabels["fat-loss"] },
  { key: "muscle-gain", label: goalLabels["muscle-gain"] },
  { key: "recomp", label: goalLabels.recomp },
  { key: "lifestyle", label: goalLabels.lifestyle },
];

export function TransformationsGallery({
  items,
}: {
  items: Transformation[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((t) => t.goal === filter)),
    [filter, items],
  );

  // Only show filter chips for goals that actually have entries.
  const availableFilters = FILTERS.filter(
    (f) => f.key === "all" || items.some((t) => t.goal === f.key),
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {availableFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? "border-accent bg-accent text-ink"
                : "border-line text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((t, i) => (
          <figure key={t.id} className="flex flex-col gap-3">
            <BeforeAfterSlider
              beforeImage={t.beforeImage}
              afterImage={t.afterImage}
              beforeAlt={`${t.clientName} before`}
              afterAlt={`${t.clientName} after`}
              priority={i < 3}
            />
            <figcaption className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fg">
                  {t.clientName}
                </span>
                <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                  {goalLabels[t.goal]} · {t.durationWeeks} wks
                </span>
              </div>
              <p className="text-sm text-muted">{t.summary}</p>
              {t.placeholder && (
                <p className="text-xs text-accent/80">
                  Sample image — real consented transformations coming soon.
                </p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 text-center text-muted">
          No transformations in this category yet.
        </p>
      )}
    </div>
  );
}
