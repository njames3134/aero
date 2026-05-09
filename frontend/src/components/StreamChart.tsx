import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StreamsChart({ streams }: any) {
  if (!streams?.distance) return <div>No data</div>;

  const data = streams.distance.map((d: number, i: number) => ({
    distance: d / 1609, // meters → miles
    heartrate: streams.heartrate?.[i],
    altitude: streams.altitude?.[i],
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">Activity Data</h2>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis
            dataKey="distance"
            label={{ value: "Miles", position: "insideBottom", offset: -5 }}
          />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="altitude"
            stroke="none"
            fill="#cbd5e1"
            fillOpacity={0.4}
          />

          <Line
            type="monotone"
            dataKey="heartrate"
            strokeWidth={3}
            dot={false}
          />          
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
