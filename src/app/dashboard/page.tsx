import { getOwnProfile, getOwnWorkSamples } from "@/lib/dal";
import ProfileSection from "@/components/dashboard/ProfileSection";
import WorkSamplesSection from "@/components/dashboard/WorkSamplesSection";
import EmbedSection from "@/components/dashboard/EmbedSection";
import PreviewPanel from "@/components/dashboard/PreviewPanel";
import styles from "@/components/dashboard/widget-ui.module.css";

export default async function DashboardPage() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  const workSamples = await getOwnWorkSamples();

  return (
    <div className={styles.page}>
      <div className={styles.mainCol}>
        <ProfileSection profile={profile} />
        <WorkSamplesSection profileId={profile.id} workSamples={workSamples} />
        <EmbedSection embedKey={profile.embed_key} />
      </div>

      <div className={styles.sideCol}>
        <PreviewPanel
          embedKey={profile.embed_key}
          initialSettings={profile.widget_settings}
        />
      </div>
    </div>
  );
}
