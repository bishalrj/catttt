import Link from "next/link";
import { LayoutDashboard, Truck, LineChart, Bell, History } from "lucide-react";

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-slate-900 text-slate-300 h-screen border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
          <Truck className="h-6 w-6 text-yellow-500" />
          CAT RENTAL
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
        <Link href="/equipment" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <Truck className="h-5 w-5" />
          Equipment
        </Link>
        <Link href="/rentals" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <History className="h-5 w-5" />
          Rental History
        </Link>
        <div className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-500 cursor-not-allowed">
          <LineChart className="h-5 w-5" />
          Analytics (Stage 3)
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-500 cursor-not-allowed">
          <Bell className="h-5 w-5" />
          Alerts (Stage 3)
        </div>
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; 2026 CAT Rental Tracking
      </div>
    </div>
  );
}
