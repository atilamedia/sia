
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ title = "Dashboard", onMenuToggle, isSidebarOpen }: HeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="px-2"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
