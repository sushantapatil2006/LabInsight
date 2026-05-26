"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-teal-500 text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/30 active:scale-[0.98]",
        outline:
          "border-2 border-deep-blue/20 text-deep-blue bg-white hover:bg-deep-blue hover:text-white hover:border-deep-blue active:scale-[0.98]",
        ghost:
          "text-deep-blue hover:bg-deep-blue/5 active:bg-deep-blue/10",
        destructive:
          "bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600 hover:shadow-lg active:scale-[0.98]",
        secondary:
          "bg-slate-100 text-deep-blue hover:bg-slate-200 active:scale-[0.98]",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-lg",
        default: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base rounded-2xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
