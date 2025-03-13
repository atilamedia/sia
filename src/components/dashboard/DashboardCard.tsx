
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
    default: "border-violet-200 dark:border-violet-800/40",
    primary: "border-blue-200 dark:border-blue-800/40",
    success: "border-green-200 dark:border-green-800/40",
    warning: "border-amber-200 dark:border-amber-800/40",
    danger: "border-red-200 dark:border-red-800/40",
  };

  const iconVariants = {
    default: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300",
    primary: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    success: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
    danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  };

  const progressVariants = {
    default: "bg-violet-200 dark:bg-violet-700",
    primary: "bg-blue-200 dark:bg-blue-700",
    success: "bg-green-200 dark:bg-green-700",
    warning: "bg-amber-200 dark:bg-amber-700",
    danger: "bg-red-200 dark:bg-red-700",
  };

  const trendColor = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-slate-600 dark:text-slate-400",
  };

  const trendIcon = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        <div
          className={cn(
            "rounded-lg p-2.5",
            iconVariants[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        
        {change && (
          <div className="flex items-center">
            <span className={cn("text-xs font-medium flex items-center gap-0.5", trendColor[trend])}>
              {change}
              <span className="ml-1 text-xs">
                {trendIcon[trend]}
              </span>
            </span>
          </div>
        )}
        
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              progressVariants[variant]
            )}
            style={{ 
              width: trend === "up" ? "65%" : 
                    trend === "down" ? "35%" : "50%" 
            }}
          />
        </div>
      </div>
    </div>
  );
}
