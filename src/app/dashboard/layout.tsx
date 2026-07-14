import { getOwnProfile } from "@/lib/dal";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getOwnProfile();

  if (!profile) {
    return (
      <div className={styles.errorShell}>
        <p className={styles.error}>
          We couldn&apos;t find your profile yet. If you just signed up, give
          it a moment and refresh — otherwise something&apos;s wrong with the
          profile-creation trigger.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
