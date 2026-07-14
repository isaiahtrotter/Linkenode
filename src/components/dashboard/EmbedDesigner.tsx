"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import NetworkWidget from "@/components/NetworkWidget";
import { updateWidgetSettings } from "@/app/dashboard/actions";
import type { ButtonHoverStyle, WidgetSettings } from "@/lib/dal";
import styles from "./widget-ui.module.css";

const MAX_CORNER_RADIUS = 30;
const DEFAULT_LABEL = "View My Network";

const DEFAULT_SETTINGS: WidgetSettings = {
  theme: "light",
  cornerRadius: 24,
  shadow: 60,
  buttonFontSize: 13,
  buttonFontWeight: 600,
  buttonLetterSpacing: 0,
  buttonPaddingX: 16,
  buttonPaddingY: 14,
  buttonBorderColor: "#e0ded8",
  buttonBorderWidth: 1,
  buttonBackgroundColor: "#faf9f6",
  buttonHoverStyle: "scale",
};

const HOVER_STYLES: { value: ButtonHoverStyle; label: string }[] = [
  { value: "scale", label: "Scale" },
  { value: "lift", label: "Lift" },
  { value: "glow", label: "Glow" },
  { value: "darken", label: "Darken" },
  { value: "none", label: "None" },
];

const HOVER_STYLE_CLASS: Record<ButtonHoverStyle, string | undefined> = {
  scale: undefined,
  lift: "hoverLift",
  glow: "hoverGlow",
  darken: "hoverDarken",
  none: "hoverNone",
};

type EmbedType = "floating" | "inline";
type Corner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const CORNERS: { value: Corner; label: string }[] = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
];

function shadowCss(intensity: number): string {
  if (intensity <= 0) return "none";
  const offsetY = Math.round(8 + (intensity / 100) * 12);
  const blur = Math.round(20 + (intensity / 100) * 40);
  const opacity = ((intensity / 100) * 0.25).toFixed(3);
  return `0 ${offsetY}px ${blur}px rgba(0,0,0,${opacity})`;
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function LauncherIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <line x1="32" y1="32" x2="14" y2="18" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="50" y2="16" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="16" y2="46" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="48" y2="48" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" />
      <circle cx="14" cy="18" r="6" fill="#D94F2B" />
      <circle cx="50" cy="16" r="6" fill="#AC57D6" />
      <circle cx="16" cy="46" r="6" fill="#128A66" />
      <circle cx="48" cy="48" r="6" fill="#C2477F" />
      <circle cx="32" cy="32" r="9" fill="#1D69E0" />
    </svg>
  );
}

export default function EmbedDesigner({
  embedKey,
  initialSettings,
}: {
  embedKey: string;
  initialSettings: WidgetSettings | null;
}) {
  // Merge field-by-field rather than initialSettings ?? DEFAULT_SETTINGS —
  // existing profiles saved their widget_settings under an older schema
  // (missing newer fields entirely), so an all-or-nothing fallback leaves
  // those fields undefined and crashes the controls below.
  const settings: WidgetSettings = { ...DEFAULT_SETTINGS, ...initialSettings };
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
  const [buttonFontSize, setButtonFontSize] = useState(settings.buttonFontSize);
  const [buttonFontWeight, setButtonFontWeight] = useState(settings.buttonFontWeight);
  const [buttonLetterSpacing, setButtonLetterSpacing] = useState(settings.buttonLetterSpacing);
  const [buttonPaddingX, setButtonPaddingX] = useState(settings.buttonPaddingX);
  const [buttonPaddingY, setButtonPaddingY] = useState(settings.buttonPaddingY);
  const [buttonBorderColor, setButtonBorderColor] = useState(settings.buttonBorderColor);
  const [buttonBorderWidth, setButtonBorderWidth] = useState(settings.buttonBorderWidth);
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState(
    settings.buttonBackgroundColor,
  );
  const [buttonHoverStyle, setButtonHoverStyle] = useState(settings.buttonHoverStyle);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [embedType, setEmbedType] = useState<EmbedType>("floating");
  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [showIcon, setShowIcon] = useState(true);
  const [iconEmoji, setIconEmoji] = useState("");
  const [fillContainer, setFillContainer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

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

  function handleSave() {
    setSaveState("saved");
    setSaveError(null);
    setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);

    updateWidgetSettings({
      theme,
      cornerRadius,
      shadow,
      buttonFontSize,
      buttonFontWeight,
      buttonLetterSpacing,
      buttonPaddingX,
      buttonPaddingY,
      buttonBorderColor,
      buttonBorderWidth,
      buttonBackgroundColor,
      buttonHoverStyle,
    }).catch((err) => {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Couldn't save appearance.");
    });
  }

  const attrs = [`data-embed-key="${embedKey}"`];
  if (embedType === "inline") {
    attrs.push('data-mode="inline"');
  } else {
    if (corner !== "bottom-right") attrs.push(`data-corner="${corner}"`);
    const trimmedLabel = label.trim();
    if (trimmedLabel && trimmedLabel !== DEFAULT_LABEL) {
      attrs.push(`data-label="${escapeAttr(trimmedLabel)}"`);
    }
    if (!showIcon) {
      attrs.push('data-icon="false"');
    } else if (iconEmoji.trim()) {
      attrs.push(`data-icon-emoji="${escapeAttr(iconEmoji.trim())}"`);
    }
  }
  const scriptTag = `<script src="${origin}/widget.js" ${attrs.join(" ")} async></script>`;
  const snippet =
    embedType === "inline"
      ? fillContainer
        ? `<div style="width: 100%; height: 100%;">\n  ${scriptTag}\n</div>`
        : `<div style="width: 480px; height: 600px;">\n  ${scriptTag}\n</div>`
      : scriptTag;

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const mimicStyle: CSSProperties & Record<string, string | number> = {
    paddingTop: buttonPaddingY,
    paddingBottom: buttonPaddingY,
    paddingLeft: buttonPaddingX,
    paddingRight: buttonPaddingX,
    "--mimic-bg": buttonBackgroundColor,
    "--mimic-border-color": buttonBorderColor,
    "--mimic-border-width": `${buttonBorderWidth}px`,
  };
  const hoverClass = HOVER_STYLE_CLASS[buttonHoverStyle];

  return (
    <div className={styles.page}>
      <div className={styles.sideCol}>
        <div className={styles.previewCard} ref={containerRef}>
          <NetworkWidget embedKey={embedKey} mode="inline" />
        </div>

        <div className={styles.buttonPreviewWrap}>
          <div
            className={`${styles.buttonMimic} ${hoverClass ? styles[hoverClass] : ""}`}
            style={mimicStyle}
          >
            {showIcon &&
              (iconEmoji.trim() ? (
                <span style={{ fontSize: 18, lineHeight: 1 }}>{iconEmoji.trim()}</span>
              ) : (
                <LauncherIcon />
              ))}
            <span
              className={styles.buttonMimicLabel}
              style={{
                fontSize: buttonFontSize,
                fontWeight: buttonFontWeight,
                letterSpacing: buttonLetterSpacing,
              }}
            >
              {label.trim() || DEFAULT_LABEL}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.mainCol}>
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
            <span className={styles.controlInlineLabel}>Shadow</span>
            <input
              type="range"
              min={0}
              max={100}
              value={shadow}
              onChange={(e) => handleShadowChange(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.controlInlineValue}>{shadow}%</span>
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
          </div>
        </div>

        <div className={`${styles.card} ${styles.controlsCard}`}>
          <p className={styles.cardLabel}>Button style</p>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Font size</span>
            <input
              type="range"
              min={11}
              max={20}
              value={buttonFontSize}
              onChange={(e) => setButtonFontSize(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.controlInlineValue}>{buttonFontSize}px</span>
          </div>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Weight</span>
            <input
              type="range"
              min={400}
              max={700}
              step={100}
              value={buttonFontWeight}
              onChange={(e) => setButtonFontWeight(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.controlInlineValue}>{buttonFontWeight}</span>
          </div>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Letter spacing</span>
            <input
              type="range"
              min={-1}
              max={3}
              step={0.1}
              value={buttonLetterSpacing}
              onChange={(e) => setButtonLetterSpacing(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.controlInlineValue}>{buttonLetterSpacing.toFixed(1)}px</span>
          </div>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Padding X</span>
            <input
              type="range"
              min={8}
              max={28}
              value={buttonPaddingX}
              onChange={(e) => setButtonPaddingX(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.controlInlineValue}>{buttonPaddingX}px</span>
          </div>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Padding Y</span>
            <input
              type="range"
              min={6}
              max={20}
              value={buttonPaddingY}
              onChange={(e) => setButtonPaddingY(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.controlInlineValue}>{buttonPaddingY}px</span>
          </div>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Background</span>
            <input
              type="color"
              value={buttonBackgroundColor}
              onChange={(e) => setButtonBackgroundColor(e.target.value)}
              className={styles.colorInput}
            />
            <span className={styles.controlInlineLabel} style={{ marginLeft: 8 }}>
              Border
            </span>
            <input
              type="color"
              value={buttonBorderColor}
              onChange={(e) => setButtonBorderColor(e.target.value)}
              className={styles.colorInput}
            />
          </div>

          <div className={styles.controlRowInline}>
            <span className={styles.controlInlineLabel}>Border width</span>
            <input
              type="range"
              min={0}
              max={4}
              value={buttonBorderWidth}
              onChange={(e) => setButtonBorderWidth(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.controlInlineValue}>{buttonBorderWidth}px</span>
          </div>

          <div className={styles.fieldRow}>
            <span className={styles.label}>Hover effect</span>
            <div className={styles.hoverStyleRow}>
              {HOVER_STYLES.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  className={`${styles.modeOption} ${buttonHoverStyle === h.value ? styles.modeOptionActive : ""}`}
                  onClick={() => setButtonHoverStyle(h.value)}
                >
                  {h.label}
                </button>
              ))}
            </div>
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

        <div className={styles.card}>
          <p className={styles.cardLabel}>Embed on your site</p>

          <div className={styles.modeToggle}>
            <button
              type="button"
              onClick={() => setEmbedType("floating")}
              className={`${styles.modeOption} ${embedType === "floating" ? styles.modeOptionActive : ""}`}
            >
              Floating button
            </button>
            <button
              type="button"
              onClick={() => setEmbedType("inline")}
              className={`${styles.modeOption} ${embedType === "inline" ? styles.modeOptionActive : ""}`}
            >
              Inline
            </button>
          </div>

          {embedType === "inline" ? (
            <>
              <p className={styles.hint} style={{ marginBottom: 10 }}>
                Sits directly in your page, always open, and fills whatever
                element you put the script tag in.
              </p>
              <div className={styles.controlRow} style={{ marginBottom: 12 }}>
                <div className={styles.controlLabelRow}>
                  <span>Fill container instead of a fixed size</span>
                  <button
                    type="button"
                    className={`${styles.switch} ${fillContainer ? styles.switchOn : ""}`}
                    onClick={() => setFillContainer((v) => !v)}
                    aria-label="Toggle fill container"
                  >
                    <span className={styles.switchKnob} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.fieldRowGroup}>
                <div className={styles.fieldRow} style={{ flex: "0 0 120px" }}>
                  <span className={styles.label}>Corner</span>
                  <select
                    value={corner}
                    onChange={(e) => setCorner(e.target.value as Corner)}
                    className={styles.input}
                  >
                    {CORNERS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldRow}>
                  <span className={styles.label}>Button text</span>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={DEFAULT_LABEL}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldRow} style={{ flex: "0 0 auto", alignItems: "center" }}>
                  <span className={styles.label}>Icon</span>
                  <button
                    type="button"
                    className={`${styles.switch} ${showIcon ? styles.switchOn : ""}`}
                    onClick={() => setShowIcon((v) => !v)}
                    aria-label="Toggle icon"
                  >
                    <span className={styles.switchKnob} />
                  </button>
                </div>
              </div>

              {showIcon && (
                <div className={styles.fieldRow}>
                  <span className={styles.label}>Custom icon (optional)</span>
                  <input
                    value={iconEmoji}
                    onChange={(e) => setIconEmoji(e.target.value)}
                    placeholder="Paste any emoji, e.g. 👋 — leave blank for the default"
                    className={styles.input}
                  />
                </div>
              )}
            </>
          )}

          <pre className={styles.snippet}>{snippet}</pre>
          <button onClick={copy} className={styles.btnPrimary}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
