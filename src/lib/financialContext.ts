import {
  transactions, accounts, categories, budgetAllocations,
  savingsGoals, totalBalance, totalIncome, totalExpenses,
  spendingByCategory, getCategory, getAccount, getAccountType,
} from "@/data/mockData";

export function buildFinancialContext(): string {
  const fmt = (n: number) => `$${Math.abs(n).toFixed(2)}`;

  const accountSummary = accounts
    .map(a => `- ${a.name} (${getAccountType(a.account_type_id)?.name}): ${fmt(a.current_balance)}`)
    .join("\n");

  const recentTx = transactions.slice(0, 15).map(tx => {
    const cat = getCategory(tx.category_id);
    const acc = getAccount(tx.account_id);
    return `- ${tx.transaction_date}: ${tx.payee} | ${cat?.name} | ${tx.amount > 0 ? "+" : ""}${fmt(tx.amount)} | ${acc?.name}`;
  }).join("\n");

  const spending = spendingByCategory
    .map(c => `- ${c.name}: ${fmt(c.total)}`)
    .join("\n");

  const budgets = budgetAllocations.map(b => {
    const cat = getCategory(b.category_id);
    const pct = Math.round((b.spent_amount / b.planned_amount) * 100);
    return `- ${cat?.name}: ${fmt(b.spent_amount)} / ${fmt(b.planned_amount)} (${pct}% used)`;
  }).join("\n");

  const goals = savingsGoals.map(g => {
    const pct = Math.round((g.current_amount / g.target_amount) * 100);
    return `- ${g.name}: ${fmt(g.current_amount)} / ${fmt(g.target_amount)} (${pct}%) — target: ${g.target_date}`;
  }).join("\n");

  const savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);

  return `### Overview (April 2026)
- Net Worth: ${fmt(totalBalance)}
- Monthly Income: ${fmt(totalIncome)}
- Monthly Expenses: ${fmt(totalExpenses)}
- Savings Rate: ${savingsRate}%

### Accounts
${accountSummary}

### Recent Transactions
${recentTx}

### Spending by Category
${spending}

### Budget Status
${budgets}

### Savings Goals
${goals}`;
}
