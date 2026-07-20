import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignInButton from "@/components/SignInButton";
import WordmarkLogo from "@/components/WordmarkLogo";
import PortfolioMockup from "@/components/PortfolioMockup";
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
        <WordmarkLogo height={22} />
        <SignInButton />
      </header>

      <main className={styles.hero}>
        <h1 className={styles.heroHeading}>Bolster your design credibility</h1>
        <p className={styles.heroSubheading}>
          Show your network on your portfolio with a single line of code.
        </p>
        <PortfolioMockup />
      </main>
    </div>
  );
}
