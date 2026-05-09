interface ActivityStatProps {
  label: string;
  value: string;
}

export function ActivityStat({
  label,
  value,
}: ActivityStatProps) {
  return (
    <div className="text-zinc-300">
      <div className="text-zinc-500 text-xs tracking-wide">
        {label}
      </div>

      <div className="mt-1 font-medium">
        {value}
      </div>
    </div>
  );
}
