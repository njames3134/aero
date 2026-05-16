import {
  NavLink as RouterNavLink,
} from "react-router-dom";

import { cn } from "../../lib/utils";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function NavLink({
  to,
  children,
  className,
}: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        cn(
          `
          inline-flex
          items-center
          gap-2
          rounded-lg
          px-4
          py-2
          text-sm
          font-medium
          transition-all
          `,
          isActive
            ? `
              bg-gradient-to-br
              from-orange-500/20
              via-orange-500/10
              to-background
              border
              border-orange-500/30
              text-orange-600
              shadow-lg
              dark:text-orange-400
            `
            : `
              text-muted-foreground
              hover:bg-secondary
              hover:text-foreground
            `,
          className
        )
      }
    >
      {children}
    </RouterNavLink>
  );
}
