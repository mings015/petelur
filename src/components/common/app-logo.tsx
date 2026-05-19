import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AppLogo({ size = "md", className }: AppLogoProps) {
  const dim = size === "sm" ? 28 : size === "lg" ? 52 : 36;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="40" height="40" rx="10" fill="#1E3A5F" />
        {/* Egg shape */}
        <ellipse cx="20" cy="22" rx="9" ry="11" fill="white" opacity="0.95" />
        {/* Yolk */}
        <circle cx="20" cy="23" r="4.5" fill="#F59E0B" />
        {/* Shine */}
        <ellipse cx="17.5" cy="19.5" rx="1.5" ry="2" fill="white" opacity="0.5" transform="rotate(-20 17.5 19.5)" />
      </svg>

      <div className="leading-none">
        <span
          className={cn(
            "font-bold tracking-tight text-foreground",
            size === "sm" && "text-sm",
            size === "md" && "text-base",
            size === "lg" && "text-2xl",
          )}
        >
          Petelur
        </span>
        {size === "lg" && (
          <p className="text-xs text-muted-foreground mt-0.5 font-normal tracking-normal">
            Manajemen Peternakan Ayam
          </p>
        )}
      </div>
    </div>
  );
}
