"use client";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInvoice } from "@/context/InvoiceContext";
import { CurrencyCode, DiscountTiming, DiscountType } from "@/types/invoice";
import {
  Download,
  GripVertical,
  Mail,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

const currencyOptions: { label: string; value: CurrencyCode }[] = [
  { label: "USD $", value: "USD" },
  { label: "EUR €", value: "EUR" },
  { label: "GBP £", value: "GBP" },
  { label: "CAD $", value: "CAD" },
  { label: "AUD $", value: "AUD" },
  { label: "JPY ¥", value: "JPY" },
  { label: "NGN ₦", value: "NGN" },
  { label: "GHS ₵", value: "GHS" },
  { label: "ZAR R", value: "ZAR" },
];

const themeColors: { label: string; value: string }[] = [
  { label: "Slate", value: "#334155" },
  { label: "Gray", value: "#4b5563" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Green", value: "#22c55e" },
  { label: "Emerald", value: "#10b981" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Blue", value: "#2563eb" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Purple", value: "#9333ea" },
  { label: "Fuchsia", value: "#c026d3" },
  { label: "Pink", value: "#ec4899" },
  { label: "Rose", value: "#f43f5e" },
];

export function InvoiceForm() {
  const { draft, totals, dispatch, preferences, saveDraft, resetDraft } =
    useInvoice();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [numberInputBuffers, setNumberInputBuffers] = useState<
    Record<
      string,
      Partial<{
        unitPrice: string;
        taxRatePercent: string;
        discountValue: string;
      }>
    >
  >({});

  const setBuffer = (
    itemId: string,
    field: "unitPrice" | "taxRatePercent" | "discountValue",
    value: string
  ) => {
    setNumberInputBuffers((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const getBufferedValue = (
    itemId: string,
    fallbackNumber: number,
    field: "unitPrice" | "taxRatePercent" | "discountValue"
  ) => {
    const buffered = numberInputBuffers[itemId]?.[field];
    if (buffered !== undefined) return buffered;
    // Show empty string initially when stored value is 0
    return fallbackNumber === 0 ? "" : String(fallbackNumber);
  };

  const handlePrint = () => {
    const previousTitle = document.title;
    const business = draft.business.name?.trim() || "Invoice";
    const id = draft.id?.trim() || "Draft";
    const safe = `${business}_${id}`
      .replace(/\s+/g, " ")
      .replace(/[^a-zA-Z0-9._ -]/g, "")
      .slice(0, 120);
    const desiredTitle = safe || "Invoice";
    const restore: EventListener = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restore);
    };
    document.title = desiredTitle;
    window.addEventListener("afterprint", restore);
    window.print();
  };

  const onLogoChange = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({
        type: "SET_BUSINESS",
        payload: { logoDataUrl: reader.result as string },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="WeWire"
            className="h-5 w-auto"
            width={20}
            height={20}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={saveDraft} title="Save draft">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
          <Button variant="outline" onClick={resetDraft} title="Reset">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button onClick={handlePrint} title="Download / Print">
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          <a
            className="inline-flex"
            href={`mailto:?subject=Invoice%20${encodeURIComponent(
              draft.id
            )}&body=${encodeURIComponent(
              `Please find attached the invoice ${draft.id}.`
            )}`}
          >
            <Button type="button" variant="ghost" title="Email invoice">
              <Mail className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-6 p-4 md:p-6">
        {/* Business */}
        <section className="space-y-3">
          <h3 className="font-medium">Your business</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex items-center gap-3">
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
              <div className="flex gap-2 items-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onLogoChange(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload logo
                </Button>
                {draft.business.logoDataUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      dispatch({
                        type: "SET_BUSINESS",
                        payload: { logoDataUrl: null },
                      })
                    }
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="col-span-2">
              <Input
                placeholder="Business name"
                value={draft.business.name}
                onChange={(e) =>
                  dispatch({
                    type: "SET_BUSINESS",
                    payload: { name: e.target.value },
                  })
                }
              />
            </div>
            <Input
              placeholder="Address line 1"
              value={draft.business.addressLine1}
              onChange={(e) =>
                dispatch({
                  type: "SET_BUSINESS",
                  payload: { addressLine1: e.target.value },
                })
              }
            />
            <Input
              placeholder="Address line 2"
              value={draft.business.addressLine2}
              onChange={(e) =>
                dispatch({
                  type: "SET_BUSINESS",
                  payload: { addressLine2: e.target.value },
                })
              }
            />
            <Input
              placeholder="City"
              value={draft.business.city}
              onChange={(e) =>
                dispatch({
                  type: "SET_BUSINESS",
                  payload: { city: e.target.value },
                })
              }
            />
            <Input
              placeholder="State/Province"
              value={draft.business.state}
              onChange={(e) =>
                dispatch({
                  type: "SET_BUSINESS",
                  payload: { state: e.target.value },
                })
              }
            />
            <Input
              placeholder="Postal code"
              value={draft.business.postalCode}
              onChange={(e) =>
                dispatch({
                  type: "SET_BUSINESS",
                  payload: { postalCode: e.target.value },
                })
              }
            />
            <Input
              placeholder="Country"
              value={draft.business.country}
              onChange={(e) =>
                dispatch({
                  type: "SET_BUSINESS",
                  payload: { country: e.target.value },
                })
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={draft.business.email}
              onChange={(e) =>
                dispatch({
                  type: "SET_BUSINESS",
                  payload: { email: e.target.value },
                })
              }
            />
            <Input
              placeholder="Phone"
              value={draft.business.phone}
              onChange={(e) =>
                dispatch({
                  type: "SET_BUSINESS",
                  payload: { phone: e.target.value },
                })
              }
            />
          </div>
        </section>

        {/* Customer */}
        <section className="space-y-3">
          <h3 className="font-medium">Customer</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                placeholder="Customer name"
                value={draft.customer.displayName}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CUSTOMER",
                    payload: { displayName: e.target.value },
                  })
                }
              />
            </div>
            <Input
              placeholder="Address line 1"
              value={draft.customer.addressLine1}
              onChange={(e) =>
                dispatch({
                  type: "SET_CUSTOMER",
                  payload: { addressLine1: e.target.value },
                })
              }
            />
            <Input
              placeholder="Address line 2"
              value={draft.customer.addressLine2}
              onChange={(e) =>
                dispatch({
                  type: "SET_CUSTOMER",
                  payload: { addressLine2: e.target.value },
                })
              }
            />
            <Input
              placeholder="City"
              value={draft.customer.city}
              onChange={(e) =>
                dispatch({
                  type: "SET_CUSTOMER",
                  payload: { city: e.target.value },
                })
              }
            />
            <Input
              placeholder="State/Province"
              value={draft.customer.state}
              onChange={(e) =>
                dispatch({
                  type: "SET_CUSTOMER",
                  payload: { state: e.target.value },
                })
              }
            />
            <Input
              placeholder="Postal code"
              value={draft.customer.postalCode}
              onChange={(e) =>
                dispatch({
                  type: "SET_CUSTOMER",
                  payload: { postalCode: e.target.value },
                })
              }
            />
            <Input
              placeholder="Country"
              value={draft.customer.country}
              onChange={(e) =>
                dispatch({
                  type: "SET_CUSTOMER",
                  payload: { country: e.target.value },
                })
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={draft.customer.email}
              onChange={(e) =>
                dispatch({
                  type: "SET_CUSTOMER",
                  payload: { email: e.target.value },
                })
              }
            />
            <Input
              placeholder="Phone"
              value={draft.customer.phone}
              onChange={(e) =>
                dispatch({
                  type: "SET_CUSTOMER",
                  payload: { phone: e.target.value },
                })
              }
            />
            <div className="col-span-2">
              <Input
                placeholder="Customer reference/ID (optional)"
                value={draft.customer.reference ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CUSTOMER",
                    payload: { reference: e.target.value },
                  })
                }
              />
            </div>

            <div className="col-span-2 flex gap-2 items-center">
              <Button
                variant="outline"
                onClick={() =>
                  dispatch({
                    type: "SAVE_CUSTOMER",
                    payload: { ...draft.customer, id: draft.customer.id },
                  })
                }
              >
                Save customer
              </Button>
              {preferences.savedCustomers.length > 0 ? (
                <Select
                  options={[
                    { label: "Quick select…", value: "" },
                    ...preferences.savedCustomers.map((c) => ({
                      label: c.displayName,
                      value: c.id!,
                    })),
                  ]}
                  value=""
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id) {
                      const c = preferences.savedCustomers.find(
                        (x) => x.id === id
                      );
                      if (c) dispatch({ type: "SET_CUSTOMER", payload: c });
                    }
                  }}
                />
              ) : null}
            </div>
          </div>
        </section>

        {/* Invoice meta */}
        <section className="space-y-3">
          <h3 className="font-medium">Invoice details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1">
                Invoice number
              </label>
              <Input
                aria-label="Invoice number"
                placeholder="INV-000001"
                value={draft.id}
                onChange={(e) =>
                  dispatch({
                    type: "SET_INVOICE",
                    payload: { id: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1">
                Currency
              </label>
              <Select
                aria-label="Currency"
                options={currencyOptions}
                value={draft.currency}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CURRENCY",
                    payload: e.target.value as CurrencyCode,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1">
                Issue date
              </label>
              <DatePicker
                date={draft.issueDate ? new Date(draft.issueDate) : undefined}
                onChange={(date) =>
                  dispatch({
                    type: "SET_INVOICE",
                    payload: {
                      issueDate: date
                        ? date.toISOString().slice(0, 10)
                        : draft.issueDate,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1">
                Due date
              </label>
              <DatePicker
                date={draft.dueDate ? new Date(draft.dueDate) : undefined}
                onChange={(date) =>
                  dispatch({
                    type: "SET_INVOICE",
                    payload: {
                      dueDate: date
                        ? date.toISOString().slice(0, 10)
                        : draft.dueDate,
                    },
                  })
                }
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Payment terms
              </div>
              <Select
                aria-label="Payment terms"
                options={[
                  { label: "Net 15 (add 15 days)", value: "15" },
                  { label: "Net 30 (add 30 days)", value: "30" },
                  { label: "Net 45 (add 45 days)", value: "45" },
                  { label: "Net 60 (add 60 days)", value: "60" },
                  { label: "Custom (no change)", value: "0" },
                ]}
                value={""}
                onChange={(e) => {
                  const days = Number(e.target.value);
                  if (days > 0) {
                    const d = new Date(draft.issueDate);
                    d.setDate(d.getDate() + days);
                    const due = d.toISOString().slice(0, 10);
                    dispatch({
                      type: "SET_INVOICE",
                      payload: { dueDate: due },
                    });
                  }
                }}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Discount timing
              </div>
              <Select
                aria-label="Discount timing"
                options={[
                  { label: "Before tax", value: "before-tax" },
                  { label: "After tax", value: "after-tax" },
                ]}
                value={draft.discountTiming}
                onChange={(e) =>
                  dispatch({
                    type: "SET_DISCOUNT_TIMING",
                    payload: e.target.value as DiscountTiming,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1">
                Theme color
              </label>
              <div className="flex items-center gap-2 flex-wrap w-full">
                {themeColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={`Select ${c.label} theme`}
                    title={c.label}
                    className="h-[26px] w-[26px] rounded-full border"
                    style={{
                      backgroundColor: c.value,
                      outline:
                        draft.themeColor === c.value
                          ? `2px solid ${c.value}`
                          : undefined,
                    }}
                    onClick={() =>
                      dispatch({
                        type: "SET_INVOICE",
                        payload: { themeColor: c.value },
                      })
                    }
                  />
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      title="Custom"
                      aria-label="Open custom color picker"
                      className="w-full"
                    >
                      <Palette className="h-4 w-4 mr-2" /> Custom
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2">
                    <div className="space-y-2">
                      <ColorPicker
                        color={draft.themeColor}
                        onChange={(hex) =>
                          dispatch({
                            type: "SET_INVOICE",
                            payload: { themeColor: hex },
                          })
                        }
                      />
                      <div className="text-xs text-muted-foreground">
                        {draft.themeColor}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </section>

        {/* Items */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Line items</h3>
            <Button onClick={() => dispatch({ type: "ADD_ITEM" })}>
              <Plus className="h-4 w-4 mr-2" /> Add item
            </Button>
          </div>
          <div className="space-y-4">
            {draft.items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-start rounded-md border p-2"
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={() => {
                  if (dragIndex === null || dragIndex === index) return;
                  dispatch({
                    type: "REORDER_ITEMS",
                    payload: { from: dragIndex, to: index },
                  });
                  setDragIndex(null);
                }}
              >
                <div className="col-span-12 flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Textarea
                    aria-label="Description"
                    className="flex-1"
                    placeholder="Describe the product or service"
                    value={item.description}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ITEM",
                        payload: {
                          id: item.id,
                          updates: { description: e.target.value },
                        },
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      dispatch({
                        type: "REMOVE_ITEM",
                        payload: { id: item.id },
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="col-span-6">
                  <div className="text-xs text-muted-foreground mb-1">
                    Quantity
                  </div>
                  <Input
                    aria-label="Quantity"
                    placeholder="0"
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ITEM",
                        payload: {
                          id: item.id,
                          updates: { quantity: Number(e.target.value) },
                        },
                      })
                    }
                  />
                </div>
                <div className="col-span-6">
                  <div className="text-xs text-muted-foreground mb-1">
                    Unit price
                  </div>
                  <Input
                    aria-label="Unit price"
                    placeholder="0.00"
                    type="number"
                    min={0}
                    value={getBufferedValue(
                      item.id,
                      item.unitPrice,
                      "unitPrice"
                    )}
                    rightSlot={
                      <span className="text-xs">{draft.currency}</span>
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      setBuffer(item.id, "unitPrice", raw);
                      dispatch({
                        type: "UPDATE_ITEM",
                        payload: {
                          id: item.id,
                          updates: { unitPrice: Number(raw || 0) },
                        },
                      });
                    }}
                  />
                </div>
                <div className="col-span-4">
                  <div className="text-xs text-muted-foreground mb-1">Tax</div>
                  <Input
                    aria-label="Tax percent"
                    placeholder="0"
                    type="number"
                    min={0}
                    value={getBufferedValue(
                      item.id,
                      item.taxRatePercent,
                      "taxRatePercent"
                    )}
                    rightSlot={<span className="text-xs">%</span>}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setBuffer(item.id, "taxRatePercent", raw);
                      dispatch({
                        type: "UPDATE_ITEM",
                        payload: {
                          id: item.id,
                          updates: { taxRatePercent: Number(raw || 0) },
                        },
                      });
                    }}
                  />
                </div>
                <div className="col-span-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    Discount type
                  </div>
                  <Select
                    aria-label="Discount type"
                    options={[
                      { label: "Percent", value: "percent" },
                      { label: "Fixed", value: "fixed" },
                    ]}
                    value={item.discountType}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ITEM",
                        payload: {
                          id: item.id,
                          updates: {
                            discountType: e.target.value as DiscountType,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="col-span-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    Discount
                  </div>
                  <Input
                    aria-label="Discount value"
                    placeholder={item.discountType === "percent" ? "0" : "0.00"}
                    type="number"
                    min={0}
                    value={getBufferedValue(
                      item.id,
                      item.discountValue,
                      "discountValue"
                    )}
                    rightSlot={
                      <span className="text-xs">
                        {item.discountType === "percent" ? "%" : draft.currency}
                      </span>
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      setBuffer(item.id, "discountValue", raw);
                      dispatch({
                        type: "UPDATE_ITEM",
                        payload: {
                          id: item.id,
                          updates: { discountValue: Number(raw || 0) },
                        },
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-3">
          <h3 className="font-medium">Notes</h3>
          <Textarea
            aria-label="Notes"
            placeholder="Additional information for your customer (payment details, thanks, etc.)"
            value={draft.payment.notes}
            onChange={(e) =>
              dispatch({
                type: "SET_INVOICE",
                payload: {
                  payment: { ...draft.payment, notes: e.target.value },
                },
              })
            }
          />
        </section>

        {/* Totals quick view */}
        <section className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(draft.currency, totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discounts</span>
            <span>-{formatCurrency(draft.currency, totals.discountTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatCurrency(draft.currency, totals.taxTotal)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total due</span>
            <span>{formatCurrency(draft.currency, totals.grandTotal)}</span>
          </div>
        </section>
      </div>
    </div>
  );
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
