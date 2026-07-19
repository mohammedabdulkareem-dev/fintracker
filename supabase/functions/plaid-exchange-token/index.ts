import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";
import { z } from "npm:zod";

const PLAID_ENV = Deno.env.get("PLAID_ENV") || "sandbox";
const PLAID_BASE_URL = PLAID_ENV === "production"
  ? "https://production.plaid.com"
  : PLAID_ENV === "development"
  ? "https://development.plaid.com"
  : "https://sandbox.plaid.com";

const BodySchema = z.object({
  public_token: z.string().min(1),
});

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

    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUserClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader! } },
    });
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange public token for access token
    const exchangeRes = await fetch(`${PLAID_BASE_URL}/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token: parsed.data.public_token,
      }),
    });
    const exchangeData = await exchangeRes.json();
    if (!exchangeRes.ok) {
      throw new Error(`Plaid exchange error: ${JSON.stringify(exchangeData)}`);
    }

    const accessToken = exchangeData.access_token;
    const itemId = exchangeData.item_id;

    // Get accounts from Plaid
    const accountsRes = await fetch(`${PLAID_BASE_URL}/accounts/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: accessToken,
      }),
    });
    const accountsData = await accountsRes.json();
    if (!accountsRes.ok) {
      throw new Error(`Plaid accounts error: ${JSON.stringify(accountsData)}`);
    }

    // Store accounts in DB using service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const institution = accountsData.item?.institution_id || "Unknown Bank";

    // Get institution name
    let bankName = "Connected Bank";
    try {
      const instRes = await fetch(`${PLAID_BASE_URL}/institutions/get_by_id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          institution_id: institution,
          country_codes: ["US"],
        }),
      });
      const instData = await instRes.json();
      if (instRes.ok && instData.institution) {
        bankName = instData.institution.name;
      }
    } catch { /* use default */ }

    const insertRows = accountsData.accounts.map((acc: any, i: number) => ({
      user_id: user.id,
      bank_name: bankName,
      account_number: acc.mask || acc.account_id.slice(-4),
      ifsc_code: acc.subtype || "N/A",
      account_holder_name: acc.name || acc.official_name || null,
      account_type: acc.type === "depository" ? "Savings" : acc.type === "credit" ? "Credit" : acc.type,
      balance: acc.balances?.current || 0,
      is_primary: i === 0,
      plaid_account_id: acc.account_id,
      plaid_access_token: accessToken,
      plaid_item_id: itemId,
    }));

    const { error: insertError } = await supabaseAdmin.from("bank_accounts").insert(insertRows);
    if (insertError) {
      throw new Error(`DB insert error: ${insertError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      accounts_added: insertRows.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error exchanging token:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
