import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserInfo() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
      }

      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="text-lg font-medium">
        Loading user...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        User Info
      </h1>

      <Card>

        <CardHeader>
          <CardTitle>
            Logged-in User
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">

          <p>
            <b>Email:</b> {user?.email || "No user found"}
          </p>

          <p>
            <b>User ID:</b> {user?.id || "No user found"}
          </p>

        </CardContent>

      </Card>

    </div>
  );
}