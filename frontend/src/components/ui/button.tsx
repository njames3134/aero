import * as React from "react";

import { cn } from "../../lib/utils";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost";
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
  (
    {
      className,
      variant = "default",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          `
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-lg
          px-4
          py-2
          text-sm
          font-medium
          transition-all
          disabled:pointer-events-none
          disabled:opacity-50
          `,
          variant === "default" &&
            `
            bg-gradient-to-br
            from-orange-500/20
            via-orange-500/10
            to-background
            border
            border-orange-500/30
            text-orange-600
            shadow-sm
            hover:bg-orange-500/20
            dark:text-orange-400
            `,

          variant === "secondary" &&
            `
            bg-secondary
            text-foreground
            hover:bg-secondary/80
            `,

          variant === "ghost" &&
            `
            text-muted-foreground
            hover:bg-secondary
            hover:text-foreground
            `,

          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
