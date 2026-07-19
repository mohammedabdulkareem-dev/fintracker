import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

const PLAID_ENV = Deno.env.get("PLAID_ENV") || "sandbox";
const PLAID_BASE_URL = PLAID_ENV === "production"
  ? "https://production.plaid.com"
  : PLAID_ENV === "development"
  ? "https://development.plaid.com"
  : "https://sandbox.plaid.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error("Plaid credentials not configured");
    }

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader! } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get all Plaid-connected bank accounts for this user
    const { data: bankAccounts, error: baError } = await supabaseAdmin
      .from("bank_accounts")
      .select("id, plaid_access_token, plaid_account_id")
      .eq("user_id", user.id)
      .not("plaid_access_token", "is", null);

    if (baError) throw new Error(`Failed to fetch bank accounts: ${baError.message}`);
    if (!bankAccounts || bankAccounts.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: "No Plaid-connected accounts found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by access token (multiple accounts can share one)
    const tokenMap = new Map<string, { accessToken: string; accounts: { id: string; plaidAccountId: string }[] }>();
    for (const ba of bankAccounts) {
      const key = ba.plaid_access_token;
      if (!tokenMap.has(key)) {
        tokenMap.set(key, { accessToken: key, accounts: [] });
      }
      tokenMap.get(key)!.accounts.push({ id: ba.id, plaidAccountId: ba.plaid_account_id });
    }

    let totalSynced = 0;

    for (const { accessToken, accounts } of tokenMap.values()) {
      // Pull last 30 days of transactions
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

      const txRes = await fetch(`${PLAID_BASE_URL}/transactions/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          access_token: accessToken,
        }),
      });

      let txData = await txRes.json();

      // Fallback to transactions/get if sync not available
      if (!txRes.ok) {
        const fallbackRes = await fetch(`${PLAID_BASE_URL}/transactions/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: PLAID_CLIENT_ID,
            secret: PLAID_SECRET,
            access_token: accessToken,
            start_date: startDate,
            end_date: endDate,
          }),
        });
        txData = await fallbackRes.json();
        if (!fallbackRes.ok) {
          console.error("Plaid transactions error:", JSON.stringify(txData));
          continue;
        }
      }

      const plaidTransactions = txData.added || txData.transactions || [];
      const plaidAccountIdToDbId = new Map(accounts.map(a => [a.plaidAccountId, a.id]));

      const rows = plaidTransactions
        .filter((tx: any) => plaidAccountIdToDbId.has(tx.account_id))
        .map((tx: any) => ({
          user_id: user.id,
          bank_account_id: plaidAccountIdToDbId.get(tx.account_id),
          plaid_transaction_id: tx.transaction_id,
          name: tx.name || tx.merchant_name || "Unknown",
          merchant_name: tx.merchant_name || null,
          amount: -tx.amount, // Plaid uses positive for debits
          category: tx.category?.[0] || tx.personal_finance_category?.primary || null,
          date: tx.date,
          pending: tx.pending || false,
        }));

      if (rows.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from("transactions")
          .upsert(rows, { onConflict: "plaid_transaction_id" });

        if (insertError) {
          console.error("Insert error:", insertError.message);
        } else {
          totalSynced += rows.length;
        }
      }
    }

    return new Response(JSON.stringify({ synced: totalSynced }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sync transactions error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
