import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppLayout from "@/components/AppLayout";

import Dashboard from "@/pages/Dashboard";
import Accounts from "@/pages/Accounts";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Goals from "@/pages/Goals";
import Advisor from "@/pages/Advisor";
import BankAccounts from "@/pages/BankAccounts";
import Auth from "@/pages/Auth";
import UserInfo from "./pages/UserInfo";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/" element={<Auth />} />
      <Route path="/auth" element={<Auth />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />

      {/* User Info */}
      <Route
        path="/user"
        element={
          <AppLayout>
            <UserInfo />
          </AppLayout>
        }
      />

      {/* Accounts */}
      <Route
        path="/accounts"
        element={
          <AppLayout>
            <Accounts />
          </AppLayout>
        }
      />

      {/* Bank Accounts */}
      <Route
        path="/bank-accounts"
        element={
          <AppLayout>
            <BankAccounts />
          </AppLayout>
        }
      />

      {/* Transactions */}
      <Route
        path="/transactions"
        element={
          <AppLayout>
            <Transactions />
          </AppLayout>
        }
      />

      {/* Budgets */}
      <Route
        path="/budgets"
        element={
          <AppLayout>
            <Budgets />
          </AppLayout>
        }
      />

      {/* Goals */}
      <Route
        path="/goals"
        element={
          <AppLayout>
            <Goals />
          </AppLayout>
        }
      />

      {/* Advisor */}
      <Route
        path="/advisor"
        element={
          <AppLayout>
            <Advisor />
          </AppLayout>
        }
      />

    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;