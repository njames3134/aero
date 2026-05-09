import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../lib/api.ts";
import WeeklyMileageChart from "../components/WeeklyMileageChart";
import type { Activity } from "../types/activity.ts";

export default function Dashboard() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {isLoading ? (
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
      ) : (
        <WeeklyMileageChart activities={activities} />
      )}
    </div>
  );
}
