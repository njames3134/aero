import { useNavigate } from "react-router-dom";
import type { Activity } from "../../types/activity";
import { metersToMiles } from "../../lib/units";
import {
  formatDuration,
  formatMph,
} from "../../lib/formatters";
import { MiniMap } from "../MiniMap";
import { ActivityBadge } from "./ActivityBadge";
import { ActivityStat } from "./ActivityStat";
import { Card, CardContent } from "../ui/card";
import { Chip } from "../ui/chip";

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({
  activity,
}: ActivityCardProps) {
  const navigate = useNavigate();

  const date = new Date(
    activity.start_date
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card
      onClick={() =>
        navigate(`/activities/${activity.id}`)
      }
      className="
        group
        overflow-hidden
        cursor-pointer
        transition
        hover:border-white/20
        hover:shadow-lg
        hover:shadow-black/40
      "
    >

      <div className="relative h-44 bg-zinc-950">
        {/* MAP */}
        <div className="absolute inset-0 z-0">
          {activity.summary_polyline ? (
            <MiniMap
              encoded={activity.summary_polyline}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl text-zinc-500">
              {activity.activity_type === "Run" && "🏃"}
              {activity.activity_type === "Ride" && "🚴"}
              {activity.activity_type === "Walk" && "🚶"}
            </div>
          )}
        </div>

        {/* overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-zinc-900/50 to-transparent" />

        {/* badge */}
        <div className="absolute top-3 right-3 z-20">
          <ActivityBadge type={activity.activity_type} />
        </div>
      </div>

      {/* BODY */}
      <CardContent className="space-y-4 p-4">
        {/* date */}
        <div className="text-xs text-zinc-500">
          {date}
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-3">
          <ActivityStat
            label="DIST"
            value={`${metersToMiles(
              activity.distance
            ).toFixed(1)} mi`}
          />

          <ActivityStat
            label="TIME"
            value={formatDuration(
              activity.moving_time
            )}
          />

          <ActivityStat
            label="ELEV"
            value={`${Math.round(
              activity.total_elevation_gain
            )} m`}
          />
        </div>

        {/* chips */}
        <div className="flex flex-wrap gap-2">
          {activity.average_heartrate && (
            <Chip>
              {Math.round(
                activity.average_heartrate
              )}{" "}
              bpm
            </Chip>
          )}

          {activity.average_watts && (
            <Chip>
              {Math.round(activity.average_watts)} W
            </Chip>
          )}

          {activity.average_speed && (
            <Chip>
              {formatMph(
                activity.average_speed
              )}
            </Chip>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
