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

export type WidgetSettings = {
  theme: "light" | "dark";
  cornerRadius: number;
  shadow: boolean;
};

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  embed_key: string;
  widget_settings: WidgetSettings | null;
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

export const getOwnConnectionsData = cache(async () => {
  const profile = await getOwnProfile();
  if (!profile) return { incoming: [], outgoing: [], accepted: [] };
  const myId = profile.id;

  const supabase = await createClient();
  const { data: requests, error } = await supabase
    .from("connection_requests")
    .select("*")
    .or(`requester_id.eq.${myId},recipient_id.eq.${myId}`);
  if (error) throw error;

  const otherIds = Array.from(
    new Set(
      (requests ?? []).map((r) =>
        r.requester_id === myId ? r.recipient_id : r.requester_id,
      ),
    ),
  );

  const [profilesRes, notesRes, endorsementsRes] = await Promise.all([
    otherIds.length
      ? supabase.from("profiles").select("id, name, avatar_url").in("id", otherIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("connection_notes").select("*").eq("profile_id", myId),
    supabase.from("endorsements").select("*").eq("from_profile_id", myId),
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (notesRes.error) throw notesRes.error;
  if (endorsementsRes.error) throw endorsementsRes.error;

  const profileById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
  const noteByRequestId = new Map(
    (notesRes.data ?? []).map((n) => [n.connection_request_id, n.note]),
  );
  const endorsementByToId = new Map(
    (endorsementsRes.data ?? []).map((e) => [e.to_profile_id, e.text]),
  );

  const incoming = (requests ?? [])
    .filter((r) => r.recipient_id === myId && r.status === "pending")
    .map((r) => ({ request: r, other: profileById.get(r.requester_id) }));

  const outgoing = (requests ?? [])
    .filter((r) => r.requester_id === myId && r.status === "pending")
    .map((r) => ({ request: r, other: profileById.get(r.recipient_id) }));

  const accepted = (requests ?? [])
    .filter((r) => r.status === "accepted")
    .map((r) => {
      const otherId = r.requester_id === myId ? r.recipient_id : r.requester_id;
      return {
        request: r,
        other: profileById.get(otherId),
        note: noteByRequestId.get(r.id) ?? "",
        endorsement: endorsementByToId.get(otherId) ?? "",
      };
    });

  return { incoming, outgoing, accepted };
});

export type DirectoryEntry = {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  status: "not_connected" | "pending_outgoing" | "pending_incoming" | "connected";
};

export const getNetworkDirectory = cache(async (): Promise<DirectoryEntry[]> => {
  const me = await getOwnProfile();
  if (!me) return [];

  const supabase = await createClient();
  const [{ data: allProfiles, error }, connections] = await Promise.all([
    supabase.from("profiles").select("id, name, bio, avatar_url").order("name"),
    getOwnConnectionsData(),
  ]);
  if (error) throw error;

  const statusById = new Map<string, DirectoryEntry["status"]>();
  connections.incoming.forEach(({ other }) => {
    if (other) statusById.set(other.id, "pending_incoming");
  });
  connections.outgoing.forEach(({ other }) => {
    if (other) statusById.set(other.id, "pending_outgoing");
  });
  connections.accepted.forEach(({ other }) => {
    if (other) statusById.set(other.id, "connected");
  });

  return (allProfiles ?? [])
    .filter((p) => p.id !== me.id)
    .map((p) => ({ ...p, status: statusById.get(p.id) ?? "not_connected" }));
});
