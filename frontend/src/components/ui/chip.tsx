import { cn } from "../../lib/utils";

interface ChipProps {
  children: React.ReactNode;
  className?: string;
}

export function Chip({
  children,
  className,
}: ChipProps) {
  return (
    <div
      className={cn(
        `
        px-2 py-1
        rounded-full
        text-xs
        bg-white/5
        text-zinc-300
        border border-white/10
        `,
        className
      )}
    >
      {children}
    </div>
  );
}
