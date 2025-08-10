export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "JPY"
  | "NGN"
  | "GHS"
  | "ZAR";

export type DiscountType = "percent" | "fixed";

export interface BusinessInfo {
  name: string;
  logoDataUrl?: string | null;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
}

export interface CustomerInfo {
  id?: string; // local storage id
  displayName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
  reference?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number; // e.g. 7.5 means 7.5%
  discountType: DiscountType;
  discountValue: number; // percent or fixed in currency based on discountType
}

export type DiscountTiming = "before-tax" | "after-tax";

export interface PaymentInfo {
  terms: string; // e.g., Net 30
  methods: string; // e.g., Bank transfer, Card, Cash
  bankDetails: string; // optional free text
  notes: string;
  termsAndConditions: string;
}

export interface Invoice {
  id: string; // invoice number
  createdAt: string; // ISO date
  issueDate: string; // ISO date
  dueDate: string; // ISO date
  currency: CurrencyCode;
  themeColor: string;
  business: BusinessInfo;
  customer: CustomerInfo;
  items: LineItem[];
  discountTiming: DiscountTiming;
  payment: PaymentInfo;
}

export interface CalculatedTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export interface Preferences {
  savedCustomers: CustomerInfo[];
  lastCurrency: CurrencyCode;
}

export type InvoiceState = {
  draft: Invoice;
  totals: CalculatedTotals;
  preferences: Preferences;
  isLoading: boolean;
};
