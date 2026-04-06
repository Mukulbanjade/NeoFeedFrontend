import { useState } from "react";
import { Search, Settings, Menu, X } from "lucide-react";

interface NavBarProps {
  category: string;
  onCategoryChange: (cat: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onSettingsClick: () => void;
}

const TABS = ["ALL", "AI", "CRYPTO", "WAR"];

export default function NavBar({ category, onCategoryChange, search, onSearchChange, onSettingsClick }: NavBarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
        <h1 className="font-mono font-bold text-sm sm:text-lg text-foreground glow-text tracking-[3px] sm:tracking-[4px] flex-shrink-0">
          NEO
          <span className="hidden sm:inline">FEED</span>
        </h1>

        <div className="flex items-center gap-1 bg-card rounded-md p-0.5 border border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onCategoryChange(tab.toLowerCase())}
              className={`font-mono text-[10px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-sm transition-all tracking-wider ${
                category === tab.toLowerCase()
                  ? "bg-primary text-primary-foreground glow-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Desktop search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="neo-input pl-8 py-1.5 text-xs w-36 sm:w-48"
            />
          </div>

          <button
            onClick={onSettingsClick}
            className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:glow-text transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="neo-input pl-8 py-1.5 text-xs w-full"
              autoFocus
            />
          </div>
        </div>
      )}
    </nav>
  );
}