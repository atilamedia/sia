
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation, Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  FileText,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronLeft,
  Users
} from "lucide-react";

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    path: "/"
  },
  {
    name: "Kas Masuk",
    href: "/cash-in",
    icon: ArrowDownToLine,
    path: "/cash-in"
  },
  {
    name: "Kas Keluar",
    href: "/cash-out",
    icon: ArrowUpFromLine,
    path: "/cash-out"
  },
  {
    name: "Jurnal Umum",
    href: "/journal",
    icon: BookOpen,
    path: "/journal"
  },
  {
    name: "Buku Kas Umum",
    href: "/buku-kas-umum",
    icon: FileText,
    path: "/buku-kas-umum"
  },
  {
    name: "Anggaran",
    href: "/anggaran",
    icon: DollarSign,
    path: "/anggaran"
  },
  {
    name: "Arus Kas",
    href: "/cash-flow",
    icon: TrendingUp,
    path: "/cash-flow"
  },
  {
    name: "LRA",
    href: "/laporan-realisasi-anggaran",
    icon: BarChart3,
    path: "/laporan-realisasi-anggaran"
  },
  {
    name: "Laporan",
    href: "/reports",
    icon: FileText,
    path: "/reports"
  },
  {
    name: "Akun Rekening",
    href: "/accounts",
    icon: Settings,
    path: "/accounts"
  }
];

export function Sidebar({ onToggle }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { hasPagePermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (onToggle) {
      onToggle(collapsed);
    }
    // Dispatch custom event for layout to listen
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
      detail: { collapsed } 
    }));
  }, [collapsed, onToggle]);

  const handleToggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Filter navigation based on user permissions
  const filteredNavigation = navigation.filter(item => 
    hasPagePermission(item.path, 'view')
  );

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-50 h-full bg-background border-r transition-all duration-300 ease-linear",
        collapsed ? "w-[70px]" : "w-[250px]",
        isMobile && "shadow-lg"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="font-semibold">SIA RSHD</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCollapsed}
          className={cn("h-8 w-8 p-0", collapsed && "mx-auto")}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed && "justify-center px-2"
                )}
                asChild
              >
                <Link to={item.href}>
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
