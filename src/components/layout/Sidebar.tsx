
import { cn } from "@/lib/utils";
import { 
  Home, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  BookOpen, 
  Users, 
  BarChart3,
  Calculator,
  FileText,
  Menu,
  X
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Arus Kas", href: "/cash-flow", icon: TrendingUp },
  { name: "Kas Masuk", href: "/cash-in", icon: ArrowUp },
  { name: "Kas Keluar", href: "/cash-out", icon: ArrowDown },
  { name: "Jurnal", href: "/journal", icon: BookOpen },
  { name: "Akun", href: "/accounts", icon: Users },
  { name: "Laporan", href: "/reports", icon: BarChart3 },
  { name: "Buku Kas Umum", href: "/buku-kas-umum", icon: Calculator },
  { name: "LRA", href: "/laporan-realisasi-anggaran", icon: FileText },
];

export function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out z-40",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6 border-b border-border">
            <h1 className="text-xl font-semibold">SIA Keuangan</h1>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content spacer for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}
