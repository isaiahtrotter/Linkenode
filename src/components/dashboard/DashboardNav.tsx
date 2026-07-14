"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../../app/dashboard/dashboard.module.css";

const LINKS = [
  { href: "/dashboard", label: "Profile" },
  { href: "/dashboard/connections", label: "Connections" },
  { href: "/dashboard/embed", label: "Embed" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.sideNav}>
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
