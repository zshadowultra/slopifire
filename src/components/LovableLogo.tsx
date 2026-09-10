import { useId } from "react";

/**
 * Slopifire fire logo:
 * A clean, solid fire silhouette with no inner cutouts or detailing,
 * filled with a rich vibrant gradient of fire colors (yellow -> amber -> orange-red -> crimson).
 */
export function LovableHeart({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="1"
        >
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="25%" stopColor="#FFA000" />
          <stop offset="60%" stopColor="#FF4500" />
          <stop offset="85%" stopColor="#E61919" />
          <stop offset="100%" stopColor="#B30000" />
        </linearGradient>
      </defs>
      {/* Pure fire silhouette: single solid path with no inner cutouts or lines */}
      <path
        d="M 50 4 C 50 4 64 24 64 42 C 64 46 63 50 61.5 53.5 C 67.5 48 70 41 70 34 C 77 44 82 56 82 68 C 82 85.7 67.7 100 50 100 C 32.3 100 18 85.7 18 68 C 18 51.5 28.5 35 41 23 C 44 32 49 38 55 42 C 54 30 52 16 50 4 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

export const SlopifireLogo = LovableHeart;

export function LovableWordmark({
  size = 26,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LovableHeart size={size} />
      <span
        className="font-extrabold tracking-tight text-foreground"
        style={{ fontSize: size }}
      >
        Slopifire
      </span>
    </span>
  );
}

export const SlopifireWordmark = LovableWordmark;
