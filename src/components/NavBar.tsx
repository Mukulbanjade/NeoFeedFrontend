import { Search, Settings } from "lucide-react";

interface NavBarProps {
  category: string;
  onCategoryChange: (cat: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onSettingsClick: () => void;
}

const TABS = ["ALL", "AI", "CRYPTO"];

export default function NavBar({ category, onCategoryChange, search, onSearchChange, onSettingsClick }: NavBarProps) {
  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <h1 className="font-mono font-bold text-lg text-foreground glow-text tracking-[4px] flex-shrink-0 hidden sm:block">
          NEOFEED
        </h1>

        <div className="flex items-center gap-1 bg-card rounded-md p-0.5 border border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onCategoryChange(tab.toLowerCase())}
              className={`font-mono text-xs px-4 py-1.5 rounded-sm transition-all tracking-wider ${
                category === tab.toLowerCase()
                  ? "bg-primary text-primary-foreground glow-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
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
            className="p-2 text-muted-foreground hover:text-foreground hover:glow-text transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
