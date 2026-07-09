import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const requireSessionUser = cache(async () => {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return user;
});

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  embed_key: string;
};

export const getOwnProfile = cache(async () => {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
});

export type WorkSample = {
  id: string;
  profile_id: string;
  url: string;
  sort_order: number;
};

export const getOwnWorkSamples = cache(async () => {
  const profile = await getOwnProfile();
  if (!profile) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_samples")
    .select("*")
    .eq("profile_id", profile.id)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as WorkSample[];
});
