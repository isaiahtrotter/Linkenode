import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignInButton from "@/components/SignInButton";
import WordmarkLogo from "@/components/WordmarkLogo";
import MarketingHero from "@/components/MarketingHero";
import styles from "./page.module.css";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.logoWrap}>
          <WordmarkLogo height={22} />
        </div>
        <SignInButton />
      </header>

      <MarketingHero />
    </div>
  );
}
