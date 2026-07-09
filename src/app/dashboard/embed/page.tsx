import { getOwnProfile } from "@/lib/dal";
import EmbedSnippet from "./EmbedSnippet";

export default async function EmbedPage() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  return (
    <div>
      <h1>Embed code</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Copy this snippet onto your own site to show your network widget
        there.
      </p>
      <EmbedSnippet embedKey={profile.embed_key} />
    </div>
  );
}
