"use client";

import { create } from "zustand";
import { api, hasSession } from "@/lib/client-api";
import type { Customer } from "@/lib/types";

interface CustomerState {
  customer: Customer | null;
  loaded: boolean;
  load: () => Promise<Customer | null>;
  set: (c: Customer | null) => void;
}

export const useCustomer = create<CustomerState>((set) => ({
  customer: null,
  loaded: false,
  load: async () => {
    if (!hasSession()) {
      set({ customer: null, loaded: true });
      return null;
    }
    try {
      const c = await api.get<Customer>("/customer/me");
      set({ customer: c, loaded: true });
      return c;
    } catch {
      set({ customer: null, loaded: true });
      return null;
    }
  },
  set: (customer) => set({ customer, loaded: true }),
}));
