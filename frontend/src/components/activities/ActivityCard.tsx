import { useNavigate } from "react-router-dom";
import type { Activity } from "../../types/activity";
import { metersToMiles } from "../../lib/units";
import { formatDuration, formatPace, formatSwimPace } from "../../lib/formatters";
import { MiniMap } from "../MiniMap";
import { ActivityBadge } from "./ActivityBadge";
import { ActivityStat } from "./ActivityStat";
import { Card, CardContent } from "../ui/card";
import { Chip } from "../ui/chip";

interface ActivityCardProps {
  activity: Activity;
}

function NoMapPlaceholder({ type }: { type: string }) {
  const palette: Record<string, string> = {
    Ride: "from-orange-500/10 via-orange-500/5 to-zinc-950",
    Run: "from-green-500/10 via-green-500/5 to-zinc-950",
    Swim: "from-cyan-500/10 via-cyan-500/5 to-zinc-950",
  };

  return (
    <div className={`h-full w-full bg-gradient-to-br ${palette[type] ?? "from-zinc-900 to-zinc-950"} flex items-center justify-center`}>
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,_white_1px,_transparent_1px)] [background-size:18px_18px]" />
      <div className="z-10 text-[15px] tracking-widest uppercase text-zinc-500">
        Indoor
      </div>
    </div>
  );
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const navigate = useNavigate();

  const date = new Date(activity.start_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const speedChip = () => {
    if (activity.activity_type === "Run" && activity.average_speed) {
      const mph = activity.average_speed * 2.23694;
      return formatPace(mph);
    }
    if (activity.activity_type === "Swim" && activity.average_speed) {
      return formatSwimPace(activity.average_speed);
    }
    return null;
  };

  const hasMap = Boolean(activity.summary_polyline);

  return (
    <Card
      onClick={() => navigate(`/activities/${activity.id}`)}
      className="
        group overflow-hidden cursor-pointer transition
        bg-[#141414] border-[#1e1e1e]
        hover:border-[#2e2e2e] hover:shadow-lg hover:shadow-black/40
      "
    >
      <div className="relative h-44 bg-[#0d1117] isolate">
        <div className="absolute inset-0 z-0">
          {hasMap ? (
            <MiniMap
              encoded={activity.summary_polyline}
              className="h-full w-full"
            />
          ) : (
            <NoMapPlaceholder type={activity.activity_type} />
          )}
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#141414]/90 to-transparent" />

        <div className="absolute top-2.5 right-2.5 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <ActivityBadge type={activity.activity_type} />
          </div>
        </div>
      </div>

      <CardContent className="space-y-3 p-3.5">
        <div className="text-[11px] text-zinc-600">{date}</div>

        <div className="grid grid-cols-3 gap-2">
          <ActivityStat
            label="Dist"
            value={`${metersToMiles(activity.distance).toFixed(1)} mi`}
          />
          <ActivityStat
            label="Time"
            value={formatDuration(activity.moving_time)}
          />
          <ActivityStat
            label="Elev"
            value={`${Math.round(activity.total_elevation_gain)} m`}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activity.average_heartrate && (
            <Chip>{Math.round(activity.average_heartrate)} bpm</Chip>
          )}
          {activity.average_watts && (
            <Chip>{Math.round(activity.average_watts)} W</Chip>
          )}
          {speedChip() && <Chip>{speedChip()}</Chip>}
        </div>
      </CardContent>
    </Card>
  );
}
