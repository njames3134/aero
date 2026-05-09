import * as React from "react";
import { cn } from "../../lib/utils";

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        `
        rounded-2xl
        border border-white/10
        bg-zinc-900
        text-zinc-100
        shadow-sm
        `,
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-4", className)}
      {...props}
    />
  );
}
