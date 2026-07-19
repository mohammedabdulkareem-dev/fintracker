import { Card, CardContent } from "@/components/ui/card";
import { accounts, getAccountType, transactions } from "@/data/mockData";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function Accounts() {
  const totalAssets = accounts.filter(a => !getAccountType(a.account_type_id)?.is_liability).reduce((s, a) => s + a.current_balance, 0);
  const totalLiabilities = accounts.filter(a => getAccountType(a.account_type_id)?.is_liability).reduce((s, a) => s + Math.abs(a.current_balance), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <p className="text-muted-foreground mt-1">Manage your financial accounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold text-income mt-1">{fmt(totalAssets)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-2xl font-bold text-expense mt-1">{fmt(totalLiabilities)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p className="text-2xl font-bold mt-1">{fmt(totalAssets - totalLiabilities)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => {
          const type = getAccountType(acc.account_type_id);
          const accTx = transactions.filter(t => t.account_id === acc.id);
          const income = accTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
          const expenses = accTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

          return (
            <Card key={acc.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{acc.icon}</span>
                    <div>
                      <p className="font-semibold">{acc.name}</p>
                      <p className="text-xs text-muted-foreground">{type?.name} · {acc.currency_code}</p>
                    </div>
                  </div>
                  <p className={`text-lg font-bold ${acc.current_balance >= 0 ? "text-foreground" : "text-expense"}`}>
                    {fmt(acc.current_balance)}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-income">
                    <ArrowUpRight className="w-3.5 h-3.5" /> {fmt(income)}
                  </span>
                  <span className="flex items-center gap-1 text-expense">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {fmt(expenses)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
