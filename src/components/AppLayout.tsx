import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  Target,
  Bot,
  Menu,
  X,
  LogOut,
  Building2,
  User,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/bank-accounts", label: "Bank Accounts", icon: Building2 },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: PieChart },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/advisor", label: "AI Advisor", icon: Bot },
  { to: "/user", label: "User Info", icon: User },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const { displayName, email } = useProfile();

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >

        <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-border">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-lg">
              $
            </div>

            <span className="text-lg font-bold tracking-tight">
              FinTracker
            </span>

          </div>

          <ThemeToggle />

        </div>

        <nav className="flex flex-col gap-1 p-4">

          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;

            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >

                <Icon className="w-5 h-5" />

                {label}

              </Link>
            );
          })}

        </nav>

        <div className="mt-auto border-t border-sidebar-border">

          {/* User Info Clickable */}
          <Link
            to="/user"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-6 py-4 hover:bg-sidebar-accent/50 transition-colors"
          >

            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">

              <User className="w-4 h-4 text-sidebar-foreground" />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-medium truncate text-sidebar-foreground">
                {displayName || "User"}
              </p>

              {email && (
                <p className="text-xs truncate text-sidebar-foreground/50">
                  {email}
                </p>
              )}

            </div>

          </Link>

          {/* Logout */}
          <div className="px-4 pb-4">

            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
            >

              <LogOut className="w-5 h-5" />

              Sign out

            </button>

          </div>

        </div>

      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border lg:hidden">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-muted"
            >

              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}

            </button>

            <span className="font-bold text-lg">
              FinTracker
            </span>

          </div>

          <ThemeToggle />

        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  );
}