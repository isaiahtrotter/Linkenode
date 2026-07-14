import { getOwnProfile } from "@/lib/dal";
import EmbedDesigner from "@/components/dashboard/EmbedDesigner";

export default async function EmbedPage() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  return (
    <EmbedDesigner embedKey={profile.embed_key} initialSettings={profile.widget_settings} />
  );
}
