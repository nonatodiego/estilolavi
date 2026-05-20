interface LogoProps {
  className?: string;
  variant?: "full" | "mark";
  size?: number;
}

export function Logo({ className = "", variant = "full", size = 36 }: LogoProps) {
  if (variant === "mark") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={className}
        aria-label="Estilo Lavi"
      >
        <rect width="32" height="32" rx="8" fill="currentColor" className="text-foreground" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fontStyle="italic"
          fontSize="20"
          fontWeight="600"
          className="fill-[hsl(46_65%_52%)]"
        >
          L
        </text>
      </svg>
    );
  }
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={size}
        height={size}
        aria-label="Estilo Lavi"
      >
        <rect width="32" height="32" rx="8" fill="currentColor" className="text-foreground" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fontStyle="italic"
          fontSize="20"
          fontWeight="600"
          className="fill-[hsl(46_65%_52%)]"
        >
          L
        </text>
      </svg>
      <div className="leading-tight">
        <div
          className="font-serif text-xl font-semibold tracking-wide"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          data-testid="text-logo-brand"
        >
          Estilo Lavi
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Moda feminina
        </div>
      </div>
    </div>
  );
}
