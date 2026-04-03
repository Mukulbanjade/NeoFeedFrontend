import { type TrustLevel } from "@/lib/api";

const TRUST_CONFIG: Record<TrustLevel, { label: string; emoji: string; className: string }> = {
  verified: { label: "VERIFIED", emoji: "✅", className: "bg-primary/20 text-foreground border-primary/40" },
  likely_true: { label: "LIKELY TRUE", emoji: "🟢", className: "bg-primary/10 text-foreground border-muted/40" },
  unverified: { label: "UNVERIFIED", emoji: "🟡", className: "bg-warning/10 text-warning border-warning/30" },
  likely_false: { label: "LIKELY FALSE", emoji: "🔴", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

export default function TrustBadge({ level }: { level: TrustLevel }) {
  const config = TRUST_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-[10px] font-mono tracking-wider ${config.className}`}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}
