import { useState, useEffect, useMemo } from "react";
import MatrixRain from "@/components/MatrixRain";
import PinLogin from "@/components/PinLogin";
import NavBar from "@/components/NavBar";
import FeedCard from "@/components/FeedCard";
import FeedSidebar from "@/components/FeedSidebar";
import SettingsModal from "@/components/SettingsModal";
import { isAuthenticated, logout, apiFetch, clusterTrustLevel, type Cluster } from "@/lib/api";

export default function Index() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [trustFilters, setTrustFilters] = useState<string[]>(["verified", "likely_true", "unverified", "likely_false"]);
  const [minImportance, setMinImportance] = useState(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCategory, setSummaryCategory] = useState("all");
  const [feedSummary, setFeedSummary] = useState("");
  const [showSlowLoadHint, setShowSlowLoadHint] = useState(false);
  const [feedError, setFeedError] = useState("");

  const WAR_PATTERNS = [
    /\bwar\b/i, /\bconflict\b/i, /\bmilitary\b/i, /\bmissile\b/i, /\bdrone\b/i,
    /\bceasefire\b/i, /\bsanctions\b/i, /\bnato\b/i, /\bdefense\b/i, /\bdefence\b/i,
    /\bstrike\b/i, /\bfrontline\b/i, /\bairstrike\b/i, /\bgeopolitics?\b/i,
  ];

  const isWarCluster = (c: Cluster) => {
    const text = `${c.representative_title || ""} ${c.summary || ""}`.toLowerCase();
    return WAR_PATTERNS.some((p) => p.test(text));
  };

  const fetchClusters = async () => {
    setLoading(true);
    setFeedError("");
    try {
      const params = new URLSearchParams({ personalized: "true", limit: "50" });
      // "war" uses keyword-driven grouping from mixed feeds; don't pass unknown backend category.
      if (category !== "all" && category !== "war") params.set("category", category);
      const data = await apiFetch(`/clusters/?${params}`);
      setClusters(Array.isArray(data) ? data : data.clusters || []);
    } catch (e) {
      setClusters([]);
      const msg =
        e instanceof Error && e.message
          ? e.message
          : "Could not load feed from API. Check backend status, PIN, and API endpoint in Settings.";
      setFeedError(msg);
      // apiFetch may call logout() on 401 — align React state so the PIN gate reappears.
      setAuthed(isAuthenticated());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchClusters();
  }, [authed, category]);

  useEffect(() => {
    if (!loading) {
      setShowSlowLoadHint(false);
      return;
    }
    const id = window.setTimeout(() => setShowSlowLoadHint(true), 10_000);
    return () => window.clearTimeout(id);
  }, [loading]);

  const filtered = useMemo(() => {
    return clusters.filter((c) => {
      if (category === "war" && !isWarCluster(c)) return false;
      if (!trustFilters.includes(clusterTrustLevel(c))) return false;
      if (c.importance_score < minImportance) return false;
      if (search) {
        const q = search.toLowerCase();
        const title = (c.representative_title || "").toLowerCase();
        const summary = (c.summary || "").toLowerCase();
        return title.includes(q) || summary.includes(q);
      }
      return true;
    });
  }, [clusters, trustFilters, minImportance, search]);

  const handleLogout = () => {
    logout();
    setAuthed(false);
  };

  const loadFeedSummary = async (cat: string) => {
    setSummaryCategory(cat);
    setSummaryOpen(true);
    setSummaryLoading(true);
    try {
      const params = new URLSearchParams({ category: cat, limit: "40" });
      const data = await apiFetch(`/clusters/summary?${params}`);
      setFeedSummary(data?.summary || "No summary available right now.");
    } catch {
      setFeedSummary("Could not generate summary right now. Please try again in a moment.");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <MatrixRain />
      <div className="scanline-overlay" />

      {!authed ? (
        <PinLogin onSuccess={() => setAuthed(true)} />
      ) : (
        <div className="relative z-10 flex flex-col min-h-screen">
          <NavBar
            category={category}
            onCategoryChange={setCategory}
            search={search}
            onSearchChange={setSearch}
            onSettingsClick={() => setSettingsOpen(true)}
          />

          <div className="flex flex-1 max-w-7xl mx-auto w-full">
            <main className="flex-1 p-4 space-y-3 overflow-y-auto">
              <div className="flex justify-end">
                <button
                  onClick={() => loadFeedSummary(category === "all" ? "all" : category)}
                  className="font-mono text-[10px] px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors tracking-wider"
                >
                  SUMMARIZE {category.toUpperCase()} FEED
                </button>
              </div>

              {summaryOpen && (
                <div className="neo-card p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-[11px] tracking-wider text-foreground">
                      FEED SUMMARY: {summaryCategory.toUpperCase()}
                    </div>
                    <button
                      onClick={() => setSummaryOpen(false)}
                      className="font-mono text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      CLOSE
                    </button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {["all", "ai", "crypto", "war"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => loadFeedSummary(cat)}
                        className={`font-mono text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                          summaryCategory === cat
                            ? "border-primary text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {summaryLoading ? "Generating summary..." : feedSummary}
                  </p>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 px-4 text-center">
                  <p className="font-mono text-foreground text-sm animate-pulse-glow tracking-wider">LOADING FEED...</p>
                  {showSlowLoadHint && (
                    <p className="font-mono text-muted-foreground text-[10px] max-w-md leading-relaxed tracking-wide">
                      Still waiting — the API host may be waking from sleep (common on free tiers). This can take up to a minute the first time.
                    </p>
                  )}
                </div>
              ) : feedError ? (
                <div className="flex items-center justify-center py-20 px-4 text-center">
                  <p className="font-mono text-destructive text-xs tracking-wider max-w-lg">
                    {feedError}
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <p className="font-mono text-muted-foreground text-sm tracking-wider">NO CLUSTERS FOUND</p>
                </div>
              ) : (
                filtered.map((cluster, i) => (
                  <FeedCard key={cluster.id} cluster={cluster} index={i} />
                ))
              )}

              <div className="pt-4 pb-8 text-center">
                <button onClick={handleLogout} className="font-mono text-[10px] text-muted-foreground hover:text-destructive transition-colors tracking-wider">
                  DISCONNECT TERMINAL
                </button>
              </div>
            </main>

            <FeedSidebar
              trustFilters={trustFilters}
              onTrustFiltersChange={setTrustFilters}
              minImportance={minImportance}
              onMinImportanceChange={setMinImportance}
            />
          </div>

          <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
      )}
    </div>
  );
}
