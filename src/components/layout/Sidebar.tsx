
import { useState } from "react";
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  BarChart3, 
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Book
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Kas Masuk", href: "/cash-in", icon: TrendingUp },
  { name: "Kas Keluar", href: "/cash-out", icon: TrendingDown },
  { name: "Jurnal Umum", href: "/journal", icon: BookOpen },
  { name: "Buku Kas Umum", href: "/buku-kas-umum", icon: Book },
  { name: "Arus Kas", href: "/cash-flow", icon: BarChart3 },
  { name: "Laporan", href: "/reports", icon: FileText },
  { name: "Akun Rekening", href: "/accounts", icon: Users },
];

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

export function Sidebar({ onToggle }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
    
    // Dispatch custom event for backward compatibility
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
      detail: { collapsed: newState } 
    }));
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-64 bg-background border-r transform transition-transform duration-300 md:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SIA RSHD</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-30 h-full bg-background border-r transition-all duration-300 ease-linear hidden md:flex flex-col",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">SIA RSHD</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className={cn("flex-shrink-0", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                collapsed && "justify-center"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          {!collapsed && "RSUD H. Damanhuri Barabai"}
        </div>
      </div>
    </div>
  );
}
