"use client";

import { useState } from "react";
import { LauncherIcon } from "@/components/dashboard/widgetStyleShared";
import styles from "./PortfolioMockup.module.css";

// Static, illustrative graph -- this is a marketing mockup of the widget, not
// the widget itself (the real one needs a live embed_key + Supabase data via
// fetchWidgetData, neither of which exist on the signed-out landing page).
const NODES = [
  { id: "owner", cx: 110, cy: 95, r: 15, fill: "#1c1c1a" },
  { id: "a", cx: 46, cy: 42, r: 10, accent: false },
  { id: "b", cx: 172, cy: 34, r: 10, accent: false },
  { id: "c", cx: 32, cy: 128, r: 10, accent: false },
  { id: "d", cx: 188, cy: 122, r: 10, accent: false },
  { id: "e", cx: 112, cy: 158, r: 11, accent: true },
];

export default function PortfolioMockup() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.laptopWrap}>
      <div className={styles.laptop}>
        <div className={styles.screen}>
          <div className={styles.camera} />
          <div className={styles.viewport}>
            <div className={styles.portfolioNav}>
              <div className={styles.navMark} />
              <div className={styles.navLinks}>
                <div className={styles.navLine} />
                <div className={styles.navLine} />
                <div className={styles.navLine} />
              </div>
            </div>

            <div className={styles.portfolioHero}>
              <div className={styles.blockLg} />
              <div className={styles.blockSm} />
            </div>

            <div className={styles.portfolioGrid}>
              <div className={styles.gridItem} />
              <div className={styles.gridItem} />
              <div className={styles.gridItem} />
            </div>

            <button
              type="button"
              className={`${styles.launcher} ${expanded ? styles.launcherHidden : ""}`}
              onClick={() => setExpanded(true)}
            >
              <LauncherIcon />
              <span className={styles.launcherLabel}>View My Network</span>
            </button>

            <div className={`${styles.panel} ${expanded ? styles.panelOpen : ""}`}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>Your Network</span>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setExpanded(false)}
                  aria-label="Close"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="4" y1="4" x2="20" y2="20" />
                    <line x1="20" y1="4" x2="4" y2="20" />
                  </svg>
                </button>
              </div>
              <svg className={styles.graph} viewBox="0 0 220 180" fill="none">
                {NODES.filter((n) => n.id !== "owner").map((n) => (
                  <line
                    key={`edge-${n.id}`}
                    x1={110}
                    y1={95}
                    x2={n.cx}
                    y2={n.cy}
                    className={n.accent ? styles.edgeAccent : styles.edge}
                  />
                ))}
                {NODES.map((n) => (
                  <circle
                    key={n.id}
                    cx={n.cx}
                    cy={n.cy}
                    r={n.r}
                    className={
                      n.id === "owner" ? styles.nodeOwner : n.accent ? styles.nodeAccent : styles.node
                    }
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
        <div className={styles.base}>
          <div className={styles.notch} />
        </div>
      </div>
    </div>
  );
}
