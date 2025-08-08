"use client";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DatePickerProps = {
  date?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function DatePicker({
  date,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const label = useMemo(
    () => (date ? date.toLocaleDateString() : placeholder),
    [date, placeholder]
  );

  const handleOutside = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    if (e.target instanceof Node && !containerRef.current.contains(e.target)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("mousedown", handleOutside);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, handleOutside]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
      >
        <span className={cn(!date && "text-muted-foreground")}>{label}</span>
        <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
      </button>
      {open ? (
        <div
          className="absolute z-50 mt-2 w-auto rounded-md border bg-popover p-2 shadow-md"
          role="dialog"
          aria-modal="true"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              onChange?.(d ?? undefined);
              setOpen(false);
            }}
            className="bg-transparent"
            buttonVariant="ghost"
            captionLayout="dropdown"
          />
        </div>
      ) : null}
    </div>
  );
}
