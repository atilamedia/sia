
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

export function Header({ title }: { title: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30 transition-all duration-200">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
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
        
        {/* Date display */}
        <div className="hidden md:flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-muted/80 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        {/* User menu */}
        <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-muted/80 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
