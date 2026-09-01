export function Header() {
  return (
    <header className="h-16 border-b border-graphite-700 bg-graphite-900 flex items-center px-6 justify-between">
      <h2 className="text-lg font-semibold text-white tracking-wide">Fleet Overview</h2>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-industrial-yellow flex items-center justify-center text-graphite-900 font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
