"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../../app/dashboard/dashboard.module.css";

const LINKS = [
  {
    href: "/dashboard",
    label: "Profile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/connections",
    label: "Connections",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/dashboard/embed",
    label: "Embed",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.navList}>
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ""}`}
        >
          {link.icon}
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}
