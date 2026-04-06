import { useState, useEffect, useMemo } from "react";
import MatrixRain from "@/components/MatrixRain";
import PinLogin from "@/components/PinLogin";
import NavBar from "@/components/NavBar";
import FeedCard from "@/components/FeedCard";
import FeedSidebar from "@/components/FeedSidebar";
import SettingsModal from "@/components/SettingsModal";
import { isAuthenticated, logout, apiFetch, clusterTrustLevel, type Cluster } from "@/lib/api";

// Demo data for when API is unavailable
const DEMO_CLUSTERS: Cluster[] = [
  {
    id: "1", representative_title: "OpenAI Announces GPT-5 with Reasoning Capabilities",
    summary: "OpenAI has unveiled its latest model, GPT-5, featuring advanced reasoning and multimodal capabilities. The model reportedly outperforms previous versions on all major benchmarks.",
    category: "ai", trust_level: "verified", importance_score: 9, source_count: 12, user_vote: null,
  },
  {
    id: "2", representative_title: "Bitcoin Surges Past $100K Amid ETF Inflows",
    summary: "Bitcoin has crossed the $100,000 mark for the first time as institutional investors pour billions into newly approved spot ETFs. Analysts predict continued momentum.",
    category: "crypto", trust_level: "likely_true", importance_score: 8, source_count: 8, user_vote: null,
  },
  {
    id: "3", representative_title: "DeepSeek R2 Model Leaked on Hugging Face",
    summary: "An alleged leak of DeepSeek's R2 model weights has appeared on Hugging Face, sparking debate about open-source AI and intellectual property in the AI research community.",
    category: "ai", trust_level: "unverified", importance_score: 7, source_count: 5, user_vote: null,
  },
  {
    id: "4", representative_title: "Solana Network Experiences 4-Hour Outage",
    summary: "The Solana blockchain experienced a significant outage lasting approximately four hours due to a consensus bug. The network has since been restored but SOL price dropped 8%.",
    category: "crypto", trust_level: "verified", importance_score: 6, source_count: 15, user_vote: null,
  },
  {
    id: "5", representative_title: "EU Passes Comprehensive AI Regulation Framework",
    summary: "The European Union has passed the most comprehensive AI regulation to date, requiring transparency reports and risk assessments for all AI systems deployed in member states.",
    category: "ai", trust_level: "verified", importance_score: 8, source_count: 20, user_vote: null,
  },
  {
    id: "6", representative_title: "SEC Reportedly Investigating Major Crypto Exchange",
    summary: "Sources claim the SEC has opened a formal investigation into a leading cryptocurrency exchange over allegations of market manipulation and unregistered securities offerings.",
    category: "crypto", trust_level: "likely_false", importance_score: 5, source_count: 3, user_vote: null,
  },
];

export default function Index() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [trustFilters, setTrustFilters] = useState<string[]>(["verified", "likely_true", "unverified", "likely_false"]);
  const [minImportance, setMinImportance] = useState(1);

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
    try {
      const params = new URLSearchParams({ personalized: "true", limit: "50" });
      // "war" uses keyword-driven grouping from mixed feeds; don't pass unknown backend category.
      if (category !== "all" && category !== "war") params.set("category", category);
      const data = await apiFetch(`/clusters/?${params}`);
      setClusters(Array.isArray(data) ? data : data.clusters || []);
    } catch {
      setClusters(DEMO_CLUSTERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchClusters();
  }, [authed, category]);

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
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="font-mono text-foreground text-sm animate-pulse-glow tracking-wider">LOADING FEED...</p>
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
