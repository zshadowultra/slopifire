export function LovableHeart({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
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
          id="lovable-heart-gradient"
          x1="0.2"
          y1="0"
          x2="0.55"
          y2="1"
        >
          <stop offset="0%" stopColor="#FF8A00" />
          <stop offset="38%" stopColor="#F5344F" />
          <stop offset="70%" stopColor="#E23BA8" />
          <stop offset="100%" stopColor="#7B5CFF" />
        </linearGradient>
      </defs>
      <path
        d="M50 92 C18 68 4 47 4 30 C4 14 16 4 30 4 C39 4 46.5 8.5 50 15.5 C53.5 8.5 61 4 70 4 C84 4 96 14 96 30 C96 47 82 68 50 92 Z"
        fill="url(#lovable-heart-gradient)"
      />
    </svg>
  );
}

export function LovableWordmark({
  size = 26,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LovableHeart size={size} />
      <span
        className="font-extrabold tracking-tight text-foreground"
        style={{ fontSize: size }}
      >
        Lovable
      </span>
    </span>
  );
}
