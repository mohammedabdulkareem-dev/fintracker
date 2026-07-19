import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

export function useProfile() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) setProfile(data);
    };

    fetchProfile();
  }, [session?.user?.id]);

  return {
    profile,
    email: session?.user?.email ?? null,
    displayName: profile?.display_name || session?.user?.email?.split("@")[0] || "User",
  };
}
