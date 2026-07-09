const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fetchJSON(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

function fetchWorkSamples(profileId: string) {
  return fetchJSON(
    `work_samples?profile_id=eq.${profileId}&select=*&order=sort_order`,
  );
}

async function buildConnections(profile: { id: string }) {
  const reqFilter =
    `connection_requests?status=eq.accepted&or=(requester_id.eq.${profile.id},recipient_id.eq.${profile.id})&select=*`;
  const requests = await fetchJSON(reqFilter);
  if (!requests.length) return [];

  const otherIds = requests.map((r: { requester_id: string; recipient_id: string }) =>
    r.requester_id === profile.id ? r.recipient_id : r.requester_id,
  );
  const idList = otherIds.join(",");
  const requestIds = requests.map((r: { id: string }) => r.id).join(",");

  const [otherProfiles, endorsements, myNotes, allWorkSamples] =
    await Promise.all([
      fetchJSON(`profiles?id=in.(${idList})&select=*`),
      fetchJSON(
        `endorsements?to_profile_id=eq.${profile.id}&from_profile_id=in.(${idList})&select=*`,
      ),
      fetchJSON(
        `connection_notes?connection_request_id=in.(${requestIds})&profile_id=eq.${profile.id}&select=*`,
      ),
      fetchJSON(`work_samples?profile_id=in.(${idList})&select=*&order=sort_order`),
    ]);

  return otherProfiles.map((other: { id: string; name: string; bio: string; website: string; avatar_url: string }) => {
    const req = requests.find(
      (r: { requester_id: string; recipient_id: string }) =>
        r.requester_id === other.id || r.recipient_id === other.id,
    );
    const end = endorsements.find(
      (e: { from_profile_id: string }) => e.from_profile_id === other.id,
    );
    const myNote = req
      ? myNotes.find(
          (n: { connection_request_id: string }) =>
            n.connection_request_id === req.id,
        )
      : null;
    const samples = allWorkSamples.filter(
      (w: { profile_id: string }) => w.profile_id === other.id,
    );
    return {
      id: other.id,
      name: other.name,
      role: "connection",
      bio: other.bio,
      website: other.website,
      avatar_url: other.avatar_url,
      relationship: myNote ? myNote.note : "",
      endorsement: end ? end.text : "",
      workSamples: samples,
    };
  });
}

export async function fetchWidgetData(embedKey: string) {
  const profiles = await fetchJSON(
    `profiles?embed_key=eq.${encodeURIComponent(embedKey)}&select=*`,
  );
  if (!profiles.length) {
    throw new Error("No profile found with that embed_key.");
  }
  const profile = profiles[0];

  const [connections, workSamples] = await Promise.all([
    buildConnections(profile),
    fetchWorkSamples(profile.id),
  ]);

  profile.workSamples = workSamples;
  return { profile, connections };
}
