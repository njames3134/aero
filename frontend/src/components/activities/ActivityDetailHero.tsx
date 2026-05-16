import { formatDuration, formatPace, formatSwimPace } from "../../lib/formatters";
import { metersToMiles } from "../../lib/units";

interface Props {
  activity: any;
}

const typeConfig: Record<string, { accent: string; label: string; badgeClass: string }> = {
  Run: { accent: "#22c55e", label: "Run", badgeClass: "bg-green-500/10 text-green-500 border-green-500/20" },
  Ride: { accent: "#fb641b", label: "Ride", badgeClass: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  Swim: { accent: "#38bdf8", label: "Swim", badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
};

function formatSpeed(activity: any): { value: string; unit: string } {
  const type = activity.activity_type;
  const speed = activity.average_speed; // m/s from Strava

  if (type === "Run" && speed) {
    const mph = speed * 2.23694;
    const minPerMile = 60 / mph;
    const mins = Math.floor(minPerMile);
    const secs = Math.round((minPerMile - mins) * 60);
    return { value: `${mins}:${secs.toString().padStart(2, "0")}`, unit: "/mi pace" };
  }
  if (type === "Swim" && speed) {
    const secsPer100yd = (91.44 / speed) / 100 * 100;
    // Actually: 100yd = 91.44m, so time for 100yd = 91.44/speed seconds
    const s = 91.44 / speed;
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return { value: `${mins}:${secs.toString().padStart(2, "0")}`, unit: "/100yd" };
  }
  if (type === "Ride" && speed) {
    const mph = (speed * 2.23694).toFixed(1);
    return { value: mph, unit: "mph" };
  }
  return { value: "--", unit: "" };
}

export function ActivityDetailHero({ activity }: Props) {
  const config = typeConfig[activity.activity_type] ?? typeConfig.Ride;
  const speed = formatSpeed(activity);

  const date = new Date(activity.start_date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const metrics = [
    {
      label: "Distance",
      value: metersToMiles(activity.distance ?? 0).toFixed(1),
      unit: "miles",
    },
    {
      label: "Moving time",
      value: formatDuration(activity.moving_time ?? 0),
      unit: "duration",
    },
    {
      label: activity.activity_type === "Run" ? "Avg pace" : activity.activity_type === "Swim" ? "Avg pace" : "Avg speed",
      value: speed.value,
      unit: speed.unit,
    },
    {
      label: "Elevation",
      value: Math.round(activity.total_elevation_gain ?? 0).toString(),
      unit: "meters gain",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Title row */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${config.badgeClass}`}>
            {config.label}
          </span>
          <span className="text-xs text-zinc-600">{date}</span>
        </div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
          {activity.name ?? "Activity"}
        </h1>
      </div>

      {/* 4 hero metrics */}
      <div className="grid grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-[#141414] border border-[#1e1e1e] rounded-xl px-4 py-3"
          >
            <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-700 mb-1">
              {m.label}
            </div>
            <div
              className="text-2xl font-bold leading-none tracking-tight"
              style={{ color: config.accent }}
            >
              {m.value}
            </div>
            <div className="text-[10px] text-zinc-700 mt-1">{m.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
