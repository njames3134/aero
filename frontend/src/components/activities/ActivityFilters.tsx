import type { Activity } from "../../types/activity";

export type ActivityTypeFilter =
  | "all"
  | "run"
  | "ride"
  | "swim";

export type SortOption =
  | "newest"
  | "oldest"
  | "distance"
  | "elevation"
  | "duration"
  | "power";

export interface ActivityFiltersState {
  type: ActivityTypeFilter;
  sort: SortOption;
}

interface Props {
  value: ActivityFiltersState;
  onChange: (v: ActivityFiltersState) => void;
  resultCount: number;
}

export function ActivityFilters({
  value,
  onChange,
  resultCount,
}: Props) {
  return (
    <div
      className="
        flex flex-wrap items-center justify-between gap-3
        rounded-2xl border border-[#222]
        bg-[#161616]
        px-4 py-3
      "
    >
      {/* Left Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Activity Type */}
        <select
          value={value.type}
          onChange={(e) =>
            onChange({
              ...value,
              type: e.target.value as ActivityTypeFilter,
            })
          }
          className="
            h-10 min-w-[180px]
            rounded-xl border border-[#2a2a2a]
            bg-[#111]
            px-3
            text-sm text-zinc-300
            outline-none
            transition
            hover:border-[#3a3a3a]
            focus:border-orange-500/40
          "
        >
          <option value="all">All Activities</option>
          <option value="run">Runs</option>
          <option value="ride">Rides</option>
          <option value="swim">Swims</option>
        </select>

        {/* Sort */}
        <select
          value={value.sort}
          onChange={(e) =>
            onChange({
              ...value,
              sort: e.target.value as SortOption,
            })
          }
          className="
            h-10 min-w-[210px]
            rounded-xl border border-[#2a2a2a]
            bg-[#111]
            px-3
            text-sm text-zinc-300
            outline-none
            transition
            hover:border-[#3a3a3a]
            focus:border-orange-500/40
          "
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="distance">Longest Distance</option>
          <option value="elevation">Most Elevation</option>
          <option value="duration">Longest Duration</option>
          <option value="power">Highest Power</option>
        </select>
      </div>

      {/* Right Metadata */}
      <div
        className="
          text-sm text-zinc-500
          whitespace-nowrap
        "
      >
        {resultCount} activities
      </div>
    </div>
  );
}
