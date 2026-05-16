import { metersToMiles } from "../../lib/units";
import { formatDuration } from "../../lib/formatters";

interface Lap {
  elapsed_time: number;
  moving_time: number;
  distance: number;
  average_speed?: number | null;
  average_watts?: number | null;
  average_cadence?: number | null;
  total_elevation_gain?: number | null;
}

interface Props {
  laps: Lap[];
  activityType?: string;
}

function lapPace(mps: number | null | undefined, type?: string): string {
  if (!mps) return "--";
  if (type === "Swim") {
    const s = 91.44 / mps;
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  const mph = mps * 2.23694;
  const minPerMile = 60 / mph;
  const mins = Math.floor(minPerMile);
  const secs = Math.round((minPerMile - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function lapPaceUnit(type?: string): string {
  if (type === "Swim") return "/100yd";
  if (type === "Run") return "/mi";
  return "mph";
}

export function ActivityLapsTable({ laps, activityType }: Props) {
  const maxPace = Math.max(...laps.map((l) => l.average_speed ?? 0));
  const minPace = Math.min(...laps.map((l) => l.average_speed ?? Infinity));

  const paceUnit = lapPaceUnit(activityType);
  const showPower = laps.some((l) => l.average_watts);
  const showCadence = laps.some((l) => l.average_cadence);
  const isRide = activityType === "Ride";

  const accentColor =
    activityType === "Run" ? "#22c55e" :
    activityType === "Ride" ? "#fb641b" :
    "#38bdf8";

  const th = "text-left text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-700 py-2.5";
  const td = "text-xs py-2.5";

  // Fixed pixel widths applied via style — Tailwind col widths are unreliable
  const cols = [
    { label: "#", width: 40 },
    { label: "Distance", width: 110 },
    { label: "Time", width: 110 },
    { label: isRide ? "Speed" : `Pace ${paceUnit}`, width: 120 },
    ...(showPower ? [{ label: "Power", width: 100 }] : []),
    ...(showCadence ? [{ label: "Cadence", width: 100 }] : []),
    { label: "Elev", width: 90 },
    { label: "Effort", width: 120 },
  ];

  return (
    <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1e1e1e] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-300">Laps</h2>
        <span className="text-xs text-zinc-700">{laps.length} splits</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            {cols.map((c) => (
              <col key={c.label} style={{ width: c.width }} />
            ))}
          </colgroup>

          <thead>
            <tr className="border-b border-[#1e1e1e]">
              {cols.map((c) => (
                <th key={c.label} className={th} style={{ paddingLeft: 12, paddingRight: 12 }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {laps.map((lap, i) => {
              const speed = lap.average_speed ?? 0;
              const paceStr = isRide
                ? `${(speed * 2.23694).toFixed(1)} mph`
                : lapPace(lap.average_speed, activityType);

              const barPct =
                maxPace > minPace
                  ? ((speed - minPace) / (maxPace - minPace)) * 100
                  : 50;

              const cells = [
                <td key="num" className={td} style={{ paddingLeft: 12, paddingRight: 12, color: "#3f3f46", fontWeight: 700, fontSize: 10 }}>
                  {i + 1}
                </td>,
                <td key="dist" className={td} style={{ paddingLeft: 12, paddingRight: 12, color: "#71717a" }}>
                  {metersToMiles(lap.distance).toFixed(2)} mi
                </td>,
                <td key="time" className={td} style={{ paddingLeft: 12, paddingRight: 12, color: "#71717a" }}>
                  {formatDuration(lap.moving_time)}
                </td>,
                <td key="pace" className={td} style={{ paddingLeft: 12, paddingRight: 12, color: accentColor, fontWeight: 600 }}>
                  {paceStr}
                  {!isRide && (
                    <span style={{ fontSize: 10, fontWeight: 400, color: "#3f3f46", marginLeft: 2 }}>
                      {paceUnit}
                    </span>
                  )}
                </td>,
                ...(showPower ? [
                  <td key="power" className={td} style={{ paddingLeft: 12, paddingRight: 12, color: "#71717a" }}>
                    {lap.average_watts ? `${Math.round(lap.average_watts)} W` : "--"}
                  </td>
                ] : []),
                ...(showCadence ? [
                  <td key="cadence" className={td} style={{ paddingLeft: 12, paddingRight: 12, color: "#71717a" }}>
                    {lap.average_cadence ? Math.round(lap.average_cadence) : "--"}
                  </td>
                ] : []),
                <td key="elev" className={td} style={{ paddingLeft: 12, paddingRight: 12, color: "#71717a" }}>
                  {lap.total_elevation_gain != null
                    ? `${Math.round(lap.total_elevation_gain)} m`
                    : "--"}
                </td>,
                <td key="effort" className={td} style={{ paddingLeft: 12, paddingRight: 12 }}>
                  <div style={{ height: 3, background: "#1e1e1e", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${barPct}%`,
                        height: "100%",
                        background: accentColor,
                        opacity: 0.5,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </td>,
              ];

              return (
                <tr
                  key={i}
                  className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#161616] transition"
                >
                  {cells}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
