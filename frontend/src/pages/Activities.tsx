import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import type { Activity } from "../types/activity";

import ActivityCard from "../components/activities/ActivityCard";

import {
  ActivityFilters,
  type ActivityFiltersState,
} from "../components/activities/ActivityFilters";

import { getActivities, syncActivities } from "../lib/api";

import { Button } from "../components/ui/button";

const SUPPORTED_ACTIVITIES = ["Run", "Ride", "Swim"];

const PAGE_SIZE = 24;

const initialFilters: ActivityFiltersState = {
  type: "all",
  sort: "newest",
};

export default function ActivitiesPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  const [filters, setFilters] =
    useState<ActivityFiltersState>(initialFilters);

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: getActivities,
    staleTime: 1000 * 60 * 5,
  });

  const syncMutation = useMutation({
    mutationFn: syncActivities,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
    },
  });

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const filtered = useMemo(() => {
    let res = [...activities];

    // Supported activity types only
    res = res.filter((a) =>
      SUPPORTED_ACTIVITIES.includes(a.activity_type)
    );

    // Activity type filter
    if (filters.type !== "all") {
      res = res.filter(
        (a) =>
          a.activity_type.toLowerCase() === filters.type
      );
    }

    // Sorting
    res.sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return (
            new Date(b.start_date).getTime() -
            new Date(a.start_date).getTime()
          );

        case "oldest":
          return (
            new Date(a.start_date).getTime() -
            new Date(b.start_date).getTime()
          );

        case "distance":
          return b.distance - a.distance;

        case "elevation":
          return (
            b.total_elevation_gain -
            a.total_elevation_gain
          );

        case "duration":
          return b.moving_time - a.moving_time;

        case "power":
          return (
            (b.average_watts ?? 0) -
            (a.average_watts ?? 0)
          );

        default:
          return 0;
      }
    });

    return res;
  }, [activities, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const safePage = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Activities
          </h1>
        </div>

        <Button
          variant="secondary"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="
            border border-[#2a2a2a]
            bg-[#1a1a1a]
            hover:bg-[#222]
          "
        >
          <RefreshCw
            size={16}
            className={
              syncMutation.isPending
                ? "animate-spin"
                : ""
            }
          />
        </Button>
      </div>

      {/* Filters */}
      <ActivityFilters
        value={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {/* Activities Grid */}
      <div
        className="
          grid grid-cols-1 gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {paginated.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
          />
        ))}
      </div>

      {/* Empty State */}
      {paginated.length === 0 && (
        <div
          className="
            flex flex-col items-center justify-center
            rounded-2xl border border-[#222]
            bg-[#161616]
            py-16 text-center
          "
        >
          <div className="text-lg font-medium text-zinc-300">
            No activities found
          </div>

          <div className="mt-1 text-sm text-zinc-500">
            Try changing your filters
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            disabled={safePage === 1}
            onClick={() =>
              setPage((p) => Math.max(1, p - 1))
            }
            className="
              border border-[#2a2a2a]
              bg-[#1a1a1a]
              hover:bg-[#222]
            "
          >
            Prev
          </Button>

          <div className="min-w-[70px] text-center text-sm text-zinc-500">
            {safePage} / {totalPages}
          </div>

          <Button
            variant="secondary"
            disabled={safePage === totalPages}
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            className="
              border border-[#2a2a2a]
              bg-[#1a1a1a]
              hover:bg-[#222]
            "
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
