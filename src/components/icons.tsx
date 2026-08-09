/*
 * All icons are drawn on a 16px grid with a single 1px stroke, so they match
 * the weight of the rules and dimension lines in the rest of the sheet.
 */

type IconProps = {
  className?: string;
};

const stroke = {
  viewBox: "0 0 16 16",
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1,
};

export function PlusIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden="true" focusable="false">
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

export function CloseIcon({ className = "h-3 w-3" }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden="true" focusable="false">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden="true" focusable="false">
      <path d="M10 3l-5 5 5 5" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden="true" focusable="false">
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

/** Drafting sliders — the settings control. */
export function SettingsIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden="true" focusable="false">
      <path d="M2 4.5h12M2 8h12M2 11.5h12" />
      <path d="M5.5 3v3M10.5 6.5v3M6.5 10v3" />
    </svg>
  );
}

/** Expand / collapse, drawn as a drawing's detail callout. */
export function DisclosureIcon({ open, className = "h-3 w-3" }: IconProps & { open: boolean }) {
  return (
    <svg {...stroke} className={className} aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="13" height="13" />
      <path d="M4.5 8h7" />
      {!open && <path d="M8 4.5v7" />}
    </svg>
  );
}
