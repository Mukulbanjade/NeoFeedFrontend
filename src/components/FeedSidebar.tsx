import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightClose, PanelRightOpen, TrendingUp, BarChart3, Filter } from "lucide-react";
import { apiFetch, type Preferences } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  trustFilters: string[];
  onTrustFiltersChange: (f: string[]) => void;
  minImportance: number;
  onMinImportanceChange: (n: number) => void;
}

const TRUST_OPTS = [
  { key: "verified", label: "Verified" },
  { key: "likely_true", label: "Likely True" },
  { key: "unverified", label: "Unverified" },
  { key: "likely_false", label: "Likely False" },
];

<<<<<<< HEAD
function SidebarContent({ trustFilters, onTrustFiltersChange, minImportance, onMinImportanceChange, prefs }: SidebarProps & { prefs: Preferences | null }) {
=======
export default function FeedSidebar({ trustFilters, onTrustFiltersChange, minImportance, onMinImportanceChange }: SidebarProps) {
  const [open, setOpen] = useState(true);
  const [prefs, setPrefs] = useState<Preferences | null>(null);

  const normalizePrefs = (raw: unknown): Preferences | null => {
    if (!raw || typeof raw !== "object") return null;
    const src = raw as Record<string, unknown>;

    const sourceWeights = (src.source_weights && typeof src.source_weights === "object")
      ? (src.source_weights as Record<string, number>)
      : {};
    const topicWeights = (src.topic_weights && typeof src.topic_weights === "object")
      ? (src.topic_weights as Record<string, number>)
      : {};

    const ai = typeof src.ai_weight === "number"
      ? src.ai_weight
      : (typeof topicWeights.ai === "number" ? topicWeights.ai : 0.5);
    const crypto = typeof src.crypto_weight === "number"
      ? src.crypto_weight
      : (typeof topicWeights.crypto === "number" ? topicWeights.crypto : 0.5);

    const favoriteSources = Array.isArray(src.favorite_sources)
      ? src.favorite_sources.filter((x): x is string => typeof x === "string")
      : Object.entries(sourceWeights)
          .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
          .slice(0, 5)
          .map(([name]) => name);

    return {
      ai_weight: Number.isFinite(ai) ? ai : 0.5,
      crypto_weight: Number.isFinite(crypto) ? crypto : 0.5,
      favorite_sources: favoriteSources,
    };
  };

  useEffect(() => {
    apiFetch("/preferences/").then((data) => setPrefs(normalizePrefs(data))).catch(() => {});
  }, []);

>>>>>>> e6b12bc (fix(frontend): prevent blank-screen crash on preferences payload mismatch)
  const toggleTrust = (key: string) => {
    onTrustFiltersChange(
      trustFilters.includes(key) ? trustFilters.filter((f) => f !== key) : [...trustFilters, key]
    );
  };

  return (
    <div className="space-y-6">
      {/* Trending */}
      <section>
        <h3 className="font-mono text-xs text-foreground tracking-wider flex items-center gap-2 mb-3">
          <TrendingUp className="w-3.5 h-3.5" /> TRENDING
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {["GPT-5", "Bitcoin ETF", "DeepSeek", "Solana", "AGI", "SEC", "NVIDIA"].map((t) => (
            <span key={t} className="font-mono text-[10px] px-2 py-1 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 cursor-pointer transition-colors">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h3 className="font-mono text-xs text-foreground tracking-wider flex items-center gap-2 mb-3">
          <BarChart3 className="w-3.5 h-3.5" /> YOUR STATS
        </h3>
        {prefs ? (
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>AI Interest</span>
              <span className="text-foreground">{Math.round(prefs.ai_weight * 100)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="bg-foreground h-1.5 rounded-full" style={{ width: `${prefs.ai_weight * 100}%` }} />
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Crypto Interest</span>
              <span className="text-foreground">{Math.round(prefs.crypto_weight * 100)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="bg-foreground h-1.5 rounded-full" style={{ width: `${prefs.crypto_weight * 100}%` }} />
            </div>
            {prefs.favorite_sources.length > 0 && (
              <div className="mt-2">
                <p className="text-muted-foreground mb-1">Top Sources</p>
                {prefs.favorite_sources.map((s) => (
                  <span key={s} className="inline-block mr-1 mb-1 text-[10px] px-1.5 py-0.5 border border-border rounded-sm text-foreground/70">{s}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs font-mono">Connect API to view stats</p>
        )}
      </section>

      {/* Filters */}
      <section>
        <h3 className="font-mono text-xs text-foreground tracking-wider flex items-center gap-2 mb-3">
          <Filter className="w-3.5 h-3.5" /> FILTERS
        </h3>
        <div className="space-y-2">
          {TRUST_OPTS.map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={trustFilters.includes(opt.key)}
                onChange={() => toggleTrust(opt.key)}
                className="accent-primary w-3 h-3"
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-xs font-mono text-muted-foreground block mb-2">
            Min Importance: <span className="text-foreground">{minImportance}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={minImportance}
            onChange={(e) => onMinImportanceChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </section>
    </div>
  );
}

export default function FeedSidebar({ trustFilters, onTrustFiltersChange, minImportance, onMinImportanceChange }: SidebarProps) {
  const [open, setOpen] = useState(true);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    apiFetch("/preferences/").then(setPrefs).catch(() => {});
  }, []);

  const sharedProps = { trustFilters, onTrustFiltersChange, minImportance, onMinImportanceChange, prefs };

  // Mobile: use Sheet (slide-in drawer)
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed bottom-4 right-4 z-20 p-3 bg-primary text-primary-foreground rounded-full shadow-lg font-mono text-xs">
            <Filter className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] bg-background border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-mono text-foreground text-sm tracking-wider">SIDEBAR</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SidebarContent {...sharedProps} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: original sidebar
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-16 right-4 z-20 p-2 text-muted-foreground hover:text-foreground transition-colors xl:hidden"
      >
        {open ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-72 flex-shrink-0 border-l border-border bg-background/50 backdrop-blur-md p-4 overflow-y-auto hidden lg:block lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]"
          >
            <SidebarContent {...sharedProps} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}