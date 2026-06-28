import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-terracotta", className)}
      aria-hidden="true"
    >
      <path
        d="M12 3.2 L21.5 8.2 L12 13.2 L2.5 8.2 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.8 V14.8 C6 17 9 18.4 12 18.4 C15 18.4 18 17 18 14.8 V10.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21.5 8.2 V12.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="21.5" cy="14.3" r="1.2" fill="currentColor" />
    </svg>
  );
}
