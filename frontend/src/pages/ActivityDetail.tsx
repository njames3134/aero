import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getActivity, getActivityStreams } from "../lib/api";
import { ActivityDetailHero } from "../components/activities/ActivityDetailHero";
import { ActivityDetailMap } from "../components/activities/ActivityDetailMap";
import { ActivityStatsPanel } from "../components/activities/ActivityStatsPanel";
import { ActivityStreamsChart } from "../components/activities/ActivityStreamsChart";
import { ActivityLapsTable } from "../components/activities/ActivityLapsTable";

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const activityQuery = useQuery({
    queryKey: ["activity", id],
    queryFn: () => getActivity(Number(id)),
    enabled: !!id,
  });

  const streamsQuery = useQuery({
    queryKey: ["streams", id],
    queryFn: () => getActivityStreams(Number(id)),
    enabled: !!id,
  });

  if (activityQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-zinc-900 animate-pulse" />
        <div className="h-24 rounded-xl bg-zinc-900 animate-pulse" />
        <div className="grid grid-cols-[1fr_320px] gap-4">
          <div className="h-80 rounded-xl bg-zinc-900 animate-pulse" />
          <div className="h-80 rounded-xl bg-zinc-900 animate-pulse" />
        </div>
      </div>
    );
  }

  if (activityQuery.isError || !activityQuery.data) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-600">
        Failed to load activity
      </div>
    );
  }

  const activity = activityQuery.data;
  const streams = streamsQuery.data;

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate("/activities")}
        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Activities
      </button>

      {/* Hero stats row */}
      <ActivityDetailHero activity={activity} />

      {/* Map + Stats side by side */}
      <div className="grid grid-cols-[1fr_300px] gap-4 items-stretch">
        <ActivityDetailMap polyline={activity.summary_polyline} />
        <ActivityStatsPanel activity={activity} />
      </div>

      {/* Chart — only if streams exist */}
      {streams && <ActivityStreamsChart streams={streams} activityType={activity.activity_type} />}

      {/* Laps — only if laps exist */}
      {activity.laps && activity.laps.length > 0 && (
        <ActivityLapsTable laps={activity.laps} activityType={activity.activity_type} />
      )}
    </div>
  );
}
