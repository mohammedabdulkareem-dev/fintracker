import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { budgetAllocations, getCategory } from "@/data/mockData";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function Budgets() {
  const totalPlanned = budgetAllocations.reduce((s, b) => s + b.planned_amount, 0);
  const totalSpent = budgetAllocations.reduce((s, b) => s + b.spent_amount, 0);
  const totalRemaining = totalPlanned - totalSpent;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        <p className="text-muted-foreground mt-1">April 2026 budget overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold mt-1">{fmt(totalPlanned)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="text-2xl font-bold text-expense mt-1">{fmt(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold text-income mt-1">{fmt(totalRemaining)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Category Budgets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {budgetAllocations.map((b) => {
            const cat = getCategory(b.category_id);
            const pct = Math.min(Math.round((b.spent_amount / b.planned_amount) * 100), 100);
            const over = b.spent_amount > b.planned_amount;
            return (
              <div key={b.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span>{cat?.icon}</span> {cat?.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {fmt(b.spent_amount)} / {fmt(b.planned_amount)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${over ? "bg-destructive" : pct > 75 ? "bg-warning" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{pct}% used</span>
                  <span>{fmt(b.planned_amount - b.spent_amount)} left</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
