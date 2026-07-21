"use client";

import SignInButton from "@/components/SignInButton";
import NetworkWidget from "@/components/NetworkWidget";
import { DEMO_WIDGET_DATA } from "@/lib/demoNetworkData";
import styles from "./MarketingHero.module.css";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="8" cy="8" r="4" />
      <path d="M8 14c-4.4 0-8 2.2-8 5v2h13v-2c0-1.8 1-3.4 2.5-4.4C13.9 14.4 11.2 14 8 14Z" />
      <circle cx="17.5" cy="9.5" r="3.2" opacity="0.7" />
      <path
        d="M17.5 14.9c-.86 0-1.7.1-2.5.29 1.55 1.1 2.5 2.68 2.5 4.51V21h6.5v-1.5c0-2.68-3.13-4.6-6.5-4.6Z"
        opacity="0.7"
      />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: <EyeIcon />,
    title: "Be seen on your friends’ sites",
    body: "Your work and recommendations show up on every portfolio you're connected to.",
  },
  {
    icon: <UsersIcon />,
    title: "Real recommendations",
    body: "Showcase all the recommendations that your connections have written about you",
  },
  {
    icon: <ZapIcon />,
    title: "2 minute setup",
    body: "Put a single line of code in your <body> tag and you’re done.",
  },
];

function toggleDemo() {
  document.dispatchEvent(new CustomEvent("linkenode:toggle"));
}

export default function MarketingHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.leftCol}>
        <h1 className={styles.heading}>
          Your portfolio,
          <br />
          backed by
          <br />
          real designers
        </h1>
        <p className={styles.subheading}>Show the people who vouch for you with one line of code.</p>

        <div className={styles.ctaRow}>
          {/* data-network-widget-open tells the widget engine's own
              outside-click-collapse listener to ignore clicks on this
              button -- otherwise the same click that opens the widget
              (via toggleDemo below) immediately reads as an "outside
              click" and collapses it again, since this button sits
              outside #widget-root. */}
          <button
            type="button"
            className={styles.liveDemoBtn}
            onClick={toggleDemo}
            data-network-widget-open
          >
            Live Demo
          </button>
          <SignInButton />
        </div>

        <div className={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.card}>
              <div className={styles.cardIcon}>{f.icon}</div>
              <div>
                <p className={styles.cardTitle}>{f.title}</p>
                <p className={styles.cardBody}>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.laptopStage}>
        <div className={styles.laptop}>
          <div className={styles.screenOuter}>
            <div className={styles.camera} />
            <div className={styles.screenInner}>
              <div className={styles.portfolioNav}>
                <div className={styles.navAvatar} />
                <div className={styles.navLinks}>
                  <div className={styles.navPill} />
                  <div className={styles.navPill} />
                  <div className={styles.navPill} />
                </div>
              </div>
              <div className={styles.titlePill} />
              <div className={styles.heroBlock} />
              <div className={styles.gridRow}>
                <div className={styles.blobShape} />
                <div className={styles.circleShape} />
                <div className={styles.rectShape} />
              </div>

              <div className={styles.widgetHost}>
                <NetworkWidget embedKey="demo" mode="floating" demoData={DEMO_WIDGET_DATA} />
              </div>
            </div>
          </div>
          <p className={styles.hingeLabel}>MacBook Pro</p>
          <div className={styles.deck}>
            <div className={styles.notch} />
          </div>
        </div>
      </div>
    </div>
  );
}
