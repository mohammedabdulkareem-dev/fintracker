import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trash2, Building2, Star, Link, RefreshCw } from "lucide-react";

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string | null;
  account_type: string;
  balance: number;
  is_primary: boolean;
  plaid_account_id: string | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function BankAccounts() {
  const { session } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .order("is_primary", { ascending: false });
    if (error) {
      toast.error("Failed to load bank accounts");
    } else {
      setAccounts((data as BankAccount[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchAccounts();
  }, [session]);

  // Load Plaid Link script
  useEffect(() => {
    if (document.getElementById("plaid-link-script")) return;
    const script = document.createElement("script");
    script.id = "plaid-link-script";
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const handleConnectBank = useCallback(async () => {
    if (!session) return;
    setConnecting(true);

    try {
      // 1. Get link token from our edge function
      const { data, error } = await supabase.functions.invoke("plaid-create-link-token");
      if (error || !data?.link_token) {
        throw new Error(error?.message || "Failed to create link token");
      }

      // 2. Open Plaid Link
      const handler = (window as any).Plaid.create({
        token: data.link_token,
        onSuccess: async (publicToken: string) => {
          try {
            toast.info("Connecting your bank accounts...");
            const { data: exchangeData, error: exchangeError } = await supabase.functions.invoke(
              "plaid-exchange-token",
              { body: { public_token: publicToken } }
            );
            if (exchangeError) throw new Error(exchangeError.message);
            toast.success(`${exchangeData.accounts_added} account(s) connected!`);
            fetchAccounts();
          } catch (err: any) {
            toast.error("Failed to connect bank: " + err.message);
          }
          setConnecting(false);
        },
        onExit: () => {
          setConnecting(false);
        },
      });
      handler.open();
    } catch (err: any) {
      toast.error(err.message);
      setConnecting(false);
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete account");
    } else {
      toast.success("Account removed");
      fetchAccounts();
    }
  };

  const handleSetPrimary = async (id: string) => {
    await supabase.from("bank_accounts").update({ is_primary: false }).neq("id", id);
    await supabase.from("bank_accounts").update({ is_primary: true }).eq("id", id);
    fetchAccounts();
  };

  const maskAccount = (num: string) => {
    if (num.length <= 4) return num;
    return "••••" + num.slice(-4);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground mt-1">Connect your real bank accounts via Plaid</p>
        </div>
        <Button onClick={handleConnectBank} disabled={connecting}>
          {connecting ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Link className="w-4 h-4 mr-2" />
          )}
          {connecting ? "Connecting..." : "Connect Bank"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No bank accounts connected</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Click "Connect Bank" to securely link your real bank accounts via Plaid.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <Card key={acc.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        {acc.bank_name}
                        {acc.is_primary && <Star className="w-3.5 h-3.5 text-warning fill-warning" />}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {acc.account_type} · {acc.plaid_account_id ? "Plaid Connected" : acc.ifsc_code}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">{fmt(acc.balance)}</p>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>A/C: {maskAccount(acc.account_number)}</p>
                  {acc.account_holder_name && <p>Holder: {acc.account_holder_name}</p>}
                </div>
                <div className="flex gap-2">
                  {!acc.is_primary && (
                    <Button variant="outline" size="sm" onClick={() => handleSetPrimary(acc.id)}>
                      <Star className="w-3.5 h-3.5 mr-1" /> Set Primary
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(acc.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
