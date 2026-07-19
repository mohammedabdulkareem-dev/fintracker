import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";

import {
  totalBalance,
  totalIncome,
  totalExpenses,
  transactions,
  spendingByCategory,
  monthlyData,
  getCategory,
  getAccount,
  savingsGoals,
} from "@/data/mockData";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

const COLORS = [
  "#0f9b8e",
  "#3b82f6",
  "#eab308",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f43f5e",
  "#a855f7",
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  const recentTx = transactions.slice(0, 8);

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Logged in as: {user?.email}
        </p>

        <p className="text-muted-foreground mt-1">
          Your financial overview for April 2026
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Net Worth"
          value={fmt(totalBalance)}
          subtitle="+3.2% from last month"
          icon={DollarSign}
        />

        <StatCard
          title="Income"
          value={fmt(totalIncome)}
          subtitle="This month"
          icon={TrendingUp}
          variant="income"
        />

        <StatCard
          title="Expenses"
          value={fmt(totalExpenses)}
          subtitle="This month"
          icon={TrendingDown}
          variant="expense"
        />

        <StatCard
          title="Savings Rate"
          value={`${Math.round(
            ((totalIncome - totalExpenses) / totalIncome) * 100
          )}%`}
          subtitle="On track"
          icon={PiggyBank}
        />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2 border-border/60 shadow-sm">

          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Income vs Expenses
            </CardTitle>
          </CardHeader>

          <CardContent>

            <ResponsiveContainer width="100%" height={280}>

              <BarChart data={monthlyData} barGap={4}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />

                <Tooltip
                  formatter={(v: number) => fmt(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    fontSize: 13,
                  }}
                />

                <Bar
                  dataKey="income"
                  fill="hsl(var(--success))"
                  radius={[6, 6, 0, 0]}
                  name="Income"
                />

                <Bar
                  dataKey="expenses"
                  fill="hsl(var(--destructive))"
                  radius={[6, 6, 0, 0]}
                  name="Expenses"
                />

              </BarChart>

            </ResponsiveContainer>

          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">

          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Spending by Category
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center">

            <ResponsiveContainer width="100%" height={200}>

              <PieChart>

                <Pie
                  data={spendingByCategory}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >

                  {spendingByCategory.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}

                </Pie>

                <Tooltip
                  formatter={(v: number) => fmt(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    fontSize: 13,
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}