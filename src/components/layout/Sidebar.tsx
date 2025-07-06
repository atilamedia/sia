
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
import { useIsMobile } from "@/hooks/use-mobile";

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
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggle?: (collapsed: boolean) => void;
  onMobileToggle?: (open: boolean) => void;
}

export function Sidebar({ collapsed = false, mobileOpen = false, onToggle, onMobileToggle }: SidebarProps) {
  const location = useLocation();
  const { hasPagePermission, userRole } = useAuth();
  const isMobile = useIsMobile();
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);

  // Sync internal state with props
  useEffect(() => {
    setInternalCollapsed(collapsed);
  }, [collapsed]);

  // Listen for mobile menu toggle events
  useEffect(() => {
    const handleMobileMenuToggle = (event: CustomEvent) => {
      if (onMobileToggle) {
        onMobileToggle(event.detail.open);
      }
    };

    window.addEventListener('mobile-menu-toggle', handleMobileMenuToggle as EventListener);
    
    return () => {
      window.removeEventListener('mobile-menu-toggle', handleMobileMenuToggle as EventListener);
    };
  }, [onMobileToggle]);

  const handleToggle = () => {
    if (isMobile) {
      // On mobile, toggle the mobile menu
      const newOpen = !mobileOpen;
      if (onMobileToggle) {
        onMobileToggle(newOpen);
      }
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
        detail: { open: newOpen } 
      }));
    } else {
      // On desktop/tablet, toggle collapse state
      const newCollapsed = !internalCollapsed;
      setInternalCollapsed(newCollapsed);
      
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
        detail: { collapsed: newCollapsed } 
      }));
      
      if (onToggle) {
        onToggle(newCollapsed);
      }
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

  const sidebarWidth = isMobile 
    ? "w-[250px]" 
    : internalCollapsed 
      ? "w-[70px]" 
      : "w-[250px]";

  const sidebarClasses = cn(
    "fixed left-0 top-0 z-50 h-full bg-card border-r transition-all duration-300 ease-linear",
    sidebarWidth,
    isMobile && !mobileOpen && "-translate-x-full"
  );

  return (
    <div className={sidebarClasses}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b">
          {(!internalCollapsed || isMobile) && (
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
            {internalCollapsed && !isMobile ? (
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
                      internalCollapsed && !isMobile && "px-2"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", (!internalCollapsed || isMobile) && "mr-2")} />
                    {(!internalCollapsed || isMobile) && <span>{item.title}</span>}
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
