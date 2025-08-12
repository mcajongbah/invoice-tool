import { cn } from "@/lib/utils";
import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, leftSlot, rightSlot, value, defaultValue, ...props },
    ref
  ) => {
    return (
      <div className={cn("relative", leftSlot || rightSlot ? "" : "")}>
        {leftSlot ? (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
            {leftSlot}
          </div>
        ) : null}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
            leftSlot ? "pl-9" : "",
            rightSlot ? "pr-9" : "",
            className
          )}
          value={value === null ? undefined : value}
          defaultValue={defaultValue === null ? undefined : defaultValue}
          ref={ref}
          {...props}
        />
        {rightSlot ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground">
            {rightSlot}
          </div>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
