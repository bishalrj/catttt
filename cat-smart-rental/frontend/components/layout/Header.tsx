export function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center px-6 justify-between">
      <h2 className="text-lg font-semibold text-slate-800">Fleet Overview</h2>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
