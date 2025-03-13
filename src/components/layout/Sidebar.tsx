
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  BookText, 
  FileBarChart, 
  Wallet,
  BarChart2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { 
    path: "/", 
    name: "Dashboard", 
    icon: LayoutDashboard 
  },
  { 
    path: "/cash-flow", 
    name: "Arus Kas", 
    icon: ArrowLeftRight 
  },
  { 
    path: "/cash-out", 
    name: "Kas Keluar", 
    icon: ArrowDownRight 
  },
  { 
    path: "/cash-in", 
    name: "Kas Masuk", 
    icon: ArrowUpRight 
  },
  { 
    path: "/journal", 
    name: "Jurnal", 
    icon: BookText 
  },
  { 
    path: "/reports", 
    name: "Laporan", 
    icon: FileBarChart 
  },
  { 
    path: "/accounts", 
    name: "Rekening", 
    icon: Wallet 
  }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sm">
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center">
              <BarChart2 className="w-6 h-6 text-primary" />
              <span className="ml-2 font-semibold">FinFlow</span>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-2 py-2 rounded-md transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-accent text-primary font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                collapsed ? "mr-0" : "mr-3"
              )} />
              {!collapsed && <span>{item.name}</span>}
              {collapsed && (
                <div className="absolute left-full ml-6 px-2 py-1 bg-popover rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className={cn(
            "text-xs text-sidebar-foreground/70 transition-opacity duration-200",
            collapsed && "opacity-0"
          )}>
            &copy; {new Date().getFullYear()} FinFlow
          </div>
        </div>
      </div>
    </div>
  );
}
