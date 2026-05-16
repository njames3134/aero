import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Bike, Footprints, Waves } from "lucide-react";

export type ActivityType = "Ride" | "Run" | "Swim" | string;

const typeStyles: Record<string, string> = {
  Ride: "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Run: "bg-green-500/15 text-green-300 border-green-500/20",
  Swim: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
};

const typeIcons: Record<string, React.ReactNode> = {
  Ride: <Bike className="w-3 h-3" />,
  Run: <Footprints className="w-3 h-3" />,
  Swim: <Waves className="w-3 h-3" />,
};

interface ActivityBadgeProps {
  type: ActivityType;
  showIcon?: boolean;
  className?: string;
}

export function ActivityBadge({
  type,
  showIcon = true,
  className,
}: ActivityBadgeProps) {
  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium backdrop-blur-sm",
        typeStyles[type],
        className
      )}
    >
      {showIcon && (
        <span className="flex items-center justify-center">
          {typeIcons[type] ?? <Footprints className="w-3 h-3" />}
        </span>
      )}
      <span>{type}</span>
    </Badge>
  );
}
