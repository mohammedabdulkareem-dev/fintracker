import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserInfo() {
  const { profile, loading, updateProfile } = useProfile();

  const [email, setEmail] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return <div className="text-xl">Loading profile...</div>;
  }

  if (!profile) {
    return <div>No profile found.</div>;
  }

  const handleSave = async () => {
    await updateProfile({
      full_name: fullName || profile.full_name,
      phone: phone || profile.phone,
    });

    alert("Profile updated successfully!");
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const fileExt = file.name.split(".").pop();

    const fileName = `${profile.id}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      alert(error.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    await updateProfile({
      avatar_url: publicUrl,
    });

    alert("Avatar updated!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <Card>
        <CardHeader className="items-center">
          <Avatar className="w-32 h-32">
            <AvatarImage src={profile.avatar_url ?? ""} />
            <AvatarFallback>
              {profile.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
          />
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <label>Email</label>
            <Input value={email} disabled />
          </div>

          <div>
            <label>Full Name</label>

            <Input
              placeholder={profile.full_name || "Enter your name"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label>Phone</label>

            <Input
              placeholder={profile.phone || "Enter phone number"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label>Joined</label>

            <Input
              value={new Date(profile.created_at).toLocaleDateString()}
              disabled
            />
          </div>

          <Button onClick={handleSave}>
            Save Profile
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}