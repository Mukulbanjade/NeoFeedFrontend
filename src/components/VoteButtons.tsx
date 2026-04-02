import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface VoteButtonsProps {
  clusterId: string;
  initialVote?: "up" | "down" | null;
}

export default function VoteButtons({ clusterId, initialVote }: VoteButtonsProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(initialVote || null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (dir: "up" | "down") => {
    const newVote = vote === dir ? null : dir;
    setVote(newVote);
    setLoading(true);
    try {
      await apiFetch("/votes/", {
        method: "POST",
        body: JSON.stringify({ cluster_id: clusterId, vote: newVote || dir }),
      });
    } catch {
      setVote(vote);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote("up")}
        disabled={loading}
        className={`p-1 rounded transition-colors ${
          vote === "up" ? "text-foreground glow-text" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleVote("down")}
        disabled={loading}
        className={`p-1 rounded transition-colors ${
          vote === "down" ? "text-destructive" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
