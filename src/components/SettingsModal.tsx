import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, WifiOff } from "lucide-react";
import { getApiUrl, setApiUrl, apiFetch } from "@/lib/api";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [apiUrl, setApiUrlLocal] = useState(getApiUrl());
  const [newPin, setNewPin] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [actionMsg, setActionMsg] = useState("");

  const saveUrl = () => {
    setApiUrl(apiUrl);
    setActionMsg("API URL saved");
    setTimeout(() => setActionMsg(""), 2000);
  };

  const changePin = async () => {
    try {
      await apiFetch("/auth/change-pin", { method: "POST", body: JSON.stringify({ new_pin: newPin }) });
      setActionMsg("PIN changed");
    } catch {
      setActionMsg("Failed to change PIN");
    }
    setTimeout(() => setActionMsg(""), 2000);
  };

  const runAction = async (path: string, label: string) => {
    try {
      await apiFetch(path, { method: "POST" });
      setActionMsg(`${label} triggered`);
    } catch {
      setActionMsg(`${label} failed`);
    }
    setTimeout(() => setActionMsg(""), 2000);
  };

  const checkConnection = async () => {
    try {
      await apiFetch("/health");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="neo-card w-full max-w-md mx-4 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono font-bold text-foreground tracking-wider text-sm">SETTINGS</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* API URL */}
              <div>
                <label className="font-mono text-[10px] text-muted-foreground tracking-wider block mb-1">API ENDPOINT</label>
                <div className="flex gap-2">
                  <input value={apiUrl} onChange={(e) => setApiUrlLocal(e.target.value)} className="neo-input flex-1 text-xs" />
                  <button onClick={saveUrl} className="neo-button text-[10px] px-3 py-1">SAVE</button>
                </div>
              </div>

              {/* Connection Status */}
              <div>
                <button onClick={checkConnection} className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {status === "success" ? <Wifi className="w-3.5 h-3.5 text-foreground" /> : status === "error" ? <WifiOff className="w-3.5 h-3.5 text-destructive" /> : <Wifi className="w-3.5 h-3.5" />}
                  {status === "success" ? "CONNECTED" : status === "error" ? "DISCONNECTED" : "CHECK CONNECTION"}
                </button>
              </div>

              {/* Change PIN */}
              <div>
                <label className="font-mono text-[10px] text-muted-foreground tracking-wider block mb-1">CHANGE PIN</label>
                <div className="flex gap-2">
                  <input type="password" inputMode="numeric" maxLength={8} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} placeholder="New PIN" className="neo-input flex-1 text-xs" />
                  <button onClick={changePin} disabled={newPin.length < 4} className="neo-button text-[10px] px-3 py-1 disabled:opacity-30">SET</button>
                </div>
              </div>

              {/* Admin Actions */}
              <div>
                <label className="font-mono text-[10px] text-muted-foreground tracking-wider block mb-2">ADMIN ACTIONS</label>
                <div className="flex gap-2">
                  <button onClick={() => runAction("/admin/scrape", "Scrape")} className="neo-button text-[10px] px-3 py-1.5 flex-1">SCRAPE NOW</button>
                  <button onClick={() => runAction("/admin/digest", "Digest")} className="neo-button text-[10px] px-3 py-1.5 flex-1">SEND DIGEST</button>
                </div>
              </div>

              {actionMsg && (
                <p className="font-mono text-xs text-center text-foreground animate-pulse-glow">{actionMsg}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
