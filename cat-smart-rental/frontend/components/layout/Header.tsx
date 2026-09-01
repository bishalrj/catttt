import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center px-6 justify-between shrink-0 shadow-sm sticky top-0 z-20" style={{ borderColor: "#e8e8e8" }}>
      {/* Left: Search bar — RentoMojo centre-search style */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-rm-surface border border-rm-border rounded-lg px-3 py-2 flex-1 focus-within:border-rm-red focus-within:bg-white transition-all">
          <Search className="h-4 w-4 text-rm-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search equipment, sites, operators…"
            className="bg-transparent text-sm text-rm-text-primary placeholder-rm-text-placeholder outline-none flex-1"
          />
        </div>
      </div>

      {/* Right: Fleet overview label + alert bell + avatar */}
      <div className="flex items-center gap-4">
        <span className="hidden md:block text-sm font-semibold text-rm-text-secondary">Fleet Overview</span>

        <button className="relative h-9 w-9 rounded-lg border border-rm-border bg-white hover:bg-rm-surface flex items-center justify-center transition-colors group">
          <Bell className="h-4 w-4 text-rm-text-muted group-hover:text-rm-text-primary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rm-red rounded-full border border-white" />
        </button>

        <div className="h-9 w-9 rounded-full bg-rm-red flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:bg-rm-red-hover transition-colors">
          A
        </div>
      </div>
    </header>
  );
}
