
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title = "Dashboard" }: LayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, []);

  const handleMobileMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={cn(
        "transition-transform duration-300 ease-linear",
        isMobile && !sidebarOpen && "-translate-x-full"
      )}>
        <Sidebar onToggle={setSidebarCollapsed} />
      </div>
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-linear",
        isMobile 
          ? "ml-0" 
          : sidebarCollapsed 
            ? "ml-[70px]" 
            : "ml-[250px]"
      )}>
        <Header 
          title={title} 
          onMenuToggle={handleMobileMenuToggle}
          isSidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
