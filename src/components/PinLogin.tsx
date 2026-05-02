import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiFetch, setPin, setAuthenticated } from "@/lib/api";

interface PinLoginProps {
  onSuccess: () => void;
}

export default function PinLogin({ onSuccess }: PinLoginProps) {
  const [pin, setPinValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSlowVerifyHint, setShowSlowVerifyHint] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSlowVerifyHint(false);
      return;
    }
    const id = window.setTimeout(() => setShowSlowVerifyHint(true), 10_000);
    return () => window.clearTimeout(id);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/verify", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      setPin(pin);
      setAuthenticated(true);
      onSuccess();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      if (raw.includes("PIN required")) setError(raw);
      else if (raw.toLowerCase().includes("invalid pin") || raw.includes("401")) setError("ACCESS DENIED — wrong PIN.");
      else if (raw) setError(raw);
      else setError("ACCESS DENIED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="neo-card p-8 w-full max-w-sm mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="font-mono text-3xl font-bold text-foreground glow-text tracking-[8px] mb-2">
            NEOFEED
          </h1>
          <p className="font-mono text-muted-foreground text-sm tracking-[4px] uppercase">
            Access Terminal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="neo-input w-full text-center text-2xl tracking-[12px] py-4"
              autoFocus
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-center font-mono text-sm animate-flicker"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="neo-button w-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "VERIFYING..." : "ENTER"}
          </button>
          {showSlowVerifyHint && loading && (
            <p className="mt-3 font-mono text-[10px] text-muted-foreground text-center leading-relaxed px-1">
              The server may be starting after idle — this can take up to a minute on free hosting.
            </p>
          )}
        </form>

        <div className="mt-6 text-center">
          <span className="font-mono text-xs text-muted-foreground animate-pulse-glow">
            ▮ SECURE CONNECTION
          </span>
        </div>
      </motion.div>
    </div>
  );
}
