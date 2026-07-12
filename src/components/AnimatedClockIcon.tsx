type AnimatedClockIconProps = {
  className?: string;
};

export function AnimatedClockIcon({ className = "" }: AnimatedClockIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <line
        x1="12"
        y1="12"
        x2="16"
        y2="12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="animate-clock-spin"
        style={{ transformOrigin: "12px 12px" }}
      />
    </svg>
  );
}
