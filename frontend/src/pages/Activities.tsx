import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import type { Activity } from "../types/activity";
import ActivityCard from "../components/activities/ActivityCard";
import { getActivities, syncActivities } from "../lib/api";

export default function ActivitiesPage() {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  const syncMutation = useMutation({
    mutationFn: syncActivities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err) => {
      console.error("Sync failed:", err);
    },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sync activities"
        >
          <RefreshCw
            size={16}
            className={syncMutation.isPending ? "animate-spin" : ""}
          />
          <span className="text-sm font-medium">
            {syncMutation.isPending ? "Syncing..." : "Sync"}
          </span>
        </button>
      </div>

      {activitiesLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No activities yet. Hit Sync to pull from Strava.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {activities.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      )}
    </div>
  );
}
