"use client";

import { useInvoice } from "@/context/InvoiceContext";
import { CurrencyCode } from "@/types/invoice";
import Image from "next/image";
import { useMemo, useState } from "react";

export function InvoicePreview() {
  const { draft, totals } = useInvoice();
  const [zoom, setZoom] = useState<number>(1);

  const addressBusiness = useMemo(
    () =>
      [
        draft.business.addressLine1,
        draft.business.addressLine2,
        [draft.business.city, draft.business.state, draft.business.postalCode]
          .filter(Boolean)
          .join(", "),
        draft.business.country,
      ]
        .filter(Boolean)
        .join("\n"),
    [draft.business]
  );

  const addressCustomer = useMemo(
    () =>
      [
        draft.customer.addressLine1,
        draft.customer.addressLine2,
        [draft.customer.city, draft.customer.state, draft.customer.postalCode]
          .filter(Boolean)
          .join(", "),
        draft.customer.country,
      ]
        .filter(Boolean)
        .join("\n"),
    [draft.customer]
  );

  return (
    <div className="p-6 md:p-8 print:p-0">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="text-sm text-muted-foreground">Live preview</div>
        <div className="flex items-center gap-2">
          <button
            className="h-8 w-8 rounded border"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          >
            -
          </button>
          <div className="text-sm w-12 text-center">
            {Math.round(zoom * 100)}%
          </div>
          <button
            className="h-8 w-8 rounded border"
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          >
            +
          </button>
        </div>
      </div>
      <div
        id="invoice"
        className="bg-white shadow print:shadow-none max-w-3xl mx-auto border rounded-md overflow-hidden print:border-0 origin-top"
        style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
      >
        <div
          className="p-6 border-b flex items-start justify-between gap-4"
          style={{ borderColor: draft.themeColor }}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 border rounded-md bg-muted/30 flex items-center justify-center overflow-hidden">
              {draft.business.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.business.logoDataUrl}
                  alt="logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs text-muted-foreground">Logo</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                {draft.business.name || "Your business"}
              </h1>
              <p className="text-xs whitespace-pre-wrap text-muted-foreground">
                {addressBusiness}
              </p>
              <p className="text-xs text-muted-foreground">
                {[draft.business.email, draft.business.phone]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-bold"
              style={{ color: draft.themeColor }}
            >
              Invoice
            </div>
            <div className="text-sm text-muted-foreground">#{draft.id}</div>
            <div className="mt-2 text-xs">
              <div>Issue: {formatDate(draft.issueDate)}</div>
              <div>Due: {formatDate(draft.dueDate)}</div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Bill to</div>
            <div className="font-medium">
              {draft.customer.displayName || "Customer"}
            </div>
            <div className="text-xs whitespace-pre-wrap text-muted-foreground">
              {addressCustomer}
            </div>
            <div className="text-xs text-muted-foreground">
              {[draft.customer.email, draft.customer.phone]
                .filter(Boolean)
                .join(" • ")}
            </div>
            {draft.customer.reference ? (
              <div className="text-xs text-muted-foreground">
                Ref: {draft.customer.reference}
              </div>
            ) : null}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Currency</div>
            <div className="font-medium">{draft.currency}</div>
          </div>
        </div>

        <div className="px-6">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-y bg-muted/30"
                style={{ borderColor: draft.themeColor }}
              >
                <th
                  className="text-left p-2 font-medium"
                  style={{ color: draft.themeColor }}
                >
                  Description
                </th>
                <th
                  className="text-right p-2 font-medium"
                  style={{ color: draft.themeColor }}
                >
                  Qty
                </th>
                <th
                  className="text-right p-2 font-medium"
                  style={{ color: draft.themeColor }}
                >
                  Rate
                </th>
                <th
                  className="text-right p-2 font-medium"
                  style={{ color: draft.themeColor }}
                >
                  Tax %
                </th>
                <th
                  className="text-right p-2 font-medium"
                  style={{ color: draft.themeColor }}
                >
                  Discount
                </th>
                <th
                  className="text-right p-2 font-medium"
                  style={{ color: draft.themeColor }}
                >
                  Line total
                </th>
              </tr>
            </thead>
            <tbody>
              {draft.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2 align-top whitespace-pre-wrap text-left max-w-[320px]">
                    {item.description || "—"}
                  </td>
                  <td className="p-2 text-right">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(draft.currency, item.unitPrice)}
                  </td>
                  <td className="p-2 text-right">
                    {formatNumber(item.taxRatePercent)}%
                  </td>
                  <td className="p-2 text-right">
                    {item.discountType === "percent"
                      ? `${formatNumber(item.discountValue)}%`
                      : formatCurrency(draft.currency, item.discountValue)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(
                      draft.currency,
                      computeLineTotal(
                        item.quantity,
                        item.unitPrice,
                        item.taxRatePercent,
                        item.discountType,
                        item.discountValue,
                        draft.discountTiming
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-start-2 ml-auto w-full max-w-sm">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(draft.currency, totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discounts</span>
                <span>
                  -{formatCurrency(draft.currency, totals.discountTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(draft.currency, totals.taxTotal)}</span>
              </div>
              <div
                className="border-t pt-2 flex justify-between font-semibold text-base"
                style={{ borderColor: draft.themeColor }}
              >
                <span style={{ color: draft.themeColor }}>Total due</span>
                <span style={{ color: draft.themeColor }}>
                  {formatCurrency(draft.currency, totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {draft.payment.notes ? (
          <div className="px-6 pb-6">
            <div className="mt-2 text-sm">
              <div className="font-medium">Notes</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {draft.payment.notes}
              </div>
            </div>
          </div>
        ) : null}

        <p className="p-6 flex items-center justify-center border-t text-center text-sm text-muted-foreground">
          Generated by{" "}
          <Image
            src="/logo.svg"
            alt="WeWire"
            width={100}
            height={100}
            className="ml-2"
          />
        </p>
      </div>
    </div>
  );
}

function computeLineTotal(
  qty: number,
  price: number,
  taxPercent: number,
  discountType: "percent" | "fixed",
  discountValue: number,
  timing: "before-tax" | "after-tax"
) {
  const line = qty * price;
  const discount =
    discountType === "percent" ? (line * discountValue) / 100 : discountValue;
  const base = timing === "before-tax" ? Math.max(line - discount, 0) : line;
  const tax = (base * taxPercent) / 100;
  return timing === "after-tax"
    ? Math.max(line + tax - discount, 0)
    : Math.max(base + tax, 0);
}

function formatCurrency(code: CurrencyCode, value: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return String(n);
  }
}
