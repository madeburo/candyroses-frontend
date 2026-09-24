"use client";

import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Field } from "@/components/ui/field";
import { api, errorText } from "@/lib/client-api";
import { US_STATES } from "@/lib/us-states";

interface Address {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  city: string;
  region: string | null;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  isDefault: boolean;
}

const EMPTY = { fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", region: "", postalCode: "", isDefault: false };

export default function AddressesPage() {
  const [list, setList] = useState<Address[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => api.get<Address[]>("/customer/addresses").then(setList), []);
  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{5}(-\d{4})?$/.test(draft.postalCode)) return setError("Enter a valid ZIP code");
    try {
      await api.post("/customer/addresses", { ...draft, country: "United States", addressLine2: draft.addressLine2 || undefined });
      setDraft(EMPTY);
      setAdding(false);
      await load();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="max-w-3xl">
      {!list ? (
        <Loader2 className="size-5 animate-spin text-muted" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="relative rounded-2xl border border-line p-5 text-sm">
              <MapPin className="mb-2 size-4 text-rose-deep" />
              <p className="font-semibold">
                {a.fullName} {a.isDefault && <span className="ml-1 rounded-full bg-blush px-2 py-0.5 text-xs font-medium">Default</span>}
              </p>
              <p className="mt-1 text-muted">
                {a.addressLine1}
                {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                <br />
                {a.city}, {a.region} {a.postalCode}
              </p>
              <p className="text-muted">{a.phone}</p>
              <div className="mt-3 flex gap-3">
                {!a.isDefault && (
                  <button type="button" className="text-sm underline underline-offset-4" onClick={() =>
                      void api
                        .patch(`/customer/addresses/${a.id}`, {
                          fullName: a.fullName,
                          phone: a.phone,
                          city: a.city,
                          addressLine1: a.addressLine1,
                          addressLine2: a.addressLine2 ?? undefined,
                          region: a.region ?? undefined,
                          postalCode: a.postalCode ?? undefined,
                          isDefault: true,
                        })
                        .then(load)
                    }>
                    Make default
                  </button>
                )}
                <button type="button" className="inline-flex items-center gap-1 text-sm text-muted hover:text-danger" onClick={() => void api.delete(`/customer/addresses/${a.id}`).then(load)}>
                  <Trash2 className="size-3.5" /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <form onSubmit={save} className="mt-8 grid gap-4 rounded-2xl bg-cream/70 p-6 sm:grid-cols-6">
          <Field label="Full name" htmlFor="a-name" className="sm:col-span-3">
            <input id="a-name" className="input" required value={draft.fullName} onChange={set("fullName")} autoComplete="name" />
          </Field>
          <Field label="Phone" htmlFor="a-phone" className="sm:col-span-3">
            <input id="a-phone" className="input" required type="tel" value={draft.phone} onChange={set("phone")} autoComplete="tel" />
          </Field>
          <Field label="Street address" htmlFor="a-l1" className="sm:col-span-6">
            <input id="a-l1" className="input" required value={draft.addressLine1} onChange={set("addressLine1")} autoComplete="address-line1" />
          </Field>
          <Field label="Apartment, suite (optional)" htmlFor="a-l2" className="sm:col-span-6">
            <input id="a-l2" className="input" value={draft.addressLine2} onChange={set("addressLine2")} autoComplete="address-line2" />
          </Field>
          <Field label="City" htmlFor="a-city" className="sm:col-span-3">
            <input id="a-city" className="input" required value={draft.city} onChange={set("city")} autoComplete="address-level2" />
          </Field>
          <Field label="State" htmlFor="a-state" className="sm:col-span-2">
            <select id="a-state" className="input" required value={draft.region} onChange={set("region")}>
              <option value="">Select</option>
              {US_STATES.map(([c, n]) => (
                <option key={c} value={c}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ZIP" htmlFor="a-zip" className="sm:col-span-1">
            <input id="a-zip" className="input" required inputMode="numeric" value={draft.postalCode} onChange={set("postalCode")} autoComplete="postal-code" />
          </Field>
          {error && <p className="text-sm text-danger sm:col-span-6">{error}</p>}
          <div className="flex gap-3 sm:col-span-6">
            <button type="submit" className="btn-primary">
              Save address
            </button>
            <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn-secondary mt-8" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Add address
        </button>
      )}
    </div>
  );
}
