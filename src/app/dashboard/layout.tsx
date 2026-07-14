import { getOwnProfile } from "@/lib/dal";
import { signOut } from "./actions";
import DashboardNav from "@/components/dashboard/DashboardNav";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getOwnProfile();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarBrandIcon}>W</span>
          <span className={styles.sidebarBrandText}>Worked Together</span>
        </div>

        {profile && <DashboardNav />}

        <div className={styles.sidebarFooter}>
          <form action={signOut}>
            <button type="submit" className={styles.signOutBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      <main className={styles.main}>
        {profile ? (
          children
        ) : (
          <p className={styles.error}>
            We couldn&apos;t find your profile yet. If you just signed up,
            give it a moment and refresh — otherwise something&apos;s wrong
            with the profile-creation trigger.
          </p>
        )}
      </main>
    </div>
  );
}
