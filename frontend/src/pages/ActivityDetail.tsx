import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getActivity, getActivityStreams } from "../lib/api";
import StreamsChart from "../components/StreamChart.tsx"

export default function ActivityDetail() {
  const { id } = useParams();

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
    return <div className="p-6">Loading activity...</div>;
  }

  if (activityQuery.isError || !activityQuery.data) {
    return <div className="p-6 text-red-500">Failed to load activity</div>;
  }

  const activity = activityQuery.data;
  const streams = streamsQuery.data;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{activity.name}</h1>
        <div className="text-gray-500">
          {activity.type} • {new Date(activity.start_date).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Distance" value={`${(activity.distance / 1609).toFixed(2)} mi`} />
        <Stat label="Time" value={`${activity.moving_time}s`} />
        <Stat label="Avg Speed" value={`${activity.average_speed ?? 0}`} />
      </div>

      {streamsQuery.isLoading ? (
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
      ) : streams ? (
        <StreamsChart streams={streams} />
      ) : (
        <div>No stream data</div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
