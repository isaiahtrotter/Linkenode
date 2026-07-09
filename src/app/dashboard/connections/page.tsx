import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/dal";
import ConnectionsClient from "./ConnectionsClient";

async function getConnectionsData(myId: string) {
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

  const [profilesRes, notesRes] = await Promise.all([
    otherIds.length
      ? supabase.from("profiles").select("id, name, avatar_url").in("id", otherIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("connection_notes")
      .select("*")
      .eq("profile_id", myId),
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (notesRes.error) throw notesRes.error;

  const profileById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
  const noteByRequestId = new Map(
    (notesRes.data ?? []).map((n) => [n.connection_request_id, n.note]),
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
      };
    });

  return { incoming, outgoing, accepted };
}

export default async function ConnectionsPage() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  const { incoming, outgoing, accepted } = await getConnectionsData(profile.id);

  return (
    <ConnectionsClient incoming={incoming} outgoing={outgoing} accepted={accepted} />
  );
}
