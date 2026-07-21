"use client";

import SignInButton from "@/components/SignInButton";
import NetworkWidget from "@/components/NetworkWidget";
import { LauncherIcon } from "@/components/dashboard/widgetStyleShared";
import { DEMO_WIDGET_DATA } from "@/lib/demoNetworkData";
import styles from "./MarketingHero.module.css";

const FEATURES = [
  {
    icon: "/icon-be-seen.png",
    title: "Be seen on your friends’ sites",
    body: "Your work and recommendations show up on every portfolio you're connected to.",
  },
  {
    icon: "/icon-recommendations.png",
    title: "Real recommendations",
    body: "Showcase all the recommendations that your connections have written about you",
  },
  {
    icon: "/icon-setup.png",
    title: "2 minute setup",
    body: "Put a single line of code in your <body> tag and you’re done.",
  },
];

function toggleDemo() {
  document.dispatchEvent(new CustomEvent("linkenode:toggle"));
}

// Same tablet-width breakpoint as MarketingHero.module.css's stacked
// layout -- the widget only auto-opens on the desktop (side-by-side) view;
// on mobile/tablet it stays closed until the user taps .mobileTrigger.
const DESKTOP_BREAKPOINT = 1200;

function openOnDesktop() {
  if (window.innerWidth > DESKTOP_BREAKPOINT) {
    document.dispatchEvent(new CustomEvent("linkenode:open"));
  }
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
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny
                  (16x16) user-provided icon files, used exactly as given. */}
              <div className={styles.cardIcon}>
                <img src={f.icon} alt="" />
              </div>
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
          {/* eslint-disable-next-line @next/next/no-img-element -- this is
              the user-provided laptop mockup asset (public/laptop-mockup.png),
              used exactly as given rather than recreated; next/image's
              remote-loader machinery isn't worth it for one static hero
              asset. */}
          <img src="/laptop-mockup.png" alt="" className={styles.laptopImg} />

          {/* Positioned to match the screen region measured directly out of
              laptop-mockup.png (1220x698 source): left 10.74%, top 2.44%,
              width 79.18%, height 87.39% -- so the real widget's launcher
              pill and expanded panel land exactly on the screen, not
              floating over the aluminum bezel. */}
          <div className={styles.widgetHost}>
            <NetworkWidget
              embedKey="demo"
              mode="floating"
              demoData={DEMO_WIDGET_DATA}
              onReady={openOnDesktop}
            />
          </div>
        </div>
      </div>

      {/* Stand-in for the widget's own launcher pill on mobile/tablet (that
          pill is hidden there via CSS -- it's confined to the shrunk laptop
          screen and too small to comfortably tap). Fixed to the real page
          instead, dispatching the same toggle event. */}
      <button
        type="button"
        className={styles.mobileTrigger}
        onClick={toggleDemo}
        data-network-widget-open
      >
        <LauncherIcon />
        <span>View My Network</span>
      </button>
    </div>
  );
}
