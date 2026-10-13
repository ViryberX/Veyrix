import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/15 text-destructive dark:bg-destructive/30",
        outline: "text-foreground border-border",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/15",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/15",
        info:
          "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
