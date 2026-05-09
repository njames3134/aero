import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

export type ActivityType =
  | "Ride"
  | "VirtualRide"
  | "Run"
  | "Walk"
  | "Hike"
  | "Swim"
  | string;

const typeStyles: Record<string, string> = {
  Ride:
    "bg-orange-500/15 text-orange-300 border-orange-500/20",

  VirtualRide:
    "bg-purple-500/15 text-purple-300 border-purple-500/20",

  Run:
    "bg-green-500/15 text-green-300 border-green-500/20",

  Walk:
    "bg-blue-500/15 text-blue-300 border-blue-500/20",

  Hike:
    "bg-amber-500/15 text-amber-300 border-amber-500/20",

  Swim:
    "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
};

const typeIcons: Record<string, string> = {
  Ride: "🚴",
  VirtualRide: "🖥️",
  Run: "🏃",
  Walk: "🚶",
  Hike: "🥾",
  Swim: "🏊",
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
        `
        inline-flex
        items-center
        gap-1
        rounded-md
        border
        px-2
        py-1
        text-xs
        font-medium
        backdrop-blur-sm
        `,
        typeStyles[type],
        className
      )}
    >
      {showIcon && (
        <span className="text-[10px]">
          {typeIcons[type] ?? "🏃"}
        </span>
      )}

      <span>{type}</span>
    </Badge>
  );
}
