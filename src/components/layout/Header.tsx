
import { useState } from "react";
import { 
  Bell, 
  Search, 
  User,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header({ title }: { title: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30 transition-all duration-200">
      <div className="flex items-center">
        <h1 className={cn(
          "font-semibold tracking-tight",
          isMobile ? "text-lg ml-10" : "text-xl"
        )}>
          {title}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search - Hidden on mobile */}
        {!isMobile && (
          <div className="relative">
            <div 
              className={cn(
                "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none",
                searchOpen ? "opacity-100" : "opacity-0"
              )}
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Cari..."
              className={cn(
                "transition-all duration-300 ease-in-out bg-muted/50 border-0 rounded-full focus:ring-1 focus:ring-primary",
                searchOpen 
                  ? "w-64 pl-10 pr-3 py-2 opacity-100" 
                  : "w-9 h-9 p-2 opacity-70 cursor-pointer"
              )}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
            <div 
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                searchOpen ? "opacity-0" : "opacity-100"
              )}
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}
        
        {/* Date display - Hidden on mobile */}
        {!isMobile && (
          <div className="hidden lg:flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
          </div>
        )}
        
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-muted/80 transition-colors">
          <Bell className={cn("w-5 h-5", isMobile && "w-4 h-4")} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        {/* User menu */}
        <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-muted/80 transition-colors">
          <div className={cn(
            "rounded-full bg-primary/10 flex items-center justify-center text-primary",
            isMobile ? "w-7 h-7" : "w-8 h-8"
          )}>
            <User className={cn("w-4 h-4", isMobile && "w-3 h-3")} />
          </div>
        </button>
      </div>
    </header>
  );
}
