import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    let { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
    }

    if (!data) {
      const { data: createdProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "",
          phone: "",
          avatar_url:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            "",
        })
        .select()
        .single();

      if (insertError) {
        console.error(insertError);
        setLoading(false);
        return;
      }

      data = createdProfile;
    }

    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProfile(data);
  };

  return {
    profile,
    loading,
    refresh: loadProfile,
    updateProfile,
  };
}