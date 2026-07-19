import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Search, Check, RefreshCw } from "lucide-react";

interface Transaction {
  id: string;
  name: string;
  merchant_name: string | null;
  amount: number;
  category: string | null;
  date: string;
  pending: boolean;
  bank_account_id: string | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function Transactions() {
  const { session } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .limit(200);
    if (error) {
      toast.error("Failed to load transactions");
    } else {
      setTransactions((data as Transaction[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchTransactions();
  }, [session]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("plaid-sync-transactions");
      if (error) throw new Error(error.message);
      toast.success(`Synced ${data.synced} transaction(s) from Plaid`);
      fetchTransactions();
    } catch (err: any) {
      toast.error("Sync failed: " + err.message);
    }
    setSyncing(false);
  };

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.name.toLowerCase().includes(search.toLowerCase()) ||
      (tx.merchant_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.category || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "income" && tx.amount > 0) ||
      (filter === "expense" && tx.amount < 0);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Real transaction history from your connected banks</p>
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync from Plaid"}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, merchant, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{filtered.length} transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No transactions yet. Connect a bank account and click "Sync from Plaid" to pull transactions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 px-6 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Category</th>
                    <th className="text-right py-3 px-6 font-medium">Amount</th>
                    <th className="text-center py-3 px-4 font-medium hidden lg:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-6 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{tx.name}</p>
                          {tx.merchant_name && tx.merchant_name !== tx.name && (
                            <p className="text-xs text-muted-foreground">{tx.merchant_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-muted-foreground">{tx.category || "Uncategorized"}</span>
                      </td>
                      <td
                        className={`py-3 px-6 text-right font-semibold whitespace-nowrap ${
                          tx.amount > 0 ? "text-income" : "text-expense"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {fmt(tx.amount)}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-center">
                        {tx.pending ? (
                          <Badge variant="outline" className="text-muted-foreground border-border">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-success border-success/30 bg-success/5">
                            <Check className="w-3 h-3" /> Posted
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
