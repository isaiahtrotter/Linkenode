"use client";

import { useState } from "react";
import { signOut } from "@/app/dashboard/actions";
import type { DirectoryEntry, Profile, WidgetSettings, WorkSample } from "@/lib/dal";
import { DEFAULT_SETTINGS, MAX_CORNER_RADIUS } from "./widgetStyleShared";
import WidgetPreviewFrame from "./WidgetPreviewFrame";
import ProfileSection from "./ProfileSection";
import WorkSamplesSection from "./WorkSamplesSection";
import ConnectionsSection from "./ConnectionsSection";
import YourNetworkSection from "./YourNetworkSection";
import styles from "./dashboard-page.module.css";
import widgetUiStyles from "./widget-ui.module.css";

type ConnectionsSectionProps = Parameters<typeof ConnectionsSection>[0];
type YourNetworkSectionProps = Parameters<typeof YourNetworkSection>[0];

type ConnectionsData = {
  incoming: ConnectionsSectionProps["incoming"];
  outgoing: ConnectionsSectionProps["outgoing"];
  accepted: YourNetworkSectionProps["accepted"];
};

export default function DashboardPage({
  profile,
  workSamples,
  connections,
}: {
  profile: Profile;
  workSamples: WorkSample[];
  connections: ConnectionsData;
  // Fetched by the page but not rendered right now — the "Everyone in the
  // network" directory is hidden for now (see YourNetworkSection instead),
  // kept in the prop list so it's a one-line change to bring back.
  directory?: DirectoryEntry[];
}) {
  // Merge field-by-field rather than initialSettings ?? DEFAULT_SETTINGS —
  // existing profiles saved their widget_settings under an older schema
  // (missing newer fields entirely), so an all-or-nothing fallback leaves
  // those fields undefined and crashes the controls below.
  const settings: WidgetSettings = { ...DEFAULT_SETTINGS, ...profile.widget_settings };

  // Neither the inline preview (radius/shadow/theme) nor the button style
  // panel is editable right now — both are hidden for now. These just carry
  // the persisted values through so the button preview still renders
  // correctly and nothing gets clobbered if editing comes back later.
  const [buttonFontFamily] = useState(settings.buttonFontFamily);
  const [buttonFontSize] = useState(settings.buttonFontSize);
  const [buttonFontWeight] = useState(settings.buttonFontWeight);
  const [buttonLetterSpacing] = useState(settings.buttonLetterSpacing);
  const [buttonPaddingX] = useState(settings.buttonPaddingX);
  const [buttonPaddingY] = useState(settings.buttonPaddingY);
  const [buttonBorderColor] = useState(settings.buttonBorderColor);
  const [buttonBorderWidth] = useState(settings.buttonBorderWidth);
  const [buttonBorderRadius] = useState(
    Math.min(settings.buttonBorderRadius, MAX_CORNER_RADIUS),
  );
  const [buttonBackgroundColor] = useState(settings.buttonBackgroundColor);
  const [buttonHoverStyle] = useState(settings.buttonHoverStyle);

  // Who's actually in the network right now — changes whenever a connection
  // is added, removed, or merged, regardless of order, so the live preview
  // below can key off it and remount (re-fetch) instead of showing stale data.
  const networkVersion = connections.accepted
    .map((r) => r.other?.id ?? "")
    .filter(Boolean)
    .sort()
    .join(",");

  return (
    <div className={styles.pageShell}>
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <span className={styles.brandIcon}>W</span>
          <span className={styles.brandText}>Worked Together</span>
        </div>
        <form action={signOut}>
          <button type="submit" className={styles.signOutBtn} aria-label="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </form>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Profile</p>
          <div className={widgetUiStyles.mainCol}>
            <ProfileSection profile={profile} />
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Connections</p>
          <div className={widgetUiStyles.mainCol}>
            <ConnectionsSection incoming={connections.incoming} outgoing={connections.outgoing} />
            <YourNetworkSection accepted={connections.accepted} />
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Work samples</p>
          <div className={widgetUiStyles.mainCol}>
            <WorkSamplesSection profileId={profile.id} workSamples={workSamples} />
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Embed</p>
          <WidgetPreviewFrame
            embedKey={profile.embed_key}
            networkVersion={networkVersion}
            buttonStyle={{
              buttonFontFamily,
              buttonFontSize,
              buttonFontWeight,
              buttonLetterSpacing,
              buttonPaddingX,
              buttonPaddingY,
              buttonBorderColor,
              buttonBorderWidth,
              buttonBorderRadius,
              buttonBackgroundColor,
              buttonHoverStyle,
            }}
          />
        </section>
      </main>
    </div>
  );
}
