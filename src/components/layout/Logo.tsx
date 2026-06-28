import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <path
        d="M12 2.5 L20 7.5 L12 12.5 L4 7.5 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M12 12.5 L20 7.5 M12 12.5 L4 7.5 M12 12.5 L12 21.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="21.5" r="1.3" fill="currentColor" />
    </svg>
  );
}
