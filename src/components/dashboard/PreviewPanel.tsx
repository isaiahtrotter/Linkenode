"use client";

import { useRef, useState } from "react";
import NetworkWidget from "@/components/NetworkWidget";
import { updateWidgetSettings } from "@/app/dashboard/actions";
import type { WidgetSettings } from "@/lib/dal";
import styles from "./widget-ui.module.css";

const MAX_CORNER_RADIUS = 30;

const DEFAULT_SETTINGS: WidgetSettings = {
  theme: "light",
  cornerRadius: 24,
  shadow: true,
};

export default function PreviewPanel({
  embedKey,
  initialSettings,
}: {
  embedKey: string;
  initialSettings: WidgetSettings | null;
}) {
  const settings = initialSettings ?? DEFAULT_SETTINGS;
  const containerRef = useRef<HTMLDivElement>(null);
  const currentThemeRef = useRef(settings.theme);

  const [cornerRadius, setCornerRadius] = useState(
    Math.min(settings.cornerRadius, MAX_CORNER_RADIUS),
  );
  const [theme, setTheme] = useState(settings.theme);
  const [shadow, setShadow] = useState(settings.shadow);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  function getWidgetRoot(): HTMLElement | null {
    return containerRef.current?.querySelector("#widget-root") ?? null;
  }

  function handleRadiusChange(value: number) {
    setCornerRadius(value);
    getWidgetRoot()?.style.setProperty("--wt-radius", `${value}px`);
  }

  function handleShadowChange(value: boolean) {
    setShadow(value);
    getWidgetRoot()?.style.setProperty(
      "--wt-shadow",
      value ? "0 20px 60px rgba(0,0,0,0.25)" : "none",
    );
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

  function handleSave() {
    setSaveState("saved");
    setSaveError(null);
    setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);

    updateWidgetSettings({ theme, cornerRadius, shadow }).catch((err) => {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Couldn't save appearance.");
    });
  }

  return (
    <>
      <div className={styles.previewCard} ref={containerRef}>
        <NetworkWidget embedKey={embedKey} mode="inline" />
      </div>

      <div className={`${styles.card} ${styles.controlsCard}`}>
        <p className={styles.cardLabel}>Appearance</p>

        <div className={styles.controlRowInline}>
          <span className={styles.controlInlineLabel}>Radius</span>
          <input
            type="range"
            min={0}
            max={MAX_CORNER_RADIUS}
            value={cornerRadius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.controlInlineValue}>{cornerRadius}px</span>
        </div>

        <div className={styles.controlRowInline}>
          <span className={styles.controlInlineLabel}>Theme</span>
          <div className={styles.themeToggleRow}>
            <button
              type="button"
              className={`${styles.themeOption} ${theme === "light" ? styles.themeOptionActive : ""}`}
              onClick={() => handleThemeChange("light")}
            >
              Light
            </button>
            <button
              type="button"
              className={`${styles.themeOption} ${theme === "dark" ? styles.themeOptionActive : ""}`}
              onClick={() => handleThemeChange("dark")}
            >
              Dark
            </button>
          </div>
          <span className={styles.controlInlineLabel} style={{ marginLeft: 6 }}>
            Shadow
          </span>
          <button
            type="button"
            className={`${styles.switch} ${shadow ? styles.switchOn : ""}`}
            onClick={() => handleShadowChange(!shadow)}
            aria-label="Toggle box shadow"
          >
            <span className={styles.switchKnob} />
          </button>
        </div>

        <button type="button" onClick={handleSave} className={styles.btnPrimary}>
          {saveState === "saved"
            ? "Saved!"
            : saveState === "error"
              ? "Try again"
              : "Save appearance"}
        </button>
        {saveError && <p className={styles.error}>{saveError}</p>}
        <p className={styles.hint}>
          Only affects your own widget — this is saved to your profile and
          used everywhere your network is embedded.
        </p>
      </div>
    </>
  );
}
