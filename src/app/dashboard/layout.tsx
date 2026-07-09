import Link from "next/link";
import { getOwnProfile } from "@/lib/dal";
import { signOut } from "./actions";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getOwnProfile();

  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <div className={styles.navLinks}>
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/profile">Profile</Link>
          <Link href="/dashboard/connections">Connections</Link>
          <Link href="/dashboard/embed">Embed code</Link>
        </div>
        <form action={signOut}>
          <button type="submit" className={styles.signOutBtn}>
            Sign out
          </button>
        </form>
      </nav>
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
