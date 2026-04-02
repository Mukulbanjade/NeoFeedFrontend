import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import TrustBadge from "./TrustBadge";
import VoteButtons from "./VoteButtons";
import { type Cluster, type Article, apiFetch } from "@/lib/api";

interface FeedCardProps {
  cluster: Cluster;
  index: number;
}

export default function FeedCard({ cluster, index }: FeedCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [articles, setArticles] = useState<Article[]>(cluster.articles || []);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const stars = Math.min(5, Math.round(cluster.importance_score / 2));

  const toggleExpand = async () => {
    if (!expanded && articles.length === 0) {
      setLoadingArticles(true);
      try {
        const data = await apiFetch(`/articles/cluster/${cluster.id}`);
        setArticles(Array.isArray(data) ? data : data.articles || []);
      } catch {
        // keep empty
      } finally {
        setLoadingArticles(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="neo-card p-4"
    >
      <div className="flex gap-3">
        <VoteButtons clusterId={cluster.id} initialVote={cluster.user_vote} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <TrustBadge level={cluster.trust_level} />
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm border border-border text-muted-foreground uppercase tracking-wider">
              {cluster.category}
            </span>
          </div>

          <h3 className="font-mono font-bold text-foreground text-sm mb-1 leading-snug cursor-pointer hover:text-accent transition-colors">
            {cluster.representative_title}
          </h3>

          <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-3 font-body">
            {cluster.summary}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
            <span>from {cluster.source_count} sources</span>
            <span className="text-warning">{"⭐".repeat(stars)}{"☆".repeat(5 - stars)}</span>
          </div>

          <button
            onClick={toggleExpand}
            className="mt-3 flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "HIDE SOURCES" : "SHOW SOURCES"}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 border-t border-border pt-3 space-y-2">
                  {loadingArticles ? (
                    <p className="text-muted-foreground text-xs font-mono animate-pulse-glow">LOADING...</p>
                  ) : articles.length === 0 ? (
                    <p className="text-muted-foreground text-xs font-mono">No source data available</p>
                  ) : (
                    articles.map((article) => (
                      <a
                        key={article.id}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors group"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="font-mono text-[10px] text-foreground/50 flex-shrink-0">
                          [{article.source}]
                        </span>
                        <span className="truncate group-hover:text-accent">{article.title}</span>
                      </a>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
