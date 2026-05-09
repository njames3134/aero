import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/utils";

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;

  variant?: "default" | "secondary" | "outline";
}

export function Badge({
  children,
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        `
        inline-flex
        items-center
        gap-1

        rounded-md
        border

        px-2
        py-0.5

        text-xs
        font-medium

        transition-colors
        `,
        variant === "default" &&
          `
          border-white/10
          bg-white/10
          text-zinc-100
          `,

        variant === "secondary" &&
          `
          border-transparent
          bg-zinc-800
          text-zinc-300
          `,

        variant === "outline" &&
          `
          border-white/10
          bg-transparent
          text-zinc-400
          `,

        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
