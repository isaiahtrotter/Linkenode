"use client";

import type { ReactNode } from "react";
import { signOut } from "@/app/dashboard/actions";
import styles from "./canvas.module.css";

const SECTIONS: { id: string; label: string; icon: ReactNode }[] = [
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "connections",
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
    id: "widget-preview",
    label: "Widget",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

export default function CanvasNav({
  onNavigate,
  onFitView,
}: {
  onNavigate: (frameId: string) => void;
  onFitView: () => void;
}) {
  return (
    <div className={styles.topBar}>
      <div className={styles.topBarBrand}>
        <span className={styles.topBarBrandIcon}>W</span>
        <span className={styles.topBarBrandText}>Worked Together</span>
      </div>

      <nav className={styles.navPills}>
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={styles.navPill}
            onClick={() => onNavigate(section.id)}
          >
            {section.icon}
            <span>{section.label}</span>
          </button>
        ))}
        <button type="button" className={styles.navPill} onClick={onFitView}>
          Fit view
        </button>
      </nav>

      <div className={styles.topBarRight}>
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
    </div>
  );
}
