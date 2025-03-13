
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  variant = "default",
  className,
}: DashboardCardProps) {
  const variantStyles = {
    default: "bg-card text-card-foreground",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-red-50 text-red-700 border-red-100",
  };

  const trendColor = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-semibold tracking-tight">{value}</h3>
        </div>
        <div
          className={cn(
            "rounded-lg p-2",
            variant === "default" ? "bg-muted/50" : "bg-background/25"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {change && (
        <div className="absolute bottom-6 left-6">
          <p className={cn("flex items-center text-xs font-medium", trendColor[trend])}>
            {change}
            <span className="ml-1">
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "neutral" && "→"}
            </span>
          </p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-1">
        <div
          className={cn(
            "h-full transition-all duration-500",
            variant === "primary" && "bg-primary/30",
            variant === "success" && "bg-green-400",
            variant === "warning" && "bg-amber-400",
            variant === "danger" && "bg-red-400",
            variant === "default" && "bg-primary/20"
          )}
          style={{ width: "40%" }}
        />
      </div>
    </div>
  );
}
