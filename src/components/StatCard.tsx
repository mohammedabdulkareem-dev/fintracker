import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "income" | "expense";
}

export default function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) {
  const iconBg = variant === "income"
    ? "bg-success/10 text-success"
    : variant === "expense"
    ? "bg-destructive/10 text-destructive"
    : "bg-primary/10 text-primary";

  return (
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex items-start gap-4 p-5">
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
