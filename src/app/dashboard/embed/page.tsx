import { getOwnProfile } from "@/lib/dal";
import EmbedDesigner from "@/components/dashboard/EmbedDesigner";
import styles from "@/components/dashboard/widget-ui.module.css";

export default async function EmbedPage() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  return (
    <>
      <p className={styles.pageHeading}>Embed</p>
      <EmbedDesigner embedKey={profile.embed_key} initialSettings={profile.widget_settings} />
    </>
  );
}
