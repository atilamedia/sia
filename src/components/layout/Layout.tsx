
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

  // Auto-collapse sidebar on tablet view (768px - 1024px)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width < 1024) {
        // Tablet view - auto collapse
        setSidebarCollapsed(true);
      } else if (width >= 1024) {
        // Desktop view - expand by default
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      if (isMobile) {
        setSidebarOpen(event.detail.open);
      } else {
        setSidebarCollapsed(event.detail.collapsed);
      }
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, [isMobile]);

  const handleMobileMenuToggle = () => {
    if (isMobile) {
      const newOpen = !sidebarOpen;
      setSidebarOpen(newOpen);
      // Dispatch event for sidebar to listen to
      window.dispatchEvent(new CustomEvent('mobile-menu-toggle', { 
        detail: { open: newOpen } 
      }));
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50" 
          onClick={() => handleMobileMenuToggle()}
        />
      )}
      
      <Sidebar 
        collapsed={sidebarCollapsed} 
        mobileOpen={sidebarOpen}
        onToggle={setSidebarCollapsed}
        onMobileToggle={setSidebarOpen}
      />
      
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
