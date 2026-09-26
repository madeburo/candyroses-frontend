"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Children's standard size chart for age sizes 1Y–10Y; measurements in inches. */
const ROWS: { age: number; height: [number, number]; chest: [number, number]; waist: [number, number]; hips: [number, number] }[] = [
  { age: 1, height: [31.5, 33.8], chest: [19.5, 20.5], waist: [19.0, 19.5], hips: [20.5, 21.3] },
  { age: 2, height: [33.8, 36.2], chest: [20.5, 21.3], waist: [19.5, 20.5], hips: [21.3, 22.0] },
  { age: 3, height: [36.2, 38.5], chest: [21.3, 22.0], waist: [20.0, 20.8], hips: [22.0, 22.8] },
  { age: 4, height: [38.5, 40.9], chest: [22.0, 22.8], waist: [20.5, 21.3], hips: [22.8, 24.0] },
  { age: 5, height: [40.9, 43.3], chest: [22.8, 23.6], waist: [20.8, 21.6], hips: [24.0, 25.2] },
  { age: 6, height: [43.3, 45.6], chest: [23.6, 24.4], waist: [21.3, 22.0], hips: [25.2, 26.4] },
  { age: 7, height: [45.6, 48.0], chest: [24.4, 25.2], waist: [21.6, 22.4], hips: [26.4, 27.5] },
  { age: 8, height: [48.0, 50.4], chest: [25.2, 26.4], waist: [22.0, 22.8], hips: [27.5, 28.7] },
  { age: 9, height: [50.4, 52.7], chest: [26.4, 27.5], waist: [22.4, 23.2], hips: [28.7, 29.9] },
  { age: 10, height: [52.7, 55.1], chest: [27.5, 28.7], waist: [22.8, 23.6], hips: [29.9, 31.1] },
];

const COLUMNS = [
  { key: "height", label: "Height" },
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
] as const;

type Unit = "in" | "cm";

function range([from, to]: [number, number], unit: Unit) {
  return unit === "in" ? `${from.toFixed(1)}–${to.toFixed(1)}″` : `${Math.round(from * 2.54)}–${Math.round(to * 2.54)}`;
}

export function AgeSizeChart({ showIntro = true, showTips = true }: { showIntro?: boolean; showTips?: boolean }) {
  const [unit, setUnit] = useState<Unit>("in");
  return (
    <div className="space-y-4 text-sm">
      <div className={cn("flex flex-wrap items-center gap-3", showIntro ? "justify-between" : "justify-end")}>
        {showIntro && <p className="text-muted">Sizes follow your child’s age. Compare her measurements with the chart to find the best fit.</p>}
        <div className="inline-flex rounded-full border border-line bg-warm-white p-0.5" role="group" aria-label="Units">
          {(["in", "cm"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={cn("rounded-full px-3.5 py-1 text-xs font-semibold transition-colors", unit === u ? "bg-cream text-ink shadow-soft" : "text-muted hover:text-ink")}
            >
              {u === "in" ? "Inches" : "Centimeters"}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[440px] text-left">
          <caption className="sr-only">Children’s size chart, ages 1–10, in {unit === "in" ? "inches" : "centimeters"}</caption>
          <thead className="bg-cream text-[11px] tracking-[0.12em] text-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Size</th>
              {COLUMNS.map((c) => (
                <th key={c.key} scope="col" className="px-4 py-3 font-semibold">
                  {c.label}
                  <span className="ml-1 normal-case tracking-normal">({unit})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ROWS.map((r) => (
              <tr key={r.age} className="transition-colors hover:bg-cream/60">
                <th scope="row" className="px-4 py-2.5 font-medium whitespace-nowrap text-ink">
                  {r.age}Y <span className="ml-1 font-normal text-muted">· {r.age} {r.age === 1 ? "year" : "years"}</span>
                </th>
                {COLUMNS.map((c) => (
                  <td key={c.key} className="px-4 py-2.5 whitespace-nowrap tabular-nums text-ink-soft">
                    {range(r[c.key], unit)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showTips && (
        <div className="rounded-2xl bg-cream/70 p-4 sm:p-5">
          <p className="font-semibold text-ink">How to measure</p>
          <ul className="mt-2 grid gap-1.5 text-ink-soft sm:grid-cols-2">
            <li><span className="font-medium text-ink">Height</span> — standing straight against a wall, without shoes.</li>
            <li><span className="font-medium text-ink">Chest</span> — around the fullest part, just under the arms.</li>
            <li><span className="font-medium text-ink">Waist</span> — around the natural waistline, above the belly button.</li>
            <li><span className="font-medium text-ink">Hips</span> — around the widest part of the hips.</li>
          </ul>
          <p className="mt-3 text-muted">In between sizes? Choose the larger one — or message us with her measurements and we’ll gladly help you pick.</p>
        </div>
      )}
    </div>
  );
}
