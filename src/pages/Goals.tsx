import { Card, CardContent } from "@/components/ui/card";
import { savingsGoals } from "@/data/mockData";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function Goals() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Savings Goals</h1>
        <p className="text-muted-foreground mt-1">Track your progress toward financial goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((g) => {
          const pct = Math.round((g.current_amount / g.target_amount) * 100);
          const remaining = g.target_amount - g.current_amount;
          return (
            <Card key={g.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <p className="font-semibold text-lg">{g.name}</p>
                    <p className="text-xs text-muted-foreground">Target: {g.target_date}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fmt(g.current_amount)}</span>
                    <span className="text-muted-foreground">{fmt(g.target_amount)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{pct}% complete · {fmt(remaining)} to go</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
