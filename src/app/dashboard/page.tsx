import { getOwnProfile } from "@/lib/dal";
import NetworkWidget from "@/components/NetworkWidget";

export default async function DashboardOverview() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  return (
    <div>
      <h1>Welcome, {profile.name}</h1>
      <p style={{ color: "#666", marginTop: 4 }}>{profile.bio}</p>
      <p style={{ color: "#666", marginTop: 24, fontSize: 13 }}>
        This is a live preview of the widget exactly as it will appear on
        your own site once embedded.
      </p>
      <NetworkWidget embedKey={profile.embed_key} />
    </div>
  );
}
