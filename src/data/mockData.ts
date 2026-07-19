// Mock data based on the personal finance schema from the PDF

export interface AccountType {
  id: number;
  name: string;
  is_liability: boolean;
}

export interface Account {
  id: number;
  name: string;
  account_type_id: number;
  currency_code: string;
  opening_balance: number;
  current_balance: number;
  is_active: boolean;
  icon: string;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  type: "income" | "expense" | "transfer";
  icon: string;
  color: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  category_id: number;
  payee: string;
  amount: number;
  currency_code: string;
  transaction_date: string;
  memo: string;
  is_reconciled: boolean;
}

export interface BudgetAllocation {
  id: number;
  category_id: number;
  planned_amount: number;
  spent_amount: number;
}

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  icon: string;
}

export const accountTypes: AccountType[] = [
  { id: 1, name: "Checking", is_liability: false },
  { id: 2, name: "Savings", is_liability: false },
  { id: 3, name: "Credit Card", is_liability: true },
  { id: 4, name: "Investment", is_liability: false },
  { id: 5, name: "Cash", is_liability: false },
];

export const accounts: Account[] = [
  { id: 1, name: "Main Checking", account_type_id: 1, currency_code: "USD", opening_balance: 5000, current_balance: 8245.50, is_active: true, icon: "🏦" },
  { id: 2, name: "Emergency Fund", account_type_id: 2, currency_code: "USD", opening_balance: 10000, current_balance: 15320.00, is_active: true, icon: "🛡️" },
  { id: 3, name: "Visa Platinum", account_type_id: 3, currency_code: "USD", opening_balance: 0, current_balance: -2150.75, is_active: true, icon: "💳" },
  { id: 4, name: "Brokerage", account_type_id: 4, currency_code: "USD", opening_balance: 20000, current_balance: 34890.25, is_active: true, icon: "📈" },
  { id: 5, name: "Petty Cash", account_type_id: 5, currency_code: "USD", opening_balance: 200, current_balance: 85.00, is_active: true, icon: "💵" },
];

export const categories: Category[] = [
  { id: 1, parent_id: null, name: "Salary", type: "income", icon: "💼", color: "#22c55e" },
  { id: 2, parent_id: null, name: "Freelance", type: "income", icon: "💻", color: "#10b981" },
  { id: 3, parent_id: null, name: "Investments", type: "income", icon: "📊", color: "#14b8a6" },
  { id: 4, parent_id: null, name: "Housing", type: "expense", icon: "🏠", color: "#ef4444" },
  { id: 5, parent_id: null, name: "Food & Dining", type: "expense", icon: "🍽️", color: "#f97316" },
  { id: 6, parent_id: null, name: "Transportation", type: "expense", icon: "🚗", color: "#eab308" },
  { id: 7, parent_id: null, name: "Utilities", type: "expense", icon: "⚡", color: "#8b5cf6" },
  { id: 8, parent_id: null, name: "Entertainment", type: "expense", icon: "🎬", color: "#ec4899" },
  { id: 9, parent_id: null, name: "Healthcare", type: "expense", icon: "🏥", color: "#06b6d4" },
  { id: 10, parent_id: null, name: "Shopping", type: "expense", icon: "🛍️", color: "#f43f5e" },
  { id: 11, parent_id: null, name: "Subscriptions", type: "expense", icon: "📱", color: "#a855f7" },
  { id: 12, parent_id: null, name: "Transfer", type: "transfer", icon: "🔄", color: "#6b7280" },
];

export const transactions: Transaction[] = [
  { id: 1, account_id: 1, category_id: 1, payee: "Acme Corp", amount: 5200.00, currency_code: "USD", transaction_date: "2026-04-10", memo: "Monthly salary", is_reconciled: true },
  { id: 2, account_id: 1, category_id: 4, payee: "Landlord", amount: -1800.00, currency_code: "USD", transaction_date: "2026-04-05", memo: "April rent", is_reconciled: true },
  { id: 3, account_id: 3, category_id: 5, payee: "Whole Foods", amount: -124.50, currency_code: "USD", transaction_date: "2026-04-09", memo: "Weekly groceries", is_reconciled: false },
  { id: 4, account_id: 1, category_id: 6, payee: "Shell Gas", amount: -65.00, currency_code: "USD", transaction_date: "2026-04-08", memo: "Fuel", is_reconciled: false },
  { id: 5, account_id: 3, category_id: 8, payee: "Netflix", amount: -15.99, currency_code: "USD", transaction_date: "2026-04-07", memo: "Monthly subscription", is_reconciled: true },
  { id: 6, account_id: 1, category_id: 7, payee: "Electric Co", amount: -142.30, currency_code: "USD", transaction_date: "2026-04-06", memo: "Electricity bill", is_reconciled: true },
  { id: 7, account_id: 3, category_id: 10, payee: "Amazon", amount: -89.99, currency_code: "USD", transaction_date: "2026-04-05", memo: "Headphones", is_reconciled: false },
  { id: 8, account_id: 1, category_id: 2, payee: "Client XYZ", amount: 1500.00, currency_code: "USD", transaction_date: "2026-04-04", memo: "Web design project", is_reconciled: true },
  { id: 9, account_id: 1, category_id: 9, payee: "Dr. Smith", amount: -75.00, currency_code: "USD", transaction_date: "2026-04-03", memo: "Checkup", is_reconciled: true },
  { id: 10, account_id: 3, category_id: 5, payee: "Chipotle", amount: -18.50, currency_code: "USD", transaction_date: "2026-04-02", memo: "Lunch", is_reconciled: false },
  { id: 11, account_id: 1, category_id: 11, payee: "Spotify", amount: -9.99, currency_code: "USD", transaction_date: "2026-04-01", memo: "Music subscription", is_reconciled: true },
  { id: 12, account_id: 4, category_id: 3, payee: "Dividends", amount: 320.00, currency_code: "USD", transaction_date: "2026-04-01", memo: "Q1 dividend payout", is_reconciled: true },
  { id: 13, account_id: 1, category_id: 5, payee: "Trader Joe's", amount: -67.80, currency_code: "USD", transaction_date: "2026-03-30", memo: "Groceries", is_reconciled: true },
  { id: 14, account_id: 3, category_id: 8, payee: "AMC Theater", amount: -32.00, currency_code: "USD", transaction_date: "2026-03-29", memo: "Movie night", is_reconciled: true },
  { id: 15, account_id: 1, category_id: 6, payee: "Uber", amount: -24.50, currency_code: "USD", transaction_date: "2026-03-28", memo: "Ride to airport", is_reconciled: true },
];

export const budgetAllocations: BudgetAllocation[] = [
  { id: 1, category_id: 4, planned_amount: 1800, spent_amount: 1800 },
  { id: 2, category_id: 5, planned_amount: 600, spent_amount: 210.80 },
  { id: 3, category_id: 6, planned_amount: 300, spent_amount: 89.50 },
  { id: 4, category_id: 7, planned_amount: 200, spent_amount: 142.30 },
  { id: 5, category_id: 8, planned_amount: 150, spent_amount: 47.99 },
  { id: 6, category_id: 9, planned_amount: 200, spent_amount: 75.00 },
  { id: 7, category_id: 10, planned_amount: 250, spent_amount: 89.99 },
  { id: 8, category_id: 11, planned_amount: 50, spent_amount: 25.98 },
];

export const savingsGoals: SavingsGoal[] = [
  { id: 1, name: "Emergency Fund", target_amount: 20000, current_amount: 15320, target_date: "2026-12-31", icon: "🛡️" },
  { id: 2, name: "Vacation", target_amount: 5000, current_amount: 2100, target_date: "2026-08-01", icon: "✈️" },
  { id: 3, name: "New Car", target_amount: 35000, current_amount: 8500, target_date: "2027-06-01", icon: "🚗" },
];

// Helpers
export const getAccountType = (id: number) => accountTypes.find(t => t.id === id);
export const getCategory = (id: number) => categories.find(c => c.id === id);
export const getAccount = (id: number) => accounts.find(a => a.id === id);

export const totalBalance = accounts.reduce((sum, a) => sum + a.current_balance, 0);
export const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
export const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

export const spendingByCategory = categories
  .filter(c => c.type === "expense")
  .map(c => ({
    ...c,
    total: transactions.filter(t => t.category_id === c.id && t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
  }))
  .filter(c => c.total > 0)
  .sort((a, b) => b.total - a.total);

export const monthlyData = [
  { month: "Nov", income: 5800, expenses: 3200 },
  { month: "Dec", income: 6100, expenses: 4500 },
  { month: "Jan", income: 5500, expenses: 3100 },
  { month: "Feb", income: 5900, expenses: 3400 },
  { month: "Mar", income: 6700, expenses: 3800 },
  { month: "Apr", income: 7020, expenses: 2465.57 },
];
