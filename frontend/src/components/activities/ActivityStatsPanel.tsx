import { formatDuration } from "../../lib/formatters";

interface Props {
  activity: any;
}

interface StatRow {
  label: string;
  value: string;
}

interface StatGroup {
  title: string;
  rows: StatRow[];
}

export function ActivityStatsPanel({ activity }: Props) {
  const groups: StatGroup[] = [];

  if (activity.average_heartrate || activity.max_heartrate) {
    groups.push({
      title: "Heart rate",
      rows: [
        activity.average_heartrate && {
          label: "Average",
          value: `${Math.round(activity.average_heartrate)} bpm`,
        },
        activity.max_heartrate && {
          label: "Max",
          value: `${Math.round(activity.max_heartrate)} bpm`,
        },
      ].filter(Boolean) as StatRow[],
    });
  }

  if (activity.average_watts || activity.weighted_average_watts || activity.max_watts) {
    groups.push({
      title: "Power",
      rows: [
        activity.average_watts && {
          label: "Average",
          value: `${Math.round(activity.average_watts)} W`,
        },
        activity.weighted_average_watts && {
          label: "Weighted avg",
          value: `${Math.round(activity.weighted_average_watts)} W`,
        },
        activity.max_watts && {
          label: "Max",
          value: `${Math.round(activity.max_watts)} W`,
        },
      ].filter(Boolean) as StatRow[],
    });
  }

  const timingRows: StatRow[] = [
    { label: "Moving time", value: formatDuration(activity.moving_time ?? 0) },
    { label: "Elapsed time", value: formatDuration(activity.elapsed_time ?? 0) },
  ];
  if (activity.average_cadence) {
    const unit = activity.activity_type === "Run" ? "spm" : "rpm";
    timingRows.push({
      label: "Avg cadence",
      value: `${Math.round(activity.average_cadence)} ${unit}`,
    });
  }
  groups.push({ title: "Timing", rows: timingRows });

  return (
    <div className="flex flex-col gap-3 h-full">
      {groups.map((group) => (
        <div
          key={group.title}
          className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4 flex-1"
        >
          <div className="text-[11px] font-semibold tracking-widest uppercase text-zinc-600 mb-4">
            {group.title}
          </div>
          <div>
            {group.rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between items-center py-2.5 ${
                  i < group.rows.length - 1 ? "border-b border-[#1e1e1e]" : ""
                }`}
              >
                <span className="text-sm text-zinc-500">{row.label}</span>
                <span className="text-sm font-semibold text-zinc-200">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
