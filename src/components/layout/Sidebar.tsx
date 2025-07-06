
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  BookOpen, 
  PieChart, 
  BarChart3,
  CreditCard,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    path: "/"
  },
  {
    title: "Kas Masuk",
    href: "/cash-in",
    icon: TrendingUp,
    path: "/cash-in"
  },
  {
    title: "Kas Keluar",
    href: "/cash-out",
    icon: TrendingDown,
    path: "/cash-out"
  },
  {
    title: "Jurnal Umum",
    href: "/journal",
    icon: FileText,
    path: "/journal"
  },
  {
    title: "Buku Kas Umum",
    href: "/buku-kas-umum",
    icon: BookOpen,
    path: "/buku-kas-umum"
  },
  {
    title: "Anggaran",
    href: "/anggaran",
    icon: PieChart,
    path: "/anggaran"
  },
  {
    title: "Arus Kas",
    href: "/cash-flow",
    icon: BarChart3,
    path: "/cash-flow"
  },
  {
    title: "LRA",
    href: "/laporan-realisasi-anggaran",
    icon: CreditCard,
    path: "/laporan-realisasi-anggaran"
  },
  {
    title: "Laporan",
    href: "/reports",
    icon: FileText,
    path: "/reports"
  },
  {
    title: "Akun Rekening",
    href: "/accounts",
    icon: Settings,
    path: "/accounts"
  }
];

const adminMenuItems = [
  {
    title: "Manajemen Pengguna",
    href: "/user-management",
    icon: Users,
    path: "/user-management"
  }
];

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

export function Sidebar({ onToggle }: SidebarProps) {
  const location = useLocation();
  const { hasPagePermission, userRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    
    // Dispatch custom event for layout to listen to
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
      detail: { collapsed: newCollapsed } 
    }));
    
    if (onToggle) {
      onToggle(newCollapsed);
    }
  };

  // Filter menu items based on user permissions
  const visibleMenuItems = menuItems.filter(item => 
    hasPagePermission(item.path, 'view')
  );

  // Add admin menu items for superadmin
  const allMenuItems = userRole === 'superadmin' 
    ? [...visibleMenuItems, ...adminMenuItems]
    : visibleMenuItems;

  return (
    <div className={cn(
      "fixed left-0 top-0 z-50 h-full bg-card border-r transition-all duration-300 ease-linear",
      collapsed ? "w-[70px]" : "w-[250px]"
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span className="font-semibold">SIA RSHD</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {allMenuItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed && "px-2"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
