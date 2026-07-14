import { getOwnProfile, getOwnWorkSamples } from "@/lib/dal";
import ProfileSection from "@/components/dashboard/ProfileSection";
import WorkSamplesSection from "@/components/dashboard/WorkSamplesSection";
import styles from "@/components/dashboard/widget-ui.module.css";

export default async function DashboardPage() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  const workSamples = await getOwnWorkSamples();

  return (
    <div className={styles.page}>
      <div className={styles.mainCol}>
        <ProfileSection profile={profile} />
      </div>

      <div className={styles.mainCol}>
        <WorkSamplesSection profileId={profile.id} workSamples={workSamples} />
      </div>
    </div>
  );
}
