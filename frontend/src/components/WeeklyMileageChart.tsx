import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Activity } from "../types/activity.ts";
import { metersToMiles } from "../lib/units";

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...

  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);

  d.setHours(0, 0, 0, 0);
  return d;
}

function groupByWeek(activities: Activity[]) {
  const map: Record<string, number> = {};

  activities.forEach((a) => {
    if (a.activity_type !== "Run" || !a.start_date) return;

    const date = new Date(a.start_date);
    const weekStart = getWeekStart(date);
    const key = weekStart.toISOString().slice(0, 10);

    map[key] = (map[key] || 0) + metersToMiles(a.distance);
  });

  // --- build continuous weeks ---
  const weeks: { week: string; distance: number }[] = [];

  const sortedKeys = Object.keys(map).sort();
  if (sortedKeys.length === 0) return [];

  let current = new Date(sortedKeys[0]);
  const end = new Date(sortedKeys[sortedKeys.length - 1]);

  while (current <= end) {
    const key = current.toISOString().slice(0, 10);

    weeks.push({
      week: key,
      distance: Number((map[key] || 0).toFixed(2)),
    });

    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

export default function WeeklyMileageChart({ activities }: { activities: Activity[] }) {
  const data = groupByWeek(activities).slice(-12);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">Weekly Mileage</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
        <XAxis
        dataKey="week"
        tickFormatter={(week, index) => {
          const d = new Date(week);
          const month = d.toLocaleDateString("en-US", { month: "short" });

          const prev = data[index - 1];
          if (!prev) return month;

          const prevMonth = new Date(prev.week).toLocaleDateString("en-US", { month: "short" });

          return month !== prevMonth ? month : "";
        }}
        />
          <YAxis />
          <Tooltip
            formatter={(value) => `${value} mi`}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <Line type="monotone" dataKey="distance" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
