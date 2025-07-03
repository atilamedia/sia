
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title = "Dashboard" }: LayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar onCollapsedChange={setSidebarCollapsed} />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isMobile 
          ? "ml-0" 
          : sidebarCollapsed 
            ? "ml-[70px]" 
            : "ml-[250px]"
      )}>
        <Header title={title} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className={cn(
            "max-w-full transition-all duration-300",
            !isMobile && sidebarCollapsed && "max-w-[calc(100vw-90px)]",
            !isMobile && !sidebarCollapsed && "max-w-[calc(100vw-270px)]"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
