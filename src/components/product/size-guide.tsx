const ROWS: [string, string, string][] = [
  ["80", "9–12 months", "12M"],
  ["86", "12–18 months", "18M"],
  ["92", "18–24 months", "2T"],
  ["98", "2–3 years", "3T"],
  ["104", "3–4 years", "4T"],
  ["110", "4–5 years", "5"],
  ["116", "5–6 years", "6"],
  ["122", "6–7 years", "7"],
  ["128", "7–8 years", "8"],
  ["134", "8–9 years", "9"],
  ["140", "9–10 years", "10"],
  ["146", "10–11 years", "11"],
  ["152", "11–12 years", "12"],
];

/** Our sizes are the child's height in centimeters (EU sizing). */
export function SizeGuide() {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted">Our sizes match your child’s height in centimeters. Measure height without shoes and choose the nearest size up.</p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[320px] text-left">
          <caption className="sr-only">Size conversion</caption>
          <thead className="bg-cream text-xs tracking-wide text-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">Size (height, cm)</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Height, in</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Age</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">US size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ROWS.map(([cm, age, us]) => (
              <tr key={cm}>
                <td className="px-4 py-2 font-medium">{cm}</td>
                <td className="px-4 py-2 tabular-nums">{(Number(cm) / 2.54).toFixed(1)}″</td>
                <td className="px-4 py-2">{age}</td>
                <td className="px-4 py-2">{us}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
