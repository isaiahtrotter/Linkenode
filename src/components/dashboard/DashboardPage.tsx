"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { signOut, updateWidgetSettings } from "@/app/dashboard/actions";
import type { DirectoryEntry, Profile, WidgetSettings, WorkSample } from "@/lib/dal";
import { DEFAULT_SETTINGS, MAX_CORNER_RADIUS, shadowCss } from "./widgetStyleShared";
import InspectorPanel from "./InspectorPanel";
import WidgetPreviewFrame from "./WidgetPreviewFrame";
import ProfileSection from "./ProfileSection";
import WorkSamplesSection from "./WorkSamplesSection";
import ConnectionsSection from "./ConnectionsSection";
import NetworkDirectory from "./NetworkDirectory";
import YourNetworkSection from "./YourNetworkSection";
import styles from "./dashboard-page.module.css";
import widgetUiStyles from "./widget-ui.module.css";

type SelectedFrame = "button" | "inline" | null;

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
  directory,
}: {
  profile: Profile;
  workSamples: WorkSample[];
  connections: ConnectionsData;
  directory: DirectoryEntry[];
}) {
  // Merge field-by-field rather than initialSettings ?? DEFAULT_SETTINGS —
  // existing profiles saved their widget_settings under an older schema
  // (missing newer fields entirely), so an all-or-nothing fallback leaves
  // those fields undefined and crashes the controls below.
  const settings: WidgetSettings = { ...DEFAULT_SETTINGS, ...profile.widget_settings };
  // shadow itself used to be a boolean; coerce old saved values to the new
  // 0-100 scale (mirrors the same coercion in the widget engine).
  const rawShadow = settings.shadow as number | boolean;
  const initialShadow = typeof rawShadow === "boolean" ? (rawShadow ? 60 : 0) : rawShadow;

  const containerRef = useRef<HTMLDivElement>(null);
  const currentThemeRef = useRef(settings.theme);

  const [cornerRadius, setCornerRadius] = useState(
    Math.min(settings.cornerRadius, MAX_CORNER_RADIUS),
  );
  const [theme, setTheme] = useState(settings.theme);
  const [shadow, setShadow] = useState(initialShadow);
  const [buttonFontFamily, setButtonFontFamily] = useState(settings.buttonFontFamily);
  const [buttonFontSize, setButtonFontSize] = useState(settings.buttonFontSize);
  const [buttonFontWeight, setButtonFontWeight] = useState(settings.buttonFontWeight);
  const [buttonLetterSpacing, setButtonLetterSpacing] = useState(settings.buttonLetterSpacing);
  const [buttonPaddingX, setButtonPaddingX] = useState(settings.buttonPaddingX);
  const [buttonPaddingY, setButtonPaddingY] = useState(settings.buttonPaddingY);
  const [buttonBorderColor, setButtonBorderColor] = useState(settings.buttonBorderColor);
  const [buttonBorderWidth, setButtonBorderWidth] = useState(settings.buttonBorderWidth);
  const [buttonBorderRadius, setButtonBorderRadius] = useState(settings.buttonBorderRadius);
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState(
    settings.buttonBackgroundColor,
  );
  const [buttonHoverStyle, setButtonHoverStyle] = useState(settings.buttonHoverStyle);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [selectedFrame, setSelectedFrame] = useState<SelectedFrame>(null);

  function getWidgetRoot(): HTMLElement | null {
    return containerRef.current?.querySelector("#widget-root") ?? null;
  }

  function handleRadiusChange(value: number) {
    setCornerRadius(value);
    getWidgetRoot()?.style.setProperty("--wt-radius", `${value}px`);
  }

  function handleShadowChange(value: number) {
    setShadow(value);
    getWidgetRoot()?.style.setProperty("--wt-shadow", shadowCss(value));
  }

  function handleThemeChange(value: "light" | "dark") {
    setTheme(value);
    if (currentThemeRef.current !== value) {
      const toggleBtn = containerRef.current?.querySelector<HTMLButtonElement>(
        "#theme-toggle-btn",
      );
      toggleBtn?.click();
      currentThemeRef.current = value;
    }
  }

  function handleResetAppearance() {
    handleRadiusChange(DEFAULT_SETTINGS.cornerRadius);
    handleShadowChange(DEFAULT_SETTINGS.shadow);
    handleThemeChange(DEFAULT_SETTINGS.theme);
  }

  function handleResetButtonStyle() {
    setButtonFontFamily(DEFAULT_SETTINGS.buttonFontFamily);
    setButtonFontSize(DEFAULT_SETTINGS.buttonFontSize);
    setButtonFontWeight(DEFAULT_SETTINGS.buttonFontWeight);
    setButtonLetterSpacing(DEFAULT_SETTINGS.buttonLetterSpacing);
    setButtonPaddingX(DEFAULT_SETTINGS.buttonPaddingX);
    setButtonPaddingY(DEFAULT_SETTINGS.buttonPaddingY);
    setButtonBorderColor(DEFAULT_SETTINGS.buttonBorderColor);
    setButtonBorderWidth(DEFAULT_SETTINGS.buttonBorderWidth);
    setButtonBorderRadius(DEFAULT_SETTINGS.buttonBorderRadius);
    setButtonBackgroundColor(DEFAULT_SETTINGS.buttonBackgroundColor);
    setButtonHoverStyle(DEFAULT_SETTINGS.buttonHoverStyle);
  }

  function handleSave() {
    setSaveState("saved");
    setSaveError(null);
    setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);

    updateWidgetSettings({
      theme,
      cornerRadius,
      shadow,
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
    }).catch((err) => {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Couldn't save appearance.");
    });
  }

  const selectInline = useCallback(() => setSelectedFrame("inline"), []);
  const selectButton = useCallback(() => setSelectedFrame("button"), []);
  const closeInspector = useCallback(() => setSelectedFrame(null), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedFrame(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Clicking anything that isn't a preview's own select-trigger and isn't
  // inside the inspector panel itself clears the selection.
  const handlePageClick = useCallback((e: ReactMouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-inspector-panel]")) return;
    if (target.closest("[data-select-trigger]")) return;
    setSelectedFrame(null);
  }, []);

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

      <main className={styles.main} onClick={handlePageClick}>
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Profile</p>
          <div className={widgetUiStyles.mainCol}>
            <ProfileSection profile={profile} />
            <WorkSamplesSection profileId={profile.id} workSamples={workSamples} />
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Connections</p>
          <div className={widgetUiStyles.mainCol}>
            <ConnectionsSection incoming={connections.incoming} outgoing={connections.outgoing} />
            <NetworkDirectory initialDirectory={directory} />
            <YourNetworkSection accepted={connections.accepted} />
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Embed</p>
          <WidgetPreviewFrame
            embedKey={profile.embed_key}
            containerRef={containerRef}
            selectedFrame={selectedFrame}
            onSelectInline={selectInline}
            onSelectButton={selectButton}
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

      <InspectorPanel
        selectedFrame={selectedFrame}
        onClose={closeInspector}
        appearance={{ cornerRadius, theme, shadow }}
        appearanceActions={{
          onRadiusChange: handleRadiusChange,
          onShadowChange: handleShadowChange,
          onThemeChange: handleThemeChange,
          onReset: handleResetAppearance,
        }}
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
        buttonStyleActions={{
          onFontFamilyChange: setButtonFontFamily,
          onFontSizeChange: setButtonFontSize,
          onFontWeightChange: setButtonFontWeight,
          onLetterSpacingChange: setButtonLetterSpacing,
          onPaddingXChange: setButtonPaddingX,
          onPaddingYChange: setButtonPaddingY,
          onBorderColorChange: setButtonBorderColor,
          onBorderWidthChange: setButtonBorderWidth,
          onBorderRadiusChange: setButtonBorderRadius,
          onBackgroundColorChange: setButtonBackgroundColor,
          onHoverStyleChange: setButtonHoverStyle,
          onReset: handleResetButtonStyle,
        }}
        onSave={handleSave}
        saveState={saveState}
        saveError={saveError}
      />
    </div>
  );
}
