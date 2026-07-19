
-- Add Plaid-specific columns to bank_accounts
ALTER TABLE public.bank_accounts 
ADD COLUMN IF NOT EXISTS plaid_account_id TEXT,
ADD COLUMN IF NOT EXISTS plaid_access_token TEXT,
ADD COLUMN IF NOT EXISTS plaid_item_id TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bank_accounts_plaid_item ON public.bank_accounts(plaid_item_id);
