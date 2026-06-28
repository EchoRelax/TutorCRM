import { cn } from "@/lib/utils";

interface TimeBlockProps {
  time: string;
  duration?: number;
  end?: string;
  className?: string;
}

export function TimeBlock({ time, duration, end, className }: TimeBlockProps) {
  return (
    <div className={cn("timeblock", className)}>
      <span className="timeblock-time">{time}</span>
      {end ? (
        <span className="timeblock-sub">до {end}</span>
      ) : duration != null ? (
        <span className="timeblock-sub">{duration} мин</span>
      ) : null}
    </div>
  );
}
