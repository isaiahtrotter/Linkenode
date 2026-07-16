"use client";

import { MAX_CORNER_RADIUS } from "./widgetStyleShared";
import styles from "./widget-ui.module.css";
import pageStyles from "./dashboard-page.module.css";

export type SelectedFrame = "inline" | null;

type AppearanceValues = { cornerRadius: number; theme: "light" | "dark"; shadow: number };

type AppearanceActions = {
  onRadiusChange: (value: number) => void;
  onShadowChange: (value: number) => void;
  onThemeChange: (value: "light" | "dark") => void;
  onReset: () => void;
};

export default function InspectorPanel({
  selectedFrame,
  onClose,
  appearance,
  appearanceActions,
  onSave,
  saveState,
  saveError,
}: {
  selectedFrame: SelectedFrame;
  onClose: () => void;
  appearance: AppearanceValues;
  appearanceActions: AppearanceActions;
  onSave: () => void;
  saveState: "idle" | "saved" | "error";
  saveError: string | null;
}) {
  const open = selectedFrame !== null;

  return (
    <div
      data-inspector-panel
      className={`${pageStyles.inspectorPanel} ${open ? pageStyles.inspectorPanelOpen : ""}`}
    >
      {selectedFrame === "inline" && (
        <>
          <div className={pageStyles.inspectorHeader}>
            <p className={pageStyles.inspectorTitle}>Appearance</p>
            <button
              type="button"
              className={pageStyles.inspectorCloseBtn}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className={styles.controlLabelRow} style={{ marginBottom: 4, justifyContent: "flex-end" }}>
            <button type="button" className={styles.smallLinkBtn} onClick={appearanceActions.onReset}>
              Reset
            </button>
          </div>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Radius</span>
            <input
              type="range"
              min={0}
              max={MAX_CORNER_RADIUS}
              value={appearance.cornerRadius}
              onChange={(e) => appearanceActions.onRadiusChange(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.controlInlineValue}>{appearance.cornerRadius}px</span>
          </div>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Shadow</span>
            <input
              type="range"
              min={0}
              max={100}
              value={appearance.shadow}
              onChange={(e) => appearanceActions.onShadowChange(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.controlInlineValue}>{appearance.shadow}%</span>
          </div>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Theme</span>
            <div className={styles.themeToggleRow}>
              <button
                type="button"
                className={`${styles.themeOption} ${appearance.theme === "light" ? styles.themeOptionActive : ""}`}
                onClick={() => appearanceActions.onThemeChange("light")}
              >
                Light
              </button>
              <button
                type="button"
                className={`${styles.themeOption} ${appearance.theme === "dark" ? styles.themeOptionActive : ""}`}
                onClick={() => appearanceActions.onThemeChange("dark")}
              >
                Dark
              </button>
            </div>
          </div>

          <button type="button" onClick={onSave} className={styles.btnPrimary} style={{ marginTop: 12 }}>
            {saveState === "saved" ? "Saved!" : saveState === "error" ? "Try again" : "Save appearance"}
          </button>
          {saveError && <p className={styles.error}>{saveError}</p>}
          <p className={styles.hint}>
            Only affects your own widget — this is saved to your profile and used
            everywhere your network is embedded.
          </p>
        </>
      )}
    </div>
  );
}
