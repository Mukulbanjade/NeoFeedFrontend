import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightClose, PanelRightOpen, TrendingUp, BarChart3, Filter } from "lucide-react";
import { apiFetch, type Preferences } from "@/lib/api";

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

export default function FeedSidebar({ trustFilters, onTrustFiltersChange, minImportance, onMinImportanceChange }: SidebarProps) {
  const [open, setOpen] = useState(true);
  const [prefs, setPrefs] = useState<Preferences | null>(null);

  useEffect(() => {
    apiFetch("/preferences/").then(setPrefs).catch(() => {});
  }, []);

  const toggleTrust = (key: string) => {
    onTrustFiltersChange(
      trustFilters.includes(key) ? trustFilters.filter((f) => f !== key) : [...trustFilters, key]
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-16 right-4 z-20 p-2 text-muted-foreground hover:text-foreground transition-colors lg:hidden"
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
            className="w-72 flex-shrink-0 border-l border-border bg-background/50 backdrop-blur-md p-4 space-y-6 overflow-y-auto fixed right-0 top-14 bottom-0 z-20 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]"
          >
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-1 text-muted-foreground hover:text-foreground float-right"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>

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
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
