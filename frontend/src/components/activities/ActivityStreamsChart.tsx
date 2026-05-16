import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { metersToMiles } from "../../lib/units";

interface Props {
  streams: any;
  activityType?: string;
}

const SERIES = [
  { key: "heartrate", label: "HR", color: "#22c55e", yAxisId: "hr", type: "line" as const },
  { key: "altitude", label: "Elev", color: "#52525b", yAxisId: "alt", type: "area" as const },
  { key: "velocity", label: "Pace", color: "#3b82f6", yAxisId: "vel", type: "line" as const },
  { key: "watts", label: "Power", color: "#fb641b", yAxisId: "watts", type: "line" as const },
];

function formatTooltipValue(key: string, value: number, activityType?: string): string {
  if (key === "heartrate") return `${Math.round(value)} bpm`;
  if (key === "altitude") return `${Math.round(value)} m`;
  if (key === "watts") return `${Math.round(value)} W`;
  if (key === "velocity") {
    if (activityType === "Swim") {
      const s = 91.44 / value;
      const mins = Math.floor(s / 60);
      const secs = Math.round(s % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}/100yd`;
    }
    const mph = value * 2.23694;
    const minPerMile = 60 / mph;
    const mins = Math.floor(minPerMile);
    const secs = Math.round((minPerMile - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}/mi`;
  }
  return `${value}`;
}

export function ActivityStreamsChart({ streams, activityType }: Props) {
  const [active, setActive] = useState<Record<string, boolean>>({
    heartrate: true,
    altitude: true,
    velocity: false,
    watts: false,
  });

  const data = useMemo(() => {
    if (!streams?.distance) return [];
    const total = streams.distance.length;
    const step = Math.max(1, Math.floor(total / 500));

    return streams.distance
      .filter((_: any, i: number) => i % step === 0)
      .map((_: any, idx: number) => {
        const i = idx * step;
        return {
          dist: metersToMiles(streams.distance[i]),
          heartrate: streams.heartrate?.[i] ?? null,
          altitude: streams.altitude?.[i] ?? null,
          velocity: streams.velocity?.[i] ?? null,
          watts: streams.watts?.[i] ?? null,
        };
      });
  }, [streams]);

  if (!data.length) return null;

  const distMax = data[data.length - 1]?.dist ?? 0;
  const ticks: number[] = [];
  for (let m = 0; m <= Math.floor(distMax); m++) ticks.push(m);
  if (distMax - Math.floor(distMax) > 0.1) ticks.push(parseFloat(distMax.toFixed(1)));

  const availableSeries = SERIES.filter((s) => streams[s.key]);

  const CustomTooltip = ({ active: a, payload, label }: any) => {
    if (!a || !payload?.length) return null;
    const entries = SERIES.filter((s) => active[s.key] && streams[s.key]);
    if (!entries.length) return null;
    return (
      <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-xs space-y-1.5 shadow-xl min-w-[140px]">
        <div className="text-zinc-600 mb-2 text-[10px]">{Number(label).toFixed(2)} mi</div>
        {entries.map((s) => {
          const point = payload.find((p: any) => p.dataKey === s.key);
          if (!point?.value) return null;
          return (
            <div key={s.key} className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-zinc-500">{s.label}</span>
              </div>
              <span className="text-zinc-200 font-semibold">
                {formatTooltipValue(s.key, point.value, activityType)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-zinc-300">Analysis</h2>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex gap-3">
            {availableSeries.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full transition-opacity"
                  style={{ background: s.color, opacity: active[s.key] ? 1 : 0.25 }}
                />
                <span className={`text-[11px] transition-colors ${active[s.key] ? "text-zinc-400" : "text-zinc-700"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          {/* Toggles */}
          <div className="flex gap-1.5">
            {availableSeries.map((s) => (
              <button
                key={s.key}
                onClick={() => setActive((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition ${
                  active[s.key]
                    ? "border-[#2a2a2a] bg-[#1e1e1e] text-zinc-300"
                    : "border-transparent bg-transparent text-zinc-700 hover:text-zinc-500"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            {/* One hidden Y axis per series — each normalizes independently */}
            {availableSeries.map((s) => (
              <YAxis
                key={s.key}
                yAxisId={s.yAxisId}
                hide={true}
                domain={["auto", "auto"]}
              />
            ))}

            <XAxis
              dataKey="dist"
              type="number"
              domain={[0, distMax]}
              ticks={ticks}
              tick={{ fill: "#3f3f46", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Elevation area — render first so it's behind lines */}
            {active.altitude && streams.altitude && (
              <Area
                yAxisId="alt"
                type="monotone"
                dataKey="altitude"
                stroke="#52525b"
                strokeWidth={1}
                fill="#52525b"
                fillOpacity={0.15}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* HR line */}
            {active.heartrate && streams.heartrate && (
              <Line
                yAxisId="hr"
                type="monotone"
                dataKey="heartrate"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Velocity/pace line */}
            {active.velocity && streams.velocity && (
              <Line
                yAxisId="vel"
                type="monotone"
                dataKey="velocity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Power line */}
            {active.watts && streams.watts && (
              <Line
                yAxisId="watts"
                type="monotone"
                dataKey="watts"
                stroke="#fb641b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
