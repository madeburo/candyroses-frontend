"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { api, errorText } from "@/lib/client-api";

export function PayButton({ token, label }: { token: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        className="btn-rose w-full sm:w-auto"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const r = await api.post<{ payment: { type: string; url?: string; message?: string } }>(`/orders/by-token/${token}/pay`);
            if (r.payment.type === "redirect" && r.payment.url) window.location.assign(r.payment.url);
            else window.location.reload();
          } catch (e) {
            setError(errorText(e));
            setBusy(false);
          }
        }}
      >
        {busy && <Loader2 className="size-4 animate-spin" />} {label}
      </button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
