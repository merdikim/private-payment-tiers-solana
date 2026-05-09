import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 active:scale-95 shadow-sm hover:shadow-md",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:scale-95 shadow-sm hover:shadow-md",
        outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-blue-500 active:scale-95",
        secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-blue-500 active:scale-95",
        ghost: "text-slate-900 hover:bg-slate-100 focus-visible:ring-blue-500",
        link: "h-auto p-0 text-blue-600 underline-offset-4 hover:underline focus-visible:ring-offset-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 py-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
