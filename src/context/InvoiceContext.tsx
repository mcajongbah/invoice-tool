"use client";

import type {
  CalculatedTotals,
  CustomerInfo,
  DiscountTiming,
  Invoice,
  InvoiceState,
} from "@/types/invoice";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const LOCAL_STORAGE_DRAFT_KEY = "fi_draft_invoice_v1";
const LOCAL_STORAGE_PREF_KEY = "fi_preferences_v1";

function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(baseISO: string, days: number): string {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function defaultInvoice(): Invoice {
  const created = todayISO();
  return {
    id: `INV-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    issueDate: created,
    dueDate: addDaysISO(created, 30),
    currency: "USD",
    themeColor: "#2563eb",
    business: {
      name: "",
      logoDataUrl: null,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      email: "",
      phone: "",
    },
    customer: {
      displayName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      email: "",
      phone: "",
      reference: "",
    },
    items: [
      {
        id: generateId("item"),
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRatePercent: 0,
        discountType: "percent",
        discountValue: 0,
      },
    ],
    discountTiming: "before-tax",
    payment: {
      terms: "",
      methods: "",
      bankDetails: "",
      notes: "",
      termsAndConditions: "",
    },
  };
}

function computeTotals(invoice: Invoice): CalculatedTotals {
  const subtotal = invoice.items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );

  const perLineDiscount = invoice.items.reduce((acc, item) => {
    const line = item.quantity * item.unitPrice;
    const discount =
      item.discountType === "percent"
        ? (line * item.discountValue) / 100
        : item.discountValue;
    return acc + Math.min(Math.max(discount, 0), line);
  }, 0);

  const taxableBase =
    invoice.discountTiming === "before-tax"
      ? subtotal - perLineDiscount
      : subtotal;

  const taxTotal = invoice.items.reduce((acc, item) => {
    const line = item.quantity * item.unitPrice;
    const lineBase =
      invoice.discountTiming === "before-tax"
        ? line -
          (item.discountType === "percent"
            ? (line * item.discountValue) / 100
            : item.discountValue)
        : line;
    const tax = (lineBase * item.taxRatePercent) / 100;
    return acc + Math.max(tax, 0);
  }, 0);

  const discountTotal = perLineDiscount;
  // If after-tax, discount is already part of perLineDiscount but timing means subtract after computing tax.
  const finalTotal =
    invoice.discountTiming === "after-tax"
      ? subtotal + taxTotal - discountTotal
      : taxableBase + taxTotal;

  return {
    subtotal: roundToCents(subtotal),
    discountTotal: roundToCents(discountTotal),
    taxTotal: roundToCents(taxTotal),
    grandTotal: roundToCents(finalTotal),
  };
}

function roundToCents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

type Action =
  | { type: "SET_INVOICE"; payload: Partial<Invoice> }
  | { type: "SET_BUSINESS"; payload: Partial<Invoice["business"]> }
  | { type: "SET_CUSTOMER"; payload: Partial<Invoice["customer"]> }
  | { type: "ADD_ITEM" }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | {
      type: "UPDATE_ITEM";
      payload: { id: string; updates: Partial<Invoice["items"][number]> };
    }
  | { type: "REORDER_ITEMS"; payload: { from: number; to: number } }
  | { type: "SET_DISCOUNT_TIMING"; payload: DiscountTiming }
  | { type: "SET_CURRENCY"; payload: Invoice["currency"] }
  | { type: "LOAD"; payload: InvoiceState }
  | { type: "SAVE_CUSTOMER"; payload: CustomerInfo }
  | { type: "DELETE_CUSTOMER"; payload: { id: string } };

function reducer(state: InvoiceState, action: Action): InvoiceState {
  switch (action.type) {
    case "LOAD":
      return { ...action.payload };
    case "SET_INVOICE": {
      const draft = { ...state.draft, ...action.payload };
      return recompute({ ...state, draft });
    }
    case "SET_BUSINESS": {
      const draft = {
        ...state.draft,
        business: { ...state.draft.business, ...action.payload },
      };
      return recompute({ ...state, draft });
    }
    case "SET_CUSTOMER": {
      const draft = {
        ...state.draft,
        customer: { ...state.draft.customer, ...action.payload },
      };
      return recompute({ ...state, draft });
    }
    case "ADD_ITEM": {
      const draft = {
        ...state.draft,
        items: [
          ...state.draft.items,
          {
            id: generateId("item"),
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRatePercent: 0,
            discountType: "percent" as const,
            discountValue: 0,
          },
        ],
      };
      return recompute({ ...state, draft });
    }
    case "REMOVE_ITEM": {
      const draft = {
        ...state.draft,
        items: state.draft.items.filter((it) => it.id !== action.payload.id),
      };
      return recompute({ ...state, draft });
    }
    case "UPDATE_ITEM": {
      const draft = {
        ...state.draft,
        items: state.draft.items.map((it) =>
          it.id === action.payload.id
            ? { ...it, ...action.payload.updates }
            : it
        ),
      };
      return recompute({ ...state, draft });
    }
    case "REORDER_ITEMS": {
      const items = [...state.draft.items];
      const [moved] = items.splice(action.payload.from, 1);
      items.splice(action.payload.to, 0, moved);
      const draft = { ...state.draft, items };
      return recompute({ ...state, draft });
    }
    case "SET_DISCOUNT_TIMING": {
      const draft = { ...state.draft, discountTiming: action.payload };
      return recompute({ ...state, draft });
    }
    case "SET_CURRENCY": {
      const draft = { ...state.draft, currency: action.payload };
      const preferences = {
        ...state.preferences,
        lastCurrency: action.payload,
      };
      return recompute({ ...state, draft, preferences });
    }
    case "SAVE_CUSTOMER": {
      const customer = action.payload.id
        ? action.payload
        : { ...action.payload, id: generateId("cust") };
      const existing = state.preferences.savedCustomers.filter(
        (c) => c.id !== customer.id
      );
      const preferences = {
        ...state.preferences,
        savedCustomers: [customer, ...existing],
      };
      return { ...state, preferences };
    }
    case "DELETE_CUSTOMER": {
      const preferences = {
        ...state.preferences,
        savedCustomers: state.preferences.savedCustomers.filter(
          (c) => c.id !== action.payload.id
        ),
      };
      return { ...state, preferences };
    }
    default:
      return state;
  }
}

function recompute(state: InvoiceState): InvoiceState {
  return { ...state, totals: computeTotals(state.draft) };
}

type InvoiceContextValue = InvoiceState & {
  dispatch: React.Dispatch<Action>;
  saveDraft: () => void;
  resetDraft: () => void;
  loadCustomer: (id: string) => void;
};

const InvoiceContext = createContext<InvoiceContextValue | undefined>(
  undefined
);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined as unknown as InvoiceState
  );

  // initialize
  useEffect(() => {
    const storedDraft = safeParse<Invoice>(
      localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY)
    );
    const storedPrefs = safeParse<{
      savedCustomers: CustomerInfo[];
      lastCurrency: Invoice["currency"];
    }>(localStorage.getItem(LOCAL_STORAGE_PREF_KEY));

    const initial: InvoiceState = {
      draft: storedDraft
        ? { ...defaultInvoice(), ...storedDraft }
        : defaultInvoice(),
      totals: { subtotal: 0, discountTotal: 0, taxTotal: 0, grandTotal: 0 },
      preferences: {
        savedCustomers: storedPrefs?.savedCustomers ?? [],
        lastCurrency: storedPrefs?.lastCurrency ?? "USD",
      },
      isLoading: false,
    };
    const computed = recompute(initial);
    dispatch({ type: "LOAD", payload: computed });
  }, []);

  // persist
  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(
        LOCAL_STORAGE_DRAFT_KEY,
        JSON.stringify(state.draft)
      );
      localStorage.setItem(
        LOCAL_STORAGE_PREF_KEY,
        JSON.stringify({
          savedCustomers: state.preferences.savedCustomers,
          lastCurrency: state.preferences.lastCurrency,
        })
      );
    } catch {}
  }, [state]);

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_DRAFT_KEY,
        JSON.stringify(state.draft)
      );
    } catch {}
  }, [state?.draft]);

  const resetDraft = useCallback(() => {
    const next: InvoiceState = {
      draft: defaultInvoice(),
      totals: { subtotal: 0, discountTotal: 0, taxTotal: 0, grandTotal: 0 },
      preferences: state.preferences,
      isLoading: false,
    };
    dispatch({ type: "LOAD", payload: recompute(next) });
  }, [state?.preferences]);

  const loadCustomer = useCallback(
    (id: string) => {
      const customer = state.preferences.savedCustomers.find(
        (c) => c.id === id
      );
      if (!customer) return;
      dispatch({ type: "SET_CUSTOMER", payload: customer });
    },
    [state?.preferences.savedCustomers]
  );

  const value = useMemo<InvoiceContextValue | undefined>(() => {
    if (!state) return undefined;
    return {
      ...state,
      dispatch,
      saveDraft,
      resetDraft,
      loadCustomer,
    };
  }, [state, saveDraft, resetDraft, loadCustomer]);

  if (!value) return null;
  return (
    <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error("useInvoice must be used within InvoiceProvider");
  return ctx;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
