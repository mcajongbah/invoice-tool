import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
        destructive: "bg-destructive text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-sm",
        icon: "h-10 w-10",
      },
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "sm", ...props }, ref) => {
    const variantClass =
      variant === "default"
        ? "bg-primary text-primary-foreground hover:opacity-90"
        : variant === "outline"
        ? "border border-input bg-background hover:bg-accent"
        : variant === "ghost"
        ? "hover:bg-accent"
        : variant === "secondary"
        ? "bg-secondary text-secondary-foreground hover:opacity-90"
        : "bg-destructive text-white hover:opacity-90";

    const sizeClass =
      size === "sm"
        ? "h-8 px-3 text-xs"
        : size === "lg"
        ? "h-11 px-5 text-sm"
        : size === "icon"
        ? "h-10 w-10"
        : "h-10 px-4";

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center cursor-pointer whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClass,
          sizeClass,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
